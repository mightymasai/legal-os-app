/**
 * AI Legal Research API
 * Uses OpenAI to perform legal research
 */

import { NextRequest, NextResponse } from 'next/server';
import { performLegalResearch, calculateTokenCost } from '@/lib/ai';
import { createServerSupabaseClient } from '@/lib/authServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

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
      .select('organization_id, organization:organizations(ai_credits_used, ai_credits_monthly)')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check AI credits
    const org = profile.organization as any;
    if (org.ai_credits_used >= org.ai_credits_monthly) {
      return NextResponse.json(
        { error: 'AI credits exhausted' },
        { status: 429 }
      );
    }

    // Parse request
    const { query, researchType, jurisdiction, matterId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Perform research
    const results = await performLegalResearch({
      query,
      researchType: researchType || 'general',
      jurisdiction,
    });

    // Track usage
    const estimatedTokens = Math.ceil((query.length + JSON.stringify(results).length) / 4);
    const costCents = calculateTokenCost(estimatedTokens, 'gpt-4-turbo-preview');

    // Save research to database
    const { data: research } = await supabase
      .from('legal_research')
      .insert({
        organization_id: profile.organization_id,
        matter_id: matterId || null,
        created_by: user.id,
        query,
        research_type: researchType || 'general',
        jurisdiction: jurisdiction || null,
        results,
        result_count: results.length,
        ai_powered: true,
        ai_model: 'gpt-4-turbo-preview',
      })
      .select()
      .single();

    // Track AI interaction
    await supabase.from('ai_interactions').insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      action: 'legal_research',
      input_text: query,
      output_text: JSON.stringify(results).substring(0, 1000),
      ai_model: 'gpt-4-turbo-preview',
      tokens_used: estimatedTokens,
      cost_cents: costCents,
      matter_id: matterId || null,
    });

    // Increment AI credits
    await supabase
      .from('organizations')
      .update({ ai_credits_used: org.ai_credits_used + 1 })
      .eq('id', profile.organization_id);

    return NextResponse.json({
      results,
      researchId: research?.id,
      creditsRemaining: org.ai_credits_monthly - org.ai_credits_used - 1,
    });
  } catch (error: any) {
    console.error('AI research error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform research' },
      { status: 500 }
    );
  }
}
