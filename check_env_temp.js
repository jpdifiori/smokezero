const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file NOT FOUND');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const keys = new Set();

lines.forEach(line => {
    const match = line.match(/^([^=]+)=/);
    if (match) keys.add(match[1].trim());
});

const required = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('Environment Variable Check (.env.local):');
required.forEach(req => {
    if (keys.has(req)) {
        console.log(`✅ ${req}: FOUND`);
    } else {
        console.log(`❌ ${req}: MISSING`);
    }
});
