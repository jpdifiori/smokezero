import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe safely
const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (stripeSecret) {
    stripe = new Stripe(stripeSecret, {
        apiVersion: '2025-12-15.clover' as any, // Cast to any to avoid strict typing issues if SDK mismatch, but linter suggested this specific string.
    });
}

export async function POST(req: Request) {
    if (!stripe) {
        console.error('Stripe Secret Key is missing');
        return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get User Config (for Customer ID)
        const { data: config } = await supabase
            .schema('smokezero')
            .from('user_config')
            .select('stripe_customer_id, first_name, id')
            .eq('user_id', user.id)
            .single();

        let customerId = config?.stripe_customer_id;

        // 2. Create Stripe Customer if needed
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: config?.first_name || 'SmokeZero User',
                metadata: {
                    supabase_user_id: user.id
                }
            });
            customerId = customer.id;

            // Save to DB
            await supabase
                .schema('smokezero')
                .from('user_config')
                .update({ stripe_customer_id: customerId })
                .eq('user_id', user.id);
        }

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            console.error('STRIPE_PRICE_ID is missing');
            return NextResponse.json({ error: 'Stripe Price ID configuration missing' }, { status: 500 });
        }

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/dashboard?success=true`,
            cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[Stripe Checkout Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
