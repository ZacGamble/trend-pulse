import Stripe from 'stripe';
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as any });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized user token authentication failure', { status: 401 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/matches?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/matches?billing=canceled`,
      metadata: { user_id: user.id }, // Critically binds transaction back to DB primary key
    });

    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    }
    
    return new NextResponse('Error creating checkout session', { status: 500 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
