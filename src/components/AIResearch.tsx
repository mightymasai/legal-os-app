'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ResearchResult {
  id: string
  title: string
  summary: string
  source: string
  relevance_score: number
  citation: string
  url?: string
  jurisdiction?: string
}

interface AIResearchProps {
  matterId?: string
  documentId: string
  onInsertResult: (content: string) => void
}

export default function AIResearch({ matterId, documentId, onInsertResult }: AIResearchProps) {
  const [query, setQuery] = useState('')
  const [researchType, setResearchType] = useState('case_law')
  const [jurisdiction, setJurisdiction] = useState('federal')
  const [results, setResults] = useState<ResearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const researchTypes = [
    { value: 'case_law', label: 'Case Law & Precedents' },
    { value: 'statute', label: 'Statutes & Regulations' },
    { value: 'secondary_source', label: 'Legal Commentary' },
    { value: 'general', label: 'General Legal Research' }
  ]

  const jurisdictions = [
    { value: 'federal', label: 'Federal' },
    { value: 'california', label: 'California' },
    { value: 'new_york', label: 'New York' },
    { value: 'texas', label: 'Texas' },
    { value: 'florida', label: 'Florida' },
    { value: 'illinois', label: 'Illinois' }
  ]

  useEffect(() => {
    fetchSavedSearches()
  }, [matterId])

  const fetchSavedSearches = async () => {
    if (!matterId) return

    try {
      const { data, error } = await supabase
        .from('legal_research')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setSavedSearches(data || [])
    } catch (error) {
      console.error('Error fetching saved searches:', error)
    }
  }

  const handleResearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      // Simulate AI research (in production, this would call real legal databases)
      const mockResults: ResearchResult[] = [
        {
          id: '1',
          title: 'Smith v. Johnson (2023)',
          summary: 'Landmark case establishing precedent for contract interpretation in employment disputes. The court ruled that ambiguous contract terms must be interpreted against the drafter.',
          source: 'Supreme Court Database',
          relevance_score: 0.95,
          citation: 'Smith v. Johnson, 598 U.S. 123 (2023)',
          jurisdiction: 'federal',
          url: 'https://example.com/case/123'
        },
        {
          id: '2',
          title: 'California Labor Code § 2922',
          summary: 'Employment contracts in California must be in writing and signed by both parties. Oral modifications are generally unenforceable.',
          source: 'California Legislative Information',
          relevance_score: 0.88,
          citation: 'Cal. Lab. Code § 2922',
          jurisdiction: 'california'
        },
        {
          id: '3',
          title: 'Recent Developments in Employment Law',
          summary: 'Analysis of emerging trends in remote work policies and their impact on employment contracts. Discusses enforceability of AI-monitored performance metrics.',
          source: 'Harvard Law Review',
          relevance_score: 0.82,
          citation: 'Johnson, "Remote Work Revolution," 135 Harv. L. Rev. 1123 (2024)',
          jurisdiction: 'federal'
        }
      ]

      // Filter results by jurisdiction if specified
      const filteredResults = jurisdiction !== 'all'
        ? mockResults.filter(r => r.jurisdiction === jurisdiction)
        : mockResults

      setResults(filteredResults)

      // Save research to database
      const { data: { user } } = await supabase.auth.getUser()
      if (user && matterId) {
        await supabase
          .from('legal_research')
          .insert({
            user_id: user.id,
            matter_id: matterId,
            query: query,
            research_type: researchType,
            jurisdiction: jurisdiction,
            results: filteredResults
          })
      }

    } catch (error) {
      console.error('Research error:', error)
      alert('Research failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInsertResult = (result: ResearchResult) => {
    const citationText = `\n\n**Legal Authority:** ${result.title}\n${result.summary}\n\n*Citation: ${result.citation}*\n\n`
    onInsertResult(citationText)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          AI Legal Research
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Simple' : 'Advanced'} Search
        </button>
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Research Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., employment contract interpretation, breach of contract remedies..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research Type
              </label>
              <select
                value={researchType}
                onChange={(e) => setResearchType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {researchTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jurisdictions.map(jur => (
                  <option key={jur.value} value={jur.value}>{jur.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleResearch}
          disabled={loading || !query.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Researching...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
              </svg>
              Search Legal Databases
            </>
          )}
        </button>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h4>
          <div className="space-y-2">
            {savedSearches.slice(0, 3).map((search) => (
              <button
                key={search.id}
                onClick={() => {
                  setQuery(search.query)
                  setResearchType(search.research_type)
                  setJurisdiction(search.jurisdiction)
                }}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-gray-700"
              >
                "{search.query}" ({search.jurisdiction})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Research Results ({results.length})
          </h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{result.title}</h5>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {result.source}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {Math.round(result.relevance_score * 100)}% relevant
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{result.summary}</p>
                    <p className="text-xs text-gray-500 italic">Citation: {result.citation}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500">
                    Jurisdiction: {result.jurisdiction}
                  </div>
                  <button
                    onClick={() => handleInsertResult(result)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Insert into Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
          </svg>
          <p>No results found. Try adjusting your search terms or jurisdiction.</p>
        </div>
      )}
    </div>
  )
}


