
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: We need SERVICE_ROLE_KEY to bypass RLS if we want to search by email easily without logging in as them,
// OR we can just login as them if we had the password, but we don't.
// Actually, for a quick check, usually we need the service role key.
// Let's assume we can use the service role key if available in env, otherwise we might be limited.
// Warning: This script relies on env vars being present in the shell or .env.local

// If we can't get service key, we might need to rely on the user being logged in the browser and the logs I added.

// Let's looks for a way to verify DB state without service role.
// I'll try to use the existing `src/lib/supabase/client.ts` or similar if I can, but inside a script I need 'server' access usually.

// Alternative: I will create a temporary server action or modify the page to show debug info on screen.
// But the user asked for validation.

// Let's try to infer if I can read the env file.
require('dotenv').config({ path: '.env.local' });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkUserStats(email) {
    console.log(`Checking stats for ${email}...`);

    // 1. Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found!');
        return;
    }
    console.log('User ID:', user.id);

    // 2. Get Config
    const { data: config, error: configError } = await supabase
        .schema('smokezero')
        .from('user_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (configError) {
        console.error('Config Error:', configError);
    } else {
        console.log('User Config:', config);
    }

    // 3. Get Logs
    const { count: vetoCount } = await supabase
        .schema('smokezero')
        .from('smoke_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'VETO');

    console.log('VETO Count:', vetoCount);

    // 4. Calculate expected
    if (config) {
        const now = new Date();
        const startDate = new Date(config.created_at);
        const diffMs = now.getTime() - startDate.getTime();
        const daysSinceStart = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

        console.log('Days Since Start:', daysSinceStart);
        console.log('Passive Savings (approx cigs):', daysSinceStart * config.cigs_per_day);
    }
}

checkUserStats('juanpablo.difiori@gmail.com');
