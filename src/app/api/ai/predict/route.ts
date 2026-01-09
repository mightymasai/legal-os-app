/**
 * AI Case Prediction API
 * Uses OpenAI to predict case outcomes
 */

import { NextRequest, NextResponse } from 'next/server';
import { predictCaseOutcome, calculateTokenCost } from '@/lib/ai';
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
    const { matterId, caseDetails, similarCases } = await request.json();

    if (!matterId || !caseDetails) {
      return NextResponse.json(
        { error: 'Matter ID and case details are required' },
        { status: 400 }
      );
    }

    // Predict outcome
    const prediction = await predictCaseOutcome({
      caseDetails,
      similarCases,
    });

    // Save prediction to database
    const { data: savedPrediction } = await supabase
      .from('case_predictions')
      .insert({
        organization_id: profile.organization_id,
        matter_id: matterId,
        created_by: user.id,
        predicted_outcome: prediction.predictedOutcome,
        confidence_score: prediction.confidenceScore,
        key_factors: prediction.keyFactors,
        risk_assessment: prediction.riskAssessment,
        risk_factors: prediction.riskFactors,
        recommendations: prediction.recommendations,
        ai_model: 'gpt-4-turbo-preview',
        model_version: '1.0',
      })
      .select()
      .single();

    // Track AI interaction
    const estimatedTokens = Math.ceil(
      (JSON.stringify(caseDetails).length + JSON.stringify(prediction).length) / 4
    );
    const costCents = calculateTokenCost(estimatedTokens, 'gpt-4-turbo-preview');

    await supabase.from('ai_interactions').insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      action: 'case_prediction',
      input_text: JSON.stringify(caseDetails).substring(0, 1000),
      output_text: JSON.stringify(prediction).substring(0, 1000),
      ai_model: 'gpt-4-turbo-preview',
      tokens_used: estimatedTokens,
      cost_cents: costCents,
      matter_id: matterId,
    });

    // Increment AI credits
    await supabase
      .from('organizations')
      .update({ ai_credits_used: org.ai_credits_used + 1 })
      .eq('id', profile.organization_id);

    return NextResponse.json({
      ...prediction,
      predictionId: savedPrediction?.id,
      creditsRemaining: org.ai_credits_monthly - org.ai_credits_used - 1,
    });
  } catch (error: any) {
    console.error('AI prediction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to predict case outcome' },
      { status: 500 }
    );
  }
}
