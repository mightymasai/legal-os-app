/**
 * AI Service for Legal OS
 * Integrates OpenAI GPT-4 for legal document analysis, drafting, and research
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const FALLBACK_MODEL = 'gpt-3.5-turbo';

// ============================================================================
// LEGAL DOCUMENT ANALYSIS & IMPROVEMENT
// ============================================================================

export interface DocumentImproveParams {
  content: string;
  documentType?: string;
  jurisdiction?: string;
  focusAreas?: string[];
}

export async function improveDocument(
  params: DocumentImproveParams
): Promise<{
  improvedContent: string;
  suggestions: string[];
  changes: Array<{ original: string; improved: string; reason: string }>;
}> {
  const systemPrompt = `You are an expert legal document reviewer and editor.
Your role is to improve legal documents while maintaining their legal validity and intent.
Focus on:
- Clarity and precision
- Proper legal terminology
- Logical structure
- Completeness
- Grammar and formatting

${params.documentType ? `Document type: ${params.documentType}` : ''}
${params.jurisdiction ? `Jurisdiction: ${params.jurisdiction}` : ''}
${params.focusAreas ? `Focus areas: ${params.focusAreas.join(', ')}` : ''}

Provide:
1. An improved version of the document
2. A list of specific suggestions
3. Major changes made with explanations`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Please review and improve this legal document:\n\n${params.content}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      improvedContent: result.improvedContent || params.content,
      suggestions: result.suggestions || [],
      changes: result.changes || [],
    };
  } catch (error) {
    console.error('Document improvement error:', error);
    throw new Error('Failed to improve document');
  }
}

// ============================================================================
// LEGAL RESEARCH
// ============================================================================

export interface LegalResearchParams {
  query: string;
  researchType: 'case_law' | 'statute' | 'regulation' | 'secondary_source' | 'general';
  jurisdiction?: string;
  dateRange?: { start?: string; end?: string };
}

export interface LegalResearchResult {
  title: string;
  citation: string;
  summary: string;
  relevance: number;
  type: string;
  jurisdiction: string;
  date: string;
  keyPoints: string[];
  url?: string;
}

export async function performLegalResearch(
  params: LegalResearchParams
): Promise<LegalResearchResult[]> {
  const systemPrompt = `You are a legal research expert with access to comprehensive legal databases.
Provide accurate, relevant legal research results based on the query.

Research type: ${params.researchType}
${params.jurisdiction ? `Jurisdiction: ${params.jurisdiction}` : 'All jurisdictions'}
${params.dateRange ? `Date range: ${params.dateRange.start || 'any'} to ${params.dateRange.end || 'present'}` : ''}

Return results in JSON format with the following structure for each result:
{
  "title": "Case/statute name",
  "citation": "Proper legal citation",
  "summary": "Brief summary of relevance",
  "relevance": 0-100 score,
  "type": "case_law|statute|regulation|secondary_source",
  "jurisdiction": "Jurisdiction",
  "date": "YYYY-MM-DD",
  "keyPoints": ["Key point 1", "Key point 2"],
  "url": "Optional URL"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Research query: ${params.query}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"results": []}');
    return result.results || [];
  } catch (error) {
    console.error('Legal research error:', error);
    throw new Error('Failed to perform legal research');
  }
}

// ============================================================================
// CASE PREDICTION & ANALYSIS
// ============================================================================

export interface CasePredictionParams {
  caseDetails: {
    type: string;
    description: string;
    jurisdiction: string;
    evidenceStrength?: number;
    witnessCredibility?: number;
    opposingPartyStrength?: number;
    proceduralCompliance?: number;
  };
  similarCases?: Array<{ outcome: string; similarity: number }>;
}

export interface CasePredictionResult {
  predictedOutcome: string;
  confidenceScore: number;
  keyFactors: Array<{ factor: string; weight: number; impact: string }>;
  riskAssessment: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: string[];
  recommendations: string[];
  similarCases: Array<{ title: string; outcome: string; similarity: number }>;
}

export async function predictCaseOutcome(
  params: CasePredictionParams
): Promise<CasePredictionResult> {
  const systemPrompt = `You are a legal analytics expert specializing in case outcome prediction.
Analyze the provided case details and provide a data-driven prediction of the likely outcome.

Consider:
- Strength of evidence
- Witness credibility
- Legal precedents
- Procedural compliance
- Jurisdiction-specific factors

Provide a realistic assessment with confidence scores and risk factors.
Remember: This is an AI prediction to assist attorneys, not replace professional legal judgment.`;

  const userPrompt = `Analyze this case and predict the outcome:

Case Type: ${params.caseDetails.type}
Jurisdiction: ${params.caseDetails.jurisdiction}
Description: ${params.caseDetails.description}

Evidence Strength: ${params.caseDetails.evidenceStrength || 'Unknown'}/100
Witness Credibility: ${params.caseDetails.witnessCredibility || 'Unknown'}/100
Opposing Party Strength: ${params.caseDetails.opposingPartyStrength || 'Unknown'}/100
Procedural Compliance: ${params.caseDetails.proceduralCompliance || 'Unknown'}/100

${params.similarCases ? `Similar cases:\n${params.similarCases.map(c => `- ${c.outcome} (${c.similarity}% similar)`).join('\n')}` : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      predictedOutcome: result.predictedOutcome || 'Unable to predict',
      confidenceScore: result.confidenceScore || 0,
      keyFactors: result.keyFactors || [],
      riskAssessment: result.riskAssessment || 'medium',
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || [],
      similarCases: result.similarCases || [],
    };
  } catch (error) {
    console.error('Case prediction error:', error);
    throw new Error('Failed to predict case outcome');
  }
}

// ============================================================================
// DOCUMENT SUMMARIZATION
// ============================================================================

export interface SummarizeParams {
  content: string;
  maxLength?: number;
  focusAreas?: string[];
}

export async function summarizeDocument(
  params: SummarizeParams
): Promise<{
  summary: string;
  keyPoints: string[];
  entities: Array<{ name: string; type: string }>;
}> {
  const systemPrompt = `You are a legal document summarization expert.
Provide concise, accurate summaries of legal documents, highlighting key points and entities.

${params.focusAreas ? `Focus on: ${params.focusAreas.join(', ')}` : ''}
${params.maxLength ? `Maximum summary length: ${params.maxLength} words` : ''}

Extract:
1. A clear, concise summary
2. Key points (5-7 bullet points)
3. Important entities (parties, dates, amounts, etc.)`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Summarize this document:\n\n${params.content}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      entities: result.entities || [],
    };
  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error('Failed to summarize document');
  }
}

// ============================================================================
// COMPLIANCE CHECKING
// ============================================================================

export interface ComplianceCheckParams {
  content: string;
  documentType: string;
  jurisdiction: string;
  regulations?: string[];
}

export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  location: string;
  suggestion: string;
  regulation?: string;
}

export async function checkCompliance(
  params: ComplianceCheckParams
): Promise<{
  overallCompliance: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  issues: ComplianceIssue[];
  recommendations: string[];
}> {
  const systemPrompt = `You are a legal compliance expert specializing in document review.
Review the provided document for compliance with relevant regulations and best practices.

Document type: ${params.documentType}
Jurisdiction: ${params.jurisdiction}
${params.regulations ? `Specific regulations: ${params.regulations.join(', ')}` : ''}

Identify:
1. Compliance issues (critical, high, medium, low severity)
2. Missing required clauses
3. Regulatory violations
4. Best practice violations

Provide specific, actionable recommendations.`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Check compliance for this document:\n\n${params.content}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      overallCompliance: result.overallCompliance || 'minor_issues',
      issues: result.issues || [],
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error('Compliance check error:', error);
    throw new Error('Failed to check compliance');
  }
}

// ============================================================================
// DOCUMENT DRAFTING
// ============================================================================

export interface DraftDocumentParams {
  documentType: string;
  jurisdiction: string;
  parties: Array<{ role: string; name: string; details?: string }>;
  terms?: Record<string, any>;
  additionalInstructions?: string;
}

export async function draftDocument(
  params: DraftDocumentParams
): Promise<{
  content: string;
  sections: Array<{ title: string; content: string }>;
  warnings: string[];
}> {
  const systemPrompt = `You are an expert legal document drafter.
Create professional, legally sound documents based on the provided parameters.

Document type: ${params.documentType}
Jurisdiction: ${params.jurisdiction}

Include:
- Proper legal structure and formatting
- All required clauses for this document type
- Clear, precise language
- Jurisdiction-specific requirements

IMPORTANT: Include disclaimer that this is AI-generated and should be reviewed by a licensed attorney.`;

  const userPrompt = `Draft a ${params.documentType} with the following details:

Parties:
${params.parties.map(p => `- ${p.role}: ${p.name}${p.details ? ' (' + p.details + ')' : ''}`).join('\n')}

${params.terms ? `Terms:\n${JSON.stringify(params.terms, null, 2)}` : ''}

${params.additionalInstructions ? `Additional instructions:\n${params.additionalInstructions}` : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      content: result.content || '',
      sections: result.sections || [],
      warnings: [
        'This document was AI-generated and should be reviewed by a licensed attorney before use.',
        ...(result.warnings || []),
      ],
    };
  } catch (error) {
    console.error('Document drafting error:', error);
    throw new Error('Failed to draft document');
  }
}

// ============================================================================
// CLAUSE ANALYSIS & SUGGESTIONS
// ============================================================================

export async function analyzeClause(clause: string, context?: string): Promise<{
  analysis: string;
  risks: string[];
  alternatives: string[];
  improvements: string[];
}> {
  const systemPrompt = `You are a legal clause analysis expert.
Analyze the provided clause for risks, ambiguities, and potential improvements.

Provide:
1. Detailed analysis
2. Potential risks or issues
3. Alternative phrasing options
4. Specific improvements`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this clause:\n\n"${clause}"\n\n${context ? `Context: ${context}` : ''}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      analysis: result.analysis || '',
      risks: result.risks || [],
      alternatives: result.alternatives || [],
      improvements: result.improvements || [],
    };
  } catch (error) {
    console.error('Clause analysis error:', error);
    throw new Error('Failed to analyze clause');
  }
}

// ============================================================================
// USAGE TRACKING & COST CALCULATION
// ============================================================================

export interface AIUsageMetrics {
  tokens: number;
  estimatedCostCents: number;
  model: string;
  action: string;
}

export function calculateTokenCost(tokens: number, model: string): number {
  // Pricing per 1K tokens (in cents)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo-preview': { input: 1.0, output: 3.0 },
    'gpt-4': { input: 3.0, output: 6.0 },
    'gpt-3.5-turbo': { input: 0.05, output: 0.15 },
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  // Simplified: assume 50/50 input/output split
  const avgCostPer1k = (modelPricing.input + modelPricing.output) / 2;

  return Math.ceil((tokens / 1000) * avgCostPer1k);
}

// ============================================================================
// STREAMING RESPONSES (for real-time UI)
// ============================================================================

export async function* streamCompletion(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

// ============================================================================
// ERROR HANDLING & FALLBACKS
// ============================================================================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  try {
    return await primaryFn();
  } catch (error: any) {
    console.error('Primary AI service failed:', error);

    if (fallbackFn) {
      console.log('Attempting fallback...');
      return await fallbackFn();
    }

    throw new AIServiceError(
      'AI service unavailable',
      'SERVICE_UNAVAILABLE',
      error
    );
  }
}
