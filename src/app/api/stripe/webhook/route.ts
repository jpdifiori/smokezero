import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Use Service Role Key to bypass RLS for webhook updates
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription as string;

                if (userId) {
                    await supabase
                        .schema('smokezero')
                        .from('user_config')
                        .update({
                            stripe_subscription_id: subscriptionId,
                            subscription_status: 'active',
                            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approximate, webhook will update exact date
                        })
                        .eq('user_id', userId);
                    console.log(`[Webhook] User ${userId} subscription activated.`);
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                // We find the user by subscription ID since invoice metadata might be empty
                // But better to use the subscription ID to find the user.

                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({
                        subscription_status: 'active',
                        subscription_end_date: new Date((invoice.period_end || Date.now() / 1000) * 1000).toISOString()
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`[Webhook] Subscription ${subscriptionId} renewed.`);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;

                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({
                        subscription_status: 'past_due'
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`[Webhook] Subscription ${subscriptionId} payment failed.`);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;

                await supabase
                    .schema('smokezero')
                    .from('user_config')
                    .update({
                        subscription_status: 'canceled'
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`[Webhook] Subscription ${subscriptionId} canceled.`);
                break;
            }
        }
    } catch (error) {
        console.error('[Webhook Logic Error]', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return NextResponse.json({ received: true });
}
