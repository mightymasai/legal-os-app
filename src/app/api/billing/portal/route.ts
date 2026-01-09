/**
 * Stripe Customer Portal API
 * Redirects user to Stripe's customer portal for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBillingPortalSession } from '@/lib/stripe';
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

    // Get user's organization
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

    // Check if organization has a Stripe customer ID
    if (!profile.organization.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create portal session
    const session = await createBillingPortalSession(
      profile.organization.stripe_customer_id,
      `${baseUrl}/dashboard/settings/billing`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
