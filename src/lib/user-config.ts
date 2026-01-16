'use server';

import { createClient } from '@/lib/supabase/server';

export interface UserConfig {
    user_id: string;
    cigs_per_day: number;
    pack_price: number;
    identity_anchor: 'Atleta' | 'Padre' | 'Libre' | 'Other';
    manifesto_accepted?: boolean;
    manifesto_accepted_at?: string;
    identity_type?: string;
    identity_statement?: string;
    total_identity_votes?: number;
    pack_size?: number;
    setup_completed?: boolean;
}

export async function getUserConfig() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
            console.error('getUserConfig Error:', error);
        }
        return null;
    }

    const configData = data as UserConfig;

    // BACKWARD COMPATIBILITY / SOFT CHECK:
    // Any user with price or cigarettes configured is considered setup-completed.
    if (!configData.setup_completed && (configData.cigs_per_day > 0 || (configData.pack_price && configData.pack_price > 0))) {
        configData.setup_completed = true;
    }

    return configData;
}

export async function updateUserConfig(config: Partial<UserConfig>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .upsert({
            user_id: user.id,
            ...config,
            setup_completed: true, // Always mark as completed when updating from UI
            updated_at: new Date().toISOString()
        });

    if (error) return { error: error.message };
    return { success: true };
}
