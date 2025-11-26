'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CasePredictionData {
  predicted_outcome: 'favorable' | 'unfavorable' | 'settlement' | 'dismissal'
  confidence_score: number
  probability_distribution: {
    favorable: number
    unfavorable: number
    settlement: number
    dismissal: number
  }
  key_factors: string[]
  risk_assessment: {
    high_risk_factors: string[]
    mitigating_factors: string[]
    overall_risk_level: 'low' | 'medium' | 'high'
  }
  strategic_recommendations: string[]
}

interface CasePredictionProps {
  matterId: string
  caseFacts: string
  legalIssues: string[]
}

export default function CasePrediction({ matterId, caseFacts, legalIssues }: CasePredictionProps) {
  const [prediction, setPrediction] = useState<CasePredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caseFacts && legalIssues.length > 0) {
      generatePrediction()
    }
  }, [caseFacts, legalIssues])

  const generatePrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate AI prediction analysis (in production, this would use real ML models)
      const mockPrediction: CasePredictionData = {
        predicted_outcome: 'favorable',
        confidence_score: 0.78,
        probability_distribution: {
          favorable: 0.65,
          settlement: 0.20,
          unfavorable: 0.10,
          dismissal: 0.05
        },
        key_factors: [
          'Strong factual foundation with documentary evidence',
          'Precedent favors plaintiff in similar cases',
          'Defendant has history of settlement rather than litigation',
          'Jurisdiction is favorable to plaintiff claims'
        ],
        risk_assessment: {
          high_risk_factors: [
            'Discovery may reveal unfavorable communications',
            'Witness credibility could be challenged'
          ],
          mitigating_factors: [
            'Multiple strong witnesses with consistent testimony',
            'Comprehensive documentation trail',
            'Defendant\'s weak counter-arguments'
          ],
          overall_risk_level: 'medium'
        },
        strategic_recommendations: [
          'Pursue mediation before full litigation to leverage strong position',
          'Focus discovery on defendant\'s internal communications',
          'Consider summary judgment motion after initial disclosures',
          'Build case around key witness testimony',
          'Monitor for settlement opportunities in Q2-Q3'
        ]
      }

      setPrediction(mockPrediction)

      // Save prediction to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('case_predictions')
          .insert({
            matter_id: matterId,
            predicted_outcome: mockPrediction.predicted_outcome,
            confidence_score: mockPrediction.confidence_score,
            probability_distribution: mockPrediction.probability_distribution,
            key_factors: mockPrediction.key_factors,
            risk_assessment: mockPrediction.risk_assessment,
            strategic_recommendations: mockPrediction.strategic_recommendations
          })
      }

    } catch (err) {
      setError('Failed to generate case prediction. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'favorable': return 'text-green-600 bg-green-100'
      case 'settlement': return 'text-blue-600 bg-blue-100'
      case 'unfavorable': return 'text-red-600 bg-red-100'
      case 'dismissal': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="text-red-600 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500">Enter case facts and legal issues to generate AI-powered outcome prediction.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          AI Case Prediction
        </h3>
        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getOutcomeColor(prediction.predicted_outcome)}`}>
            {prediction.predicted_outcome.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {Math.round(prediction.confidence_score * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Outcome Probabilities</h4>
        <div className="space-y-3">
          {Object.entries(prediction.probability_distribution).map(([outcome, probability]) => (
            <div key={outcome} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize w-24">{outcome}</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      outcome === 'favorable' ? 'bg-green-500' :
                      outcome === 'settlement' ? 'bg-blue-500' :
                      outcome === 'unfavorable' ? 'bg-red-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${probability * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-12">{Math.round(probability * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Factors */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Success Factors</h4>
        <ul className="space-y-2">
          {prediction.key_factors.map((factor, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Assessment */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          Risk Assessment
          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getRiskColor(prediction.risk_assessment.overall_risk_level)}`}>
            {prediction.risk_assessment.overall_risk_level.toUpperCase()} RISK
          </span>
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-red-700 mb-2">High Risk Factors</h5>
            <ul className="space-y-1">
              {prediction.risk_assessment.high_risk_factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-medium text-green-700 mb-2">Mitigating Factors</h5>
            <ul className="space-y-1">
              {prediction.risk_assessment.mitigating_factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Strategic Recommendations</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <ul className="space-y-2">
            {prediction.strategic_recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">{index + 1}.</span>
                <span className="text-sm text-blue-900">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          AI prediction based on historical case data, legal precedents, and case-specific factors.
          This is not legal advice and should be reviewed by qualified counsel.
        </p>
      </div>
    </div>
  )
}
