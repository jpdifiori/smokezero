'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NutritionPlan, UserDayCheckin, NutritionSelection } from '@/lib/nutrition/types'

export async function getNutritionPlan(code: string) {
    const supabase = await createClient()
    const { data: plan, error } = await supabase
        .schema('smokezero')
        .from('nutri_plans')
        .select(`
            *,
            templates:nutri_templates (
                *,
                moments:nutri_moments (
                    *,
                    options:nutri_options (*)
                )
            )
        `)
        .eq('code', code)
        .single()

    if (error) {
        // If the error object is generic, try to capture it fully
        const errorJson = JSON.stringify(error, Object.getOwnPropertyNames(error));
        // Ignore PGRST116 (Row not found) which is normal for first load
        if (error.code !== 'PGRST116' && !errorJson.includes('PGRST116')) {
            console.error('Error fetching plan (Full Debug):', errorJson);
        }
        return null
    }

    // Map aliases if necessary (though foreign key names might need to match)
    // Supabase will return the keys as renamed here

    // Sort moments by order
    if (plan.templates) {
        plan.templates.forEach((t: any) => {
            if (t.moments) {
                t.moments.sort((a: any, b: any) => a.order - b.order)
            }
        })
    }

    return plan as NutritionPlan
}

export async function getUserCheckins(planId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: checkins, error } = await supabase
        .schema('smokezero')
        .from('nutri_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', planId)

    if (error) {
        console.error('Error fetching checkins:', error)
        return []
    }

    return checkins
}

export async function toggleDayCompliance(planId: string, dayIndex: number, didComply: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .schema('smokezero')
        .from('nutri_checkins')
        .upsert({
            user_id: user.id,
            plan_id: planId,
            day_index: dayIndex,
            did_comply: didComply,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, plan_id, day_index'
        })

    if (error) {
        console.error('Error toggling compliance:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/nutrition')
    return { success: true }
}

// Importer
export async function importNutritionPlan(planData: any) {
    // We must use the SERVICE_ROLE_KEY to bypass RLS for inserting plans/content
    const { createClient } = await import('@supabase/supabase-js')

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Starting Import. Has Service Key:', hasServiceKey);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in environment.');
        return { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { code, name, description, templates } = planData

    // 1. Upsert Plan
    const { data: plan, error: planError } = await supabase
        .schema('smokezero')
        .from('nutri_plans')
        .upsert({ code, name, description }, { onConflict: 'code' })
        .select()
        .single()

    if (planError) return { error: `Plan Error: ${planError.message}` }

    for (const temp of templates) {
        // 2. Upsert Template
        const { data: template, error: tempError } = await supabase
            .schema('smokezero')
            .from('nutri_templates')
            .upsert({ plan_id: plan.id, code: temp.code, name: temp.name || `Plantilla ${temp.code}` }, { onConflict: 'plan_id, code' })
            .select()
            .single()

        if (tempError) return { error: `Template Error: ${tempError.message}` }

        // Iterate over the new "days" array
        for (const day of temp.days || []) {
            for (const mom of day.moments) {
                // 3. Upsert Moment with day_of_week
                const { data: moment, error: momError } = await supabase
                    .schema('smokezero')
                    .from('nutri_moments')
                    .upsert({
                        template_id: template.id,
                        day_of_week: day.day,
                        code: mom.code,
                        name: mom.name,
                        order: mom.order
                    }, { onConflict: 'template_id, day_of_week, code' })
                    .select()
                    .single()

                if (momError) return { error: `Moment Error: ${momError.message}` }

                // 4. Delete existing options
                await supabase.schema('smokezero').from('nutri_options').delete().eq('moment_id', moment.id)

                // 5. Insert Options
                if (mom.options && mom.options.length > 0) {
                    const optionsPayload = mom.options.map((opt: string) => ({
                        moment_id: moment.id,
                        description: opt,
                        is_recommended: false
                    }))

                    const { error: optError } = await supabase
                        .schema('smokezero')
                        .from('nutri_options')
                        .insert(optionsPayload)

                    if (optError) return { error: `Options Error: ${optError.message}` }
                }
            }
        }
    }

    return { success: true, planId: plan.id }
}

// Seed Action
export async function seedNutritionPlan() {
    try {
        const planData = await import('@/lib/nutrition/default_plan.json');
        const data = planData.default || planData;
        return await importNutritionPlan(data);
    } catch (e: any) {
        console.error('Seed Error:', e);
        return { error: e.message };
    }
}

// --- Selections ---

/**
 * Get user selections for a specific plan
 */
export async function getUserSelections(planId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .schema('smokezero')
        .from('nutri_selections')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', planId)

    if (error) {
        console.error('Error fetching selections:', error)
        return []
    }

    return data as NutritionSelection[]
}

/**
 * Save or update a meal selection
 */
export async function saveMealSelection(
    planId: string,
    dayIndex: number,
    moment_id: string,
    option_id: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No user session' }

    const { data, error } = await supabase
        .schema('smokezero')
        .from('nutri_selections')
        .upsert({
            user_id: user.id,
            plan_id: planId,
            day_index: dayIndex,
            moment_id: moment_id,
            option_id: option_id,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, plan_id, day_index, moment_id' })
        .select()
        .single()

    if (error) {
        console.error('Error saving selection:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/nutrition')
    return { success: true, data }
}
