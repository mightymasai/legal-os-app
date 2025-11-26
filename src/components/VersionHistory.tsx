'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DocumentVersion {
  id: string
  version_number: number
  content: string
  created_by: string
  created_at: string
  change_summary?: string
  file_size?: number
}

interface VersionHistoryProps {
  documentId: string
  currentVersion: number
  onVersionRestore: (version: DocumentVersion) => void
}

export default function VersionHistory({ documentId, currentVersion, onVersionRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [documentId])

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          id,
          version_number,
          content,
          created_at,
          change_summary,
          file_size,
          profiles:user_id (
            email
          )
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })

      if (error) throw error

      setVersions(data || [])
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-900">Version History</span>
          <span className="text-sm text-gray-500">({versions.length} versions)</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No version history available
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    version.version_number === currentVersion ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        version.version_number === currentVersion
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        v{version.version_number}
                      </span>
                      {version.version_number === currentVersion && (
                        <span className="text-xs text-blue-600 font-medium">Current</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(version.created_at).toLocaleDateString()}</span>
                      <span>{formatFileSize(version.file_size)}</span>
                    </div>
                  </div>

                  {version.change_summary && (
                    <p className="text-sm text-gray-700 mb-2 italic">
                      "{version.change_summary}"
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Created by: {version.created_by || 'Unknown'}
                    </div>

                    {version.version_number !== currentVersion && (
                      <button
                        onClick={() => onVersionRestore(version)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}