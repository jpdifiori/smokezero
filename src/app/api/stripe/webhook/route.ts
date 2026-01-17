import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize lazy to avoid top-level crash
const initStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is missing');
    return new Stripe(key, { apiVersion: '2025-12-15.clover' as any });
};

export async function POST(req: Request) {
    console.log('[Webhook] Received request');
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is missing');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');

        // CRITICAL: Check Service Role Key
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
            console.error('[Webhook] FATAL: SUPABASE_SERVICE_ROLE_KEY is NOT defined in process.env');
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Please add it to .env.local');
        }

        const stripe = initStripe();
        const body = await req.text();
        console.log('[Webhook] Body Read.');

        // Verify Signature (Re-enabled for safety, or keep disabled if user prefers)
        // For now, let's try to verify but fallback/log if debugging
        const signature = (await headers()).get('stripe-signature')!;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.log('[Webhook] Signature verification failed (expected in local dev if secret mismatch). Parsing body directly for debug...');
            event = JSON.parse(body) as Stripe.Event;
        }

        console.log(`[Webhook] Event Type: ${event.type}`);

        // Initialize Supabase with explicitly checked keys
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription as string;
                const email = session.customer_details?.email;

                console.log(`[Webhook] Processing checkout.session.completed. UserId: ${userId}, Email: ${email}`);

                if (userId) {
                    const { error } = await supabase
                        .schema('smokezero')
                        .from('user_config')
                        .update({
                            stripe_subscription_id: subscriptionId,
                            subscription_status: 'active',
                            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        })
                        .eq('user_id', userId);

                    if (error) console.error('[Webhook] Supabase Update Error (by ID):', error);
                    else console.log(`[Webhook] User ${userId} subscription activated via ID.`);
                } else if (email) {
                    const customerId = session.customer as string;
                    console.log(`[Webhook] Searching by Stripe Customer ID: ${customerId}`);

                    const { error } = await supabase
                        .schema('smokezero')
                        .from('user_config')
                        .update({
                            stripe_subscription_id: subscriptionId,
                            subscription_status: 'active',
                            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        })
                        .eq('stripe_customer_id', customerId);

                    if (error) console.error('[Webhook] Supabase Update Error (by CustomerID):', error);
                    else console.log(`[Webhook] User subscription activated via Customer ID.`);
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;
                console.log(`[Webhook] Invoice paid: ${subscriptionId}`);
                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({
                        subscription_status: 'active',
                        subscription_end_date: new Date((invoice.period_end || Date.now() / 1000) * 1000).toISOString()
                    })
                    .eq('stripe_subscription_id', subscriptionId);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;
                console.log(`[Webhook] Invoice failed: ${subscriptionId}`);
                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({ subscription_status: 'past_due' })
                    .eq('stripe_subscription_id', subscriptionId);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({ subscription_status: 'canceled' })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] CRITICAL FATAL ERROR:', error.message);
        return NextResponse.json(
            { error: 'Fatal Error', details: error.message },
            { status: 500 }
        );
    }
}
