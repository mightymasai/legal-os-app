/**
 * Admin Metrics API
 * Provides platform-wide analytics for administrators
 * NOTE: This should be protected with admin-only authentication in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PRICING_PLANS } from '@/lib/stripe';

// Use service role for admin queries (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, this is open but should be protected in production

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date('2020-01-01'); // All time
    }

    // Fetch organizations
    const { data: organizations, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (orgsError) throw orgsError;

    // Calculate metrics
    const totalOrganizations = organizations.length;
    const activeSubscriptions = organizations.filter(
      (org) => org.subscription_status === 'active'
    ).length;
    const trialAccounts = organizations.filter(
      (org) => org.subscription_status === 'trialing'
    ).length;

    // Calculate MRR
    let monthlyRecurringRevenue = 0;
    organizations.forEach((org) => {
      const plan = PRICING_PLANS[org.subscription_tier as keyof typeof PRICING_PLANS];
      if (plan?.price && org.subscription_status === 'active') {
        monthlyRecurringRevenue += plan.price * 100; // Convert to cents
      }
    });

    // Subscription breakdown
    const subscriptionBreakdown: Record<string, number> = {
      trial: 0,
      starter: 0,
      professional: 0,
      enterprise: 0,
      white_label: 0,
    };

    organizations.forEach((org) => {
      const tier = org.subscription_tier as keyof typeof subscriptionBreakdown;
      if (tier in subscriptionBreakdown) {
        subscriptionBreakdown[tier]++;
      }
    });

    // Fetch document count
    const { count: totalDocuments } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true });

    // Fetch matter count
    const { count: totalMatters } = await supabaseAdmin
      .from('matters')
      .select('*', { count: 'exact', head: true });

    // Calculate AI credits used this month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: aiInteractions } = await supabaseAdmin
      .from('ai_interactions')
      .select('tokens_used')
      .gte('created_at', firstDayOfMonth.toISOString());

    const aiCreditsUsed = organizations.reduce(
      (sum, org) => sum + (org.ai_credits_used || 0),
      0
    );

    // Recent signups (last 10)
    const recentSignups = organizations
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)
      .map((org) => ({
        id: org.id,
        name: org.name,
        created_at: org.created_at,
        subscription_tier: org.subscription_tier,
      }));

    return NextResponse.json({
      totalOrganizations,
      activeSubscriptions,
      trialAccounts,
      monthlyRecurringRevenue,
      totalDocuments: totalDocuments || 0,
      totalMatters: totalMatters || 0,
      aiCreditsUsed,
      recentSignups,
      subscriptionBreakdown,
    });
  } catch (error: any) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
