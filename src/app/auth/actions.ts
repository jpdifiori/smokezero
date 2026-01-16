'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error.message);
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    console.log('Redirecting to /dashboard')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cigs_per_day = parseInt(formData.get('cigs_per_day') as string)
    const pack_price_input = parseFloat(formData.get('pack_price') as string)
    const pack_size = parseInt(formData.get('pack_size') as string)

    const normalized_pack_price = pack_size === 10 ? pack_price_input * 2 : pack_price_input

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                cigs_per_day,
                pack_price: normalized_pack_price,
                identity_anchor: 'Libre'
            }
        }
    })

    if (authError) {
        return redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Account created. Please sign in.')
}

export async function saveConfig(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const cigs_per_day = parseInt(formData.get('cigs_per_day') as string)
    const pack_price_input = parseFloat(formData.get('pack_price') as string)
    const pack_size = parseInt(formData.get('pack_size') as string)

    const normalized_pack_price = pack_size === 10 ? pack_price_input * 2 : pack_price_input

    const { error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .upsert({
            user_id: user.id,
            cigs_per_day: cigs_per_day,
            pack_price: normalized_pack_price,
            pack_size: pack_size,
            setup_completed: true,
            identity_anchor: 'Libre'
        })

    if (error) {
        console.error('Error saving config:', error)
        return redirect(`/setup?error=${encodeURIComponent(error.message)}`)
    }

    console.log('Config saved successfully for user:', user.id)

    revalidatePath('/', 'layout')
    console.log('Redirecting to /dashboard')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function acceptManifesto(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const identity_statement = formData.get('identity_statement') as string

    const { error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .update({
            manifesto_accepted: true,
            manifesto_accepted_at: new Date().toISOString(),
            identity_statement: identity_statement
        })
        .eq('user_id', user.id)

    if (error) {
        console.error('Error accepting manifesto:', error)
        return
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function saveIdentity(identity: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .update({
            identity_type: identity,
            identity_anchor: identity as any, // Sync anchor for AI prompt
            setup_completed: true // Reinforce setup status
        })
        .eq('user_id', user.id)

    if (error) {
        console.error('Error saving identity:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect(`/manifesto?type=${encodeURIComponent(identity)}`)
}
