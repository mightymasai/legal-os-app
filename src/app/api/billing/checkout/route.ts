/**
 * Stripe Checkout Session API
 * Creates a checkout session for subscription signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRICING_PLANS } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/authServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile and organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organization:organizations(*)')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.organization) {
      return NextResponse.json(
        { error: 'Profile or organization not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const { planId, annualBilling = false } = await request.json();

    // Validate plan
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await createCheckoutSession({
      priceId: plan.priceId,
      customerId: profile.organization.stripe_customer_id,
      successUrl: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      metadata: {
        organization_id: profile.organization.id,
        user_id: user.id,
        plan_id: planId,
      },
      trialDays: profile.organization.subscription_status === 'trialing' ? undefined : 14,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
