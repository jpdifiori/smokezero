const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seed() {
    const supabaseUrl = 'https://nzgytmmuevkusjceehbn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56Z3l0bW11ZXZrdXNqY2VlaGJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyODU0OCwiZXhwIjoyMDgyMTA0NTQ4fQ.UEdTO9JK_1U95Q3yh_p5VHiDLQ5mdLkX0wbKHshAI6s';

    const supabase = createClient(supabaseUrl, supabaseKey);

    const planPath = path.join(__dirname, '../src/lib/nutrition/default_plan.json');
    const planData = JSON.parse(fs.readFileSync(planPath, 'utf8'));

    console.log(`Seeding plan: ${planData.name}...`);

    // 1. Upsert Plan
    const { data: plan, error: planError } = await supabase
        .schema('smokezero')
        .from('nutri_plans')
        .upsert({
            code: planData.code,
            name: planData.name,
            description: planData.description
        }, { onConflict: 'code' })
        .select()
        .single();

    if (planError) {
        console.error('Plan Error:', planError);
        return;
    }

    console.log(`Plan ${plan.code} upserted. ID: ${plan.id}`);

    for (const temp of planData.templates) {
        // 2. Upsert Template
        const { data: template, error: tempError } = await supabase
            .schema('smokezero')
            .from('nutri_templates')
            .upsert({
                plan_id: plan.id,
                code: temp.code,
                name: temp.name || `Plantilla ${temp.code}`
            }, { onConflict: 'plan_id, code' })
            .select()
            .single();

        if (tempError) {
            console.error('Template Error:', tempError);
            continue;
        }

        console.log(`  Template ${template.code} upserted.`);

        // New nested loop for "days"
        for (const dayData of (temp.days || [])) {
            console.log(`    Processing Day ${dayData.day}...`);
            for (const mom of dayData.moments) {
                // 3. Upsert Moment
                const { data: moment, error: momError } = await supabase
                    .schema('smokezero')
                    .from('nutri_moments')
                    .upsert({
                        template_id: template.id,
                        day_of_week: dayData.day,
                        code: mom.code,
                        name: mom.name,
                        order: mom.order
                    }, { onConflict: 'template_id, day_of_week, code' })
                    .select()
                    .single();

                if (momError) {
                    console.error('Moment Error:', momError);
                    continue;
                }

                // 4. Delete existing options
                await supabase.schema('smokezero').from('nutri_options').delete().eq('moment_id', moment.id);

                // 5. Insert Options
                if (mom.options && mom.options.length > 0) {
                    const optionsPayload = mom.options.map((opt) => ({
                        moment_id: moment.id,
                        description: opt,
                        is_recommended: false
                    }));

                    const { error: optError } = await supabase
                        .schema('smokezero')
                        .from('nutri_options')
                        .insert(optionsPayload);

                    if (optError) {
                        console.error('Options Error:', optError);
                    }
                }
            }
        }
    }

    console.log('Seeding completed successfully!');
}

seed();
