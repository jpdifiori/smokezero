import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Use latest or matching api version
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
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

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Defined in .env
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
    } catch (error) {
        console.error('[Stripe Checkout Error]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
