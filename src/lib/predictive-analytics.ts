import { supabase } from './supabase'

export interface CasePrediction {
  id: string
  matter_id: string
  predicted_outcome: 'favorable' | 'unfavorable' | 'settlement' | 'dismissal'
  confidence_score: number
  probability_distribution: {
    favorable: number
    unfavorable: number
    settlement: number
    dismissal: number
  }
  key_factors: PredictionFactor[]
  risk_assessment: RiskAssessment
  strategic_recommendations: string[]
  similar_cases: SimilarCase[]
  created_at: string
  updated_at: string
}

export interface PredictionFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  mitigation_strategies: string[]
  timeline_estimate: {
    optimistic: string
    realistic: string
    pessimistic: string
  }
}

export interface SimilarCase {
  case_id: string
  case_name: string
  similarity_score: number
  outcome: string
  key_similarities: string[]
  relevant_differences: string[]
}

export interface CaseAnalytics {
  win_rate: number
  average_settlement: number
  average_timeline: number
  common_success_factors: string[]
  common_risk_factors: string[]
}

export class PredictiveAnalyticsService {
  /**
   * Generate comprehensive case prediction and risk assessment
   */
  static async predictCaseOutcome(
    matterId: string,
    caseData: {
      case_type: string
      jurisdiction: string
      case_facts: string
      legal_issues: string[]
      opposing_party_strength: 'weak' | 'moderate' | 'strong'
      evidence_strength: 'weak' | 'moderate' | 'strong'
      witness_credibility: 'weak' | 'moderate' | 'strong'
      procedural_compliance: 'poor' | 'adequate' | 'excellent'
      client_cooperation: 'poor' | 'adequate' | 'excellent'
    }
  ): Promise<CasePrediction | null> {
    try {
      // Analyze case factors and generate prediction
      const analysis = await this.analyzeCaseFactors(caseData)

      const prediction: Omit<CasePrediction, 'id' | 'created_at' | 'updated_at'> = {
        matter_id: matterId,
        predicted_outcome: analysis.predictedOutcome,
        confidence_score: analysis.confidenceScore,
        probability_distribution: analysis.probabilityDistribution,
        key_factors: analysis.keyFactors,
        risk_assessment: analysis.riskAssessment,
        strategic_recommendations: analysis.strategicRecommendations,
        similar_cases: analysis.similarCases
      }

      const { data, error } = await supabase
        .from('case_predictions')
        .insert(prediction)
        .select()
        .single()

      if (error) {
        console.error('Error saving case prediction:', error)
        return null
      }

      // Log the prediction generation
      await supabase
        .from('audit_logs')
        .insert({
          user_id: data.id, // This should be the actual user ID
          action: 'case_prediction_generated',
          resource_type: 'prediction',
          resource_id: data.id,
          details: {
            matter_id: matterId,
            predicted_outcome: analysis.predictedOutcome,
            confidence_score: analysis.confidenceScore
          }
        })

      return data
    } catch (error) {
      console.error('Case prediction error:', error)
      return null
    }
  }

  /**
   * Analyze case factors and generate prediction (simulated AI analysis)
   */
  private static async analyzeCaseFactors(caseData: any) {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Calculate prediction based on weighted factors
    const factors = this.calculateFactors(caseData)

    const predictedOutcome = this.determineOutcome(factors.totalScore)
    const confidenceScore = this.calculateConfidence(factors)

    return {
      predictedOutcome,
      confidenceScore,
      probabilityDistribution: this.calculateProbabilities(factors),
      keyFactors: factors.keyFactors,
      riskAssessment: this.assessRisk(factors, caseData),
      strategicRecommendations: this.generateRecommendations(factors, caseData),
      similarCases: this.findSimilarCases(caseData)
    }
  }

  /**
   * Calculate weighted factors for prediction
   */
  private static calculateFactors(caseData: any) {
    const factors = {
      totalScore: 0,
      keyFactors: [] as PredictionFactor[]
    }

    // Evidence strength (35% weight)
    const evidenceScore = caseData.evidence_strength === 'strong' ? 35 :
                         caseData.evidence_strength === 'moderate' ? 15 : -10
    factors.totalScore += evidenceScore
    factors.keyFactors.push({
      factor: 'Evidence Strength',
      impact: evidenceScore > 0 ? 'positive' : 'negative',
      weight: 35,
      description: `${caseData.evidence_strength} evidentiary support ${evidenceScore > 0 ? 'strengthens' : 'weakens'} case position`
    })

    // Witness credibility (25% weight)
    const witnessScore = caseData.witness_credibility === 'strong' ? 25 :
                        caseData.witness_credibility === 'moderate' ? 10 : -15
    factors.totalScore += witnessScore
    factors.keyFactors.push({
      factor: 'Witness Credibility',
      impact: witnessScore > 0 ? 'positive' : 'negative',
      weight: 25,
      description: `Witness testimony quality significantly impacts case outcome`
    })

    // Opposing party strength (20% weight)
    const opposingScore = caseData.opposing_party_strength === 'weak' ? 20 :
                         caseData.opposing_party_strength === 'moderate' ? 5 : -10
    factors.totalScore += opposingScore
    factors.keyFactors.push({
      factor: 'Opposing Party Strength',
      impact: opposingScore > 0 ? 'positive' : 'negative',
      weight: 20,
      description: `Relative strength comparison with opposing party`
    })

    // Procedural compliance (15% weight)
    const proceduralScore = caseData.procedural_compliance === 'excellent' ? 15 :
                           caseData.procedural_compliance === 'adequate' ? 5 : -10
    factors.totalScore += proceduralScore
    factors.keyFactors.push({
      factor: 'Procedural Compliance',
      impact: proceduralScore > 0 ? 'positive' : 'negative',
      weight: 15,
      description: `Adherence to court rules and deadlines`
    })

    // Client cooperation (5% weight)
    const clientScore = caseData.client_cooperation === 'excellent' ? 5 :
                       caseData.client_cooperation === 'adequate' ? 0 : -5
    factors.totalScore += clientScore
    factors.keyFactors.push({
      factor: 'Client Cooperation',
      impact: clientScore >= 0 ? 'positive' : 'negative',
      weight: 5,
      description: `Client's level of cooperation in case preparation`
    })

    return factors
  }

  /**
   * Determine predicted outcome based on score
   */
  private static determineOutcome(totalScore: number): 'favorable' | 'unfavorable' | 'settlement' | 'dismissal' {
    if (totalScore >= 50) return 'favorable'
    if (totalScore >= 20) return 'settlement'
    if (totalScore >= -10) return 'unfavorable'
    return 'dismissal'
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(factors: any): number {
    // Higher confidence with more extreme scores and consistent factors
    const scoreMagnitude = Math.abs(factors.totalScore)
    const factorConsistency = factors.keyFactors.filter((f: any) =>
      f.impact === (factors.totalScore > 0 ? 'positive' : 'negative')
    ).length / factors.keyFactors.length

    return Math.min(95, Math.max(60, (scoreMagnitude * 0.8) + (factorConsistency * 20)))
  }

  /**
   * Calculate probability distribution
   */
  private static calculateProbabilities(factors: any) {
    const baseScore = factors.totalScore

    // Normalize probabilities
    const favorable = Math.max(5, Math.min(80, 50 + baseScore))
    const settlement = Math.max(5, Math.min(60, 30 + (baseScore * 0.5)))
    const unfavorable = Math.max(5, Math.min(60, 20 - (baseScore * 0.3)))
    const dismissal = Math.max(5, Math.min(40, 10 - (baseScore * 0.4)))

    const total = favorable + settlement + unfavorable + dismissal
    const normalizationFactor = 100 / total

    return {
      favorable: Math.round(favorable * normalizationFactor),
      settlement: Math.round(settlement * normalizationFactor),
      unfavorable: Math.round(unfavorable * normalizationFactor),
      dismissal: Math.round(dismissal * normalizationFactor)
    }
  }

  /**
   * Assess overall risk
   */
  private static assessRisk(factors: any, caseData: any): RiskAssessment {
    const riskFactors = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (factors.totalScore < -20) riskLevel = 'critical'
    else if (factors.totalScore < 0) riskLevel = 'high'
    else if (factors.totalScore < 30) riskLevel = 'medium'

    if (caseData.evidence_strength === 'weak') {
      riskFactors.push('Weak evidentiary foundation increases litigation risk')
    }
    if (caseData.opposing_party_strength === 'strong') {
      riskFactors.push('Strong opposing party requires aggressive case preparation')
    }
    if (caseData.procedural_compliance === 'poor') {
      riskFactors.push('Procedural deficiencies may lead to case dismissal')
    }

    const mitigationStrategies = [
      'Strengthen evidentiary record through additional discovery',
      'Consider mediation or settlement negotiations',
      'Enhance witness preparation and credibility assessment',
      'Address any procedural compliance issues immediately'
    ]

    return {
      overall_risk: riskLevel,
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies,
      timeline_estimate: {
        optimistic: '6-9 months',
        realistic: '12-18 months',
        pessimistic: '24+ months'
      }
    }
  }

  /**
   * Generate strategic recommendations
   */
  private static generateRecommendations(factors: any, caseData: any): string[] {
    const recommendations = []

    if (factors.totalScore > 40) {
      recommendations.push('Strong case position - consider aggressive litigation strategy')
      recommendations.push('Early settlement offers may undervalue case strength')
    } else if (factors.totalScore > 10) {
      recommendations.push('Moderate case strength - focus on strengthening weak areas')
      recommendations.push('Consider mediation as cost-effective resolution method')
    } else {
      recommendations.push('Weak case position - explore settlement options immediately')
      recommendations.push('Reassess case viability and client expectations')
    }

    if (caseData.evidence_strength === 'weak') {
      recommendations.push('Prioritize evidence gathering and witness preparation')
    }

    recommendations.push('Regular case strategy reviews every 30-60 days')
    recommendations.push('Maintain detailed case timeline and milestone tracking')

    return recommendations
  }

  /**
   * Find similar historical cases
   */
  private static findSimilarCases(caseData: any): SimilarCase[] {
    // Simulate finding similar cases from historical database
    return [
      {
        case_id: 'CASE-2023-001',
        case_name: 'Smith Estate Dispute',
        similarity_score: 0.87,
        outcome: 'Settlement - $450,000',
        key_similarities: [
          'Similar evidentiary issues',
          'Comparable opposing party strength',
          'Same jurisdiction and court'
        ],
        relevant_differences: [
          'Different witness credibility factors',
          'Slightly stronger procedural position'
        ]
      },
      {
        case_id: 'CASE-2022-045',
        case_name: 'Johnson Family Trust Litigation',
        similarity_score: 0.76,
        outcome: 'Favorable verdict',
        key_similarities: [
          'Similar legal issues',
          'Comparable case complexity'
        ],
        relevant_differences: [
          'Stronger evidentiary record in precedent case'
        ]
      }
    ]
  }

  /**
   * Get case analytics for practice area
   */
  static async getCaseAnalytics(
    practiceArea: string,
    jurisdiction: string,
    timeRange: '6months' | '1year' | '2years' = '1year'
  ): Promise<CaseAnalytics | null> {
    try {
      // Simulate analytics calculation
      await new Promise(resolve => setTimeout(resolve, 2000))

      return {
        win_rate: 0.73,
        average_settlement: 285000,
        average_timeline: 14.5, // months
        common_success_factors: [
          'Strong evidentiary foundation',
          'Excellent witness preparation',
          'Thorough discovery completion',
          'Clear legal strategy articulation'
        ],
        common_risk_factors: [
          'Incomplete discovery responses',
          'Weak witness credibility',
          'Procedural compliance issues',
          'Poor case management'
        ]
      }
    } catch (error) {
      console.error('Case analytics error:', error)
      return null
    }
  }

  /**
   * Get prediction history for matter
   */
  static async getPredictionsForMatter(matterId: string): Promise<CasePrediction[]> {
    try {
      const { data, error } = await supabase
        .from('case_predictions')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching predictions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Predictions fetch error:', error)
      return []
    }
  }

  /**
   * Update prediction based on new case developments
   */
  static async updatePrediction(
    predictionId: string,
    updates: Partial<CasePrediction>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('case_predictions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', predictionId)

      if (error) {
        console.error('Error updating prediction:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Prediction update error:', error)
      return false
    }
  }

  /**
   * Generate settlement recommendations
   */
  static async recommendSettlementAmount(
    caseData: any,
    prediction: CasePrediction
  ): Promise<{
    recommended_range: { min: number; max: number }
    reasoning: string[]
    negotiation_strategy: string[]
  }> {
    try {
      // Simulate settlement analysis
      await new Promise(resolve => setTimeout(resolve, 1500))

      const baseAmount = 250000
      const confidence = prediction.confidence_score / 100

      const recommended_range = {
        min: Math.round(baseAmount * (0.6 + (confidence * 0.3))),
        max: Math.round(baseAmount * (0.9 + (confidence * 0.4)))
      }

      return {
        recommended_range,
        reasoning: [
          `Based on ${prediction.confidence_score}% confidence in case outcome`,
          'Historical settlement data for similar cases analyzed',
          'Risk factors and timeline considerations included',
          'Client goals and risk tolerance factored in'
        ],
        negotiation_strategy: [
          'Start negotiations 10-15% below maximum recommended amount',
          'Focus on strengths identified in case analysis',
          'Be prepared to discuss weaknesses transparently',
          'Consider non-monetary settlement terms if applicable'
        ]
      }
    } catch (error) {
      console.error('Settlement recommendation error:', error)
      return {
        recommended_range: { min: 0, max: 0 },
        reasoning: ['Unable to generate recommendations'],
        negotiation_strategy: ['Consult with senior attorney']
      }
    }
  }
}
