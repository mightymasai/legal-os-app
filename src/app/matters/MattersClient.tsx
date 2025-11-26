'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LegalResearchService } from '@/lib/legal-research'
import { PredictiveAnalyticsService } from '@/lib/predictive-analytics'

interface Matter {
  id: string
  title: string
  description?: string
  status: 'active' | 'closed' | 'pending' | 'settled'
  case_number?: string
  court?: string
  opposing_party?: string
  deadline?: string
  created_at: string
  updated_at: string
  client?: {
    name: string
    email: string
  }
  documents?: Array<{
    id: string
    title: string
    status: string
    created_at: string
  }>
}

export default function MattersClient() {
  const router = useRouter()
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    description: '',
    case_number: '',
    court: '',
    opposing_party: '',
    deadline: '',
    status: 'active' as const,
    case_type: '',
    jurisdiction: '',
    intake_data: {} as Record<string, any>
  })

  // Legal Research State
  const [showResearch, setShowResearch] = useState(false)
  const [researchQuery, setResearchQuery] = useState('')
  const [researchType, setResearchType] = useState<'case_law' | 'statute' | 'regulation' | 'secondary_source' | 'general'>('general')
  const [researchResults, setResearchResults] = useState<any[]>([])
  const [researching, setResearching] = useState(false)

  // Predictive Analytics State
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyticsForm, setAnalyticsForm] = useState({
    case_type: '',
    jurisdiction: '',
    case_facts: '',
    legal_issues: '',
    opposing_party_strength: 'moderate' as const,
    evidence_strength: 'moderate' as const,
    witness_credibility: 'moderate' as const,
    procedural_compliance: 'adequate' as const,
    client_cooperation: 'adequate' as const
  })

  useEffect(() => {
    loadMatters()
  }, [])

  const loadMatters = async () => {
    try {
      const response = await fetch('/api/matters')
      if (response.ok) {
        const data = await response.json()
        setMatters(data.matters)
      }
    } catch (error) {
      console.error('Error loading matters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setMatters(prev => [data.matter, ...prev])
        setFormData({
          title: '',
          client_id: '',
          description: '',
          case_number: '',
          court: '',
          opposing_party: '',
          deadline: '',
          status: 'active'
        })
        setShowCreateForm(false)
      } else {
        console.error('Failed to create matter')
      }
    } catch (error) {
      console.error('Error creating matter:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleLegalResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!researchQuery.trim()) return

    setResearching(true)
    try {
      const research = await LegalResearchService.performResearch(
        'current-user-id', // This should come from auth context
        researchQuery,
        researchType,
        formData.court // Use jurisdiction from matter
      )

      if (research) {
        setResearchResults(research.results)
      }
    } catch (error) {
      console.error('Research error:', error)
    } finally {
      setResearching(false)
    }
  }

  const handlePredictiveAnalytics = async (e: React.FormEvent) => {
    e.preventDefault()
    setAnalyzing(true)

    try {
      const prediction = await PredictiveAnalyticsService.predictCaseOutcome(
        'temp-matter-id', // This would be the actual matter ID
        {
          ...analyticsForm,
          legal_issues: analyticsForm.legal_issues.split(',').map(s => s.trim())
        }
      )

      if (prediction) {
        setAnalyticsData(prediction)
      }
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredMatters = matters.filter(matter => {
    if (filter === 'all') return true
    return matter.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'settled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matters...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="container mx-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Case Matters</h1>
              <p className="text-xl text-gray-600">Manage your legal cases and matters</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              + New Matter
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            {(['all', 'active', 'closed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All Matters' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Create Matter Form */}
          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Matter</h2>
              <form onSubmit={handleCreateMatter} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matter Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Smith vs. Johnson Contract Dispute"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Number
                    </label>
                    <input
                      type="text"
                      value={formData.case_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2024-CV-00123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the matter..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Court/Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={formData.court}
                      onChange={(e) => setFormData(prev => ({ ...prev, court: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Superior Court of California"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opposing Party
                    </label>
                    <input
                      type="text"
                      value={formData.opposing_party}
                      onChange={(e) => setFormData(prev => ({ ...prev, opposing_party: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ABC Corporation"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                      <option value="settled">Settled</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Type (for Automation)
                    </label>
                    <select
                      value={formData.case_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select case type...</option>
                      <option value="contract_dispute">Contract Dispute</option>
                      <option value="tort_liability">Tort Liability</option>
                      <option value="estate_planning">Estate Planning</option>
                      <option value="corporate_litigation">Corporate Litigation</option>
                      <option value="employment_law">Employment Law</option>
                      <option value="intellectual_property">Intellectual Property</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                      placeholder="e.g., California, Federal Court"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {formData.case_type && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">🤖 Automated Workflow Available!</h4>
                    <p className="text-blue-800 mb-3">
                      Based on your case type, we can automatically generate documents, set deadlines, and manage the entire case lifecycle.
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <p className="text-sm text-gray-700">
                        <strong>What will happen:</strong> We'll create initial documents, set up court deadlines,
                        schedule client tasks, and send automated notifications. You'll get a complete case management workflow instantly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Matter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Legal Research Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Legal Research Assistant</h2>
              <button
                onClick={() => setShowResearch(!showResearch)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                {showResearch ? 'Hide Research' : 'Research Legal Issues'}
              </button>
            </div>

            {showResearch && (
              <div className="space-y-6">
                <form onSubmit={handleLegalResearch} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Research Query
                      </label>
                      <input
                        type="text"
                        value={researchQuery}
                        onChange={(e) => setResearchQuery(e.target.value)}
                        placeholder="e.g., undue influence in estate planning"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Research Type
                      </label>
                      <select
                        value={researchType}
                        onChange={(e) => setResearchType(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="case_law">Case Law</option>
                        <option value="statute">Statutes</option>
                        <option value="regulation">Regulations</option>
                        <option value="secondary_source">Secondary Sources</option>
                        <option value="general">General Research</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={researching}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {researching ? 'Researching...' : 'Perform Legal Research'}
                  </button>
                </form>

                {/* Research Results */}
                {researchResults.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Research Results</h3>
                    <div className="space-y-4">
                      {researchResults.map((result, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{result.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {Math.round(result.relevance_score * 100)}% relevant
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-3">{result.summary}</p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span><strong>Source:</strong> {result.source}</span>
                              <span><strong>Citation:</strong> {result.citation}</span>
                              {result.publication_date && (
                                <span><strong>Date:</strong> {new Date(result.publication_date).toLocaleDateString()}</span>
                              )}
                            </div>
                            {result.url && (
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Full Text →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Predictive Analytics Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Case Prediction & Risk Assessment</h2>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                {showAnalytics ? 'Hide Analytics' : 'Predict Case Outcome'}
              </button>
            </div>

            {showAnalytics && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">AI-Powered Case Analysis</h3>
                      <p className="text-blue-800">
                        Our advanced AI analyzes thousands of historical cases to predict outcomes and assess risks.
                        Get data-driven insights to make better strategic decisions.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePredictiveAnalytics} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Case Type
                      </label>
                      <select
                        value={analyticsForm.case_type}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, case_type: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select case type...</option>
                        <option value="contract_dispute">Contract Dispute</option>
                        <option value="tort_liability">Tort Liability</option>
                        <option value="estate_planning">Estate Planning</option>
                        <option value="corporate_litigation">Corporate Litigation</option>
                        <option value="employment_law">Employment Law</option>
                        <option value="intellectual_property">Intellectual Property</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={analyticsForm.jurisdiction}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, jurisdiction: e.target.value }))}
                        placeholder="e.g., California Superior Court"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Facts Summary
                    </label>
                    <textarea
                      value={analyticsForm.case_facts}
                      onChange={(e) => setAnalyticsForm(prev => ({ ...prev, case_facts: e.target.value }))}
                      rows={4}
                      placeholder="Brief summary of key case facts, evidence, and circumstances..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Issues (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={analyticsForm.legal_issues}
                      onChange={(e) => setAnalyticsForm(prev => ({ ...prev, legal_issues: e.target.value }))}
                      placeholder="e.g., breach of contract, damages, specific performance"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opposing Party Strength
                      </label>
                      <select
                        value={analyticsForm.opposing_party_strength}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, opposing_party_strength: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="weak">Weak</option>
                        <option value="moderate">Moderate</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidence Strength
                      </label>
                      <select
                        value={analyticsForm.evidence_strength}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, evidence_strength: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="weak">Weak</option>
                        <option value="moderate">Moderate</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Witness Credibility
                      </label>
                      <select
                        value={analyticsForm.witness_credibility}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, witness_credibility: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="weak">Weak</option>
                        <option value="moderate">Moderate</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procedural Compliance
                      </label>
                      <select
                        value={analyticsForm.procedural_compliance}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, procedural_compliance: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="poor">Poor</option>
                        <option value="adequate">Adequate</option>
                        <option value="excellent">Excellent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Cooperation
                      </label>
                      <select
                        value={analyticsForm.client_cooperation}
                        onChange={(e) => setAnalyticsForm(prev => ({ ...prev, client_cooperation: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="poor">Poor</option>
                        <option value="adequate">Adequate</option>
                        <option value="excellent">Excellent</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={analyzing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 font-semibold text-lg"
                  >
                    {analyzing ? '🔮 Analyzing Case with AI...' : '🔮 Generate AI Case Prediction'}
                  </button>
                </form>

                {/* Analytics Results */}
                {analyticsData && (
                  <div className="mt-8 space-y-6">
                    {/* Prediction Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-2xl font-bold text-green-900 mb-4">AI Case Prediction Results</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-green-800 mb-2">Predicted Outcome</h4>
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {analyticsData.predicted_outcome.charAt(0).toUpperCase() + analyticsData.predicted_outcome.slice(1)}
                          </div>
                          <div className="text-sm text-green-700">
                            Confidence: {analyticsData.confidence_score}%
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-green-800 mb-2">Probability Distribution</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Favorable:</span>
                              <span className="font-semibold">{analyticsData.probability_distribution.favorable}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Settlement:</span>
                              <span className="font-semibold">{analyticsData.probability_distribution.settlement}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Unfavorable:</span>
                              <span className="font-semibold">{analyticsData.probability_distribution.unfavorable}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Factors */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Key Predictive Factors</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analyticsData.key_factors.map((factor: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full mt-2 ${
                              factor.impact === 'positive' ? 'bg-green-500' :
                              factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-gray-900">{factor.factor}</div>
                              <div className="text-sm text-gray-600">{factor.description}</div>
                              <div className="text-xs text-gray-500 mt-1">Weight: {factor.weight}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Risk Assessment</h4>

                      <div className="mb-4">
                        <span className="text-lg font-semibold">Overall Risk Level: </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analyticsData.risk_assessment.overall_risk === 'low' ? 'bg-green-100 text-green-800' :
                          analyticsData.risk_assessment.overall_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          analyticsData.risk_assessment.overall_risk === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analyticsData.risk_assessment.overall_risk.charAt(0).toUpperCase() + analyticsData.risk_assessment.overall_risk.slice(1)}
                        </span>
                      </div>

                      {analyticsData.risk_assessment.risk_factors.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Risk Factors:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {analyticsData.risk_assessment.risk_factors.map((factor: string, index: number) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Timeline Estimate:</h5>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-700">Optimistic</div>
                            <div className="font-semibold text-green-900">{analyticsData.risk_assessment.timeline_estimate.optimistic}</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-700">Realistic</div>
                            <div className="font-semibold text-blue-900">{analyticsData.risk_assessment.timeline_estimate.realistic}</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-700">Pessimistic</div>
                            <div className="font-semibold text-red-900">{analyticsData.risk_assessment.timeline_estimate.pessimistic}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Recommendations */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="text-xl font-bold text-blue-900 mb-4">Strategic Recommendations</h4>
                      <ul className="space-y-3">
                        {analyticsData.strategic_recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-blue-800">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Similar Cases */}
                    {analyticsData.similar_cases && analyticsData.similar_cases.length > 0 && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Similar Historical Cases</h4>
                        <div className="space-y-4">
                          {analyticsData.similar_cases.map((case_: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900">{case_.case_name}</h5>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {Math.round(case_.similarity_score * 100)}% similar
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Outcome:</strong> {case_.outcome}
                              </div>
                              <div className="text-sm">
                                <div className="text-green-700 mb-1">
                                  <strong>Similarities:</strong> {case_.key_similarities.join(', ')}
                                </div>
                                {case_.relevant_differences && case_.relevant_differences.length > 0 && (
                                  <div className="text-orange-700">
                                    <strong>Differences:</strong> {case_.relevant_differences.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Matters List */}
          {filteredMatters.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matters found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' ? 'Get started by creating your first matter.' : `No ${filter} matters found.`}
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
              >
                Create Your First Matter
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMatters.map((matter) => {
                const daysUntilDeadline = getDaysUntilDeadline(matter.deadline)
                const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0
                const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0

                return (
                  <div key={matter.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {matter.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(matter.status)}`}>
                              {matter.status}
                            </span>
                          </div>

                          {matter.case_number && (
                            <p className="text-gray-600 mb-2">Case #{matter.case_number}</p>
                          )}

                          {matter.description && (
                            <p className="text-gray-700 mb-4">{matter.description}</p>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Matter Details */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {matter.client && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Client</p>
                            <p className="font-medium text-gray-900">{matter.client.name}</p>
                            <p className="text-sm text-gray-600">{matter.client.email}</p>
                          </div>
                        )}

                        {matter.court && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Court</p>
                            <p className="font-medium text-gray-900">{matter.court}</p>
                          </div>
                        )}

                        {matter.opposing_party && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Opposing Party</p>
                            <p className="font-medium text-gray-900">{matter.opposing_party}</p>
                          </div>
                        )}

                        {matter.deadline && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Deadline</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-900'}`}>
                              {new Date(matter.deadline).toLocaleDateString()}
                            </p>
                            {daysUntilDeadline !== null && (
                              <p className={`text-sm ${isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-gray-500'}`}>
                                {isOverdue ? `${Math.abs(daysUntilDeadline)} days overdue` :
                                 daysUntilDeadline === 0 ? 'Due today' :
                                 `${daysUntilDeadline} days left`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Documents */}
                      {matter.documents && matter.documents.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Documents</h4>
                          <div className="space-y-2">
                            {matter.documents.slice(0, 3).map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="font-medium text-gray-900">{doc.title}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                    doc.status === 'review' ? 'bg-blue-100 text-blue-800' :
                                    doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                            {matter.documents.length > 3 && (
                              <p className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                +{matter.documents.length - 3} more documents
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                        <div className="flex space-x-4">
                          <Link
                            href={`/documents?matter=${matter.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Document
                          </Link>
                          <button className="text-gray-600 hover:text-gray-900 font-medium">
                            View Timeline
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Created {new Date(matter.created_at).toLocaleDateString()}
                          </div>

                          {/* Workflow Status */}
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: '75%' }} // This would be dynamic based on actual workflow progress
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">75% Complete</span>
                          </div>
                        </div>

                        {/* Workflow Status Badge */}
                        <div className="mt-4 flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Workflow Active
                          </span>

                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            3 Tasks Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
