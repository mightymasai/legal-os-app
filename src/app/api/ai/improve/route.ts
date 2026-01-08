/**
 * AI Document Improvement API
 * Uses OpenAI to analyze and improve legal documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { improveDocument, calculateTokenCost } from '@/lib/ai';
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
        {
          error: 'AI credits exhausted',
          message: 'Your organization has used all AI credits for this month. Please upgrade your plan.',
        },
        { status: 429 }
      );
    }

    // Parse request
    const { content, documentType, jurisdiction, focusAreas } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Call AI service
    const result = await improveDocument({
      content,
      documentType,
      jurisdiction,
      focusAreas,
    });

    // Track AI usage
    const estimatedTokens = Math.ceil((content.length + JSON.stringify(result).length) / 4);
    const costCents = calculateTokenCost(estimatedTokens, 'gpt-4-turbo-preview');

    await supabase.from('ai_interactions').insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      action: 'document_improve',
      input_text: content.substring(0, 1000), // Store first 1000 chars
      output_text: JSON.stringify(result).substring(0, 1000),
      ai_model: 'gpt-4-turbo-preview',
      tokens_used: estimatedTokens,
      cost_cents: costCents,
    });

    // Increment AI credits used
    await supabase
      .from('organizations')
      .update({ ai_credits_used: org.ai_credits_used + 1 })
      .eq('id', profile.organization_id);

    return NextResponse.json({
      ...result,
      creditsRemaining: org.ai_credits_monthly - org.ai_credits_used - 1,
    });
  } catch (error: any) {
    console.error('AI improvement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to improve document' },
      { status: 500 }
    );
  }
}
