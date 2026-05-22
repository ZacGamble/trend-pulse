import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as any });

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: 'active',
              tier: 'premium',
            })
            .eq('id', userId);
            
          if (error) {
            console.error('Supabase Update Error:', error);
          } else {
            console.log(`Successfully upgraded user ${userId} to premium!`);
          }
        } else {
          console.error('No user_id found in session metadata');
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // If the status is not active/trialing, downgrade them
        if (subscription.status === 'unpaid' || subscription.status === 'past_due' || subscription.status === 'canceled') {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              tier: 'free',
            })
            .eq('stripe_customer_id', subscription.customer as string);
        } else if (subscription.status === 'active' || subscription.status === 'trialing') {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              tier: 'premium',
            })
            .eq('stripe_customer_id', subscription.customer as string);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            tier: 'free',
          })
          .eq('stripe_customer_id', subscription.customer as string);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error(`Webhook handler failed: ${err.message}`);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}
