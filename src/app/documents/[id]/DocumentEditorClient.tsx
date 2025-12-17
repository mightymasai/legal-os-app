'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'
import TiptapEditor from '@/components/Tiptapeditor'
import VersionHistory from '@/components/VersionHistory'
import MatterSelector from '@/components/MatterSelector'
import CollaborativeEditor from '@/components/CollaborativeEditor'
import { useAuth } from '@/contexts/AuthContext'

// Define the type for a Document
type Document = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  current_version?: number;
  matter_id?: string | null;
};

interface DocumentEditorClientProps {
  document: Document;
}

export default function DocumentEditorClient({ document }: DocumentEditorClientProps) {
  const { user } = useAuth()
  const [content, setContent] = useState(document.content || '')
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(document.current_version || 1)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(document.matter_id || null)
  const [showMatterSelector, setShowMatterSelector] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/documents/${document.id}/autosave`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-save-type': 'manual',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to save document')
      }

      // Could add success notification here
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const handleAutoSave = useCallback(async (newContent: string) => {
    setAutoSaving(true)
    try {
      const response = await fetch(`/api/documents/${document.id}/autosave`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to auto-save document')
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [document.id])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // Debounce auto-save
    const timeoutId = setTimeout(() => handleAutoSave(newContent), 1000)
    return () => clearTimeout(timeoutId)
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/pdf`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const contentType = response.headers.get('content-type')
      
      // Check if response is PDF blob
      if (contentType === 'application/pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const linkElement = globalThis.document.createElement('a')
        linkElement.href = url
        linkElement.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        globalThis.document.body.appendChild(linkElement)
        linkElement.click()
        window.URL.revokeObjectURL(url)
        globalThis.document.body.removeChild(linkElement)
      } else {
        // Fallback to client-side PDF generation using browser print
        const data = await response.json()
        if (data.html) {
          // Open HTML in new window for printing
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(data.html)
            printWindow.document.close()
            // Wait for content to load, then trigger print dialog
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print()
              }, 250)
            }
          } else {
            // If popup blocked, show instructions
            alert('Please allow popups and try again, or use your browser\'s print function (Ctrl+P / Cmd+P)')
          }
        } else {
          // Ultimate fallback: use browser print on current page
          window.print()
        }
      }
    } catch (error) {
      console.error('PDF export error:', error)
      // Fallback: use browser print
      if (confirm('PDF service unavailable. Would you like to use browser print instead?')) {
        window.print()
      }
    }
  }

  const handleAIImprove = async () => {
    try {
      const response = await fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to improve draft')
      }

      const result = await response.json()
      if (result.improvedHtml) {
        setContent(result.improvedHtml)
      } else {
        alert('AI improvement completed, but no changes were made.')
      }
    } catch (error) {
      console.error('AI improve error:', error)
      alert('Failed to improve draft with AI')
    }
  }

  const handleVersionRestore = async (version: any) => {
    try {
      setContent(version.content)
      // Save the restored version
      await fetch(`/api/documents/${document.id}/autosave`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-save-type': 'manual',
        },
        body: JSON.stringify({ content: version.content }),
      })
      alert(`Successfully restored to version ${version.version_number}`)
    } catch (error) {
      console.error('Error restoring version:', error)
      alert('Failed to restore version')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Version {currentVersion}</span>
              {selectedMatterId && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Linked to Matter
                </span>
              )}
              <button
                onClick={() => setShowMatterSelector(!showMatterSelector)}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                {showMatterSelector ? 'Hide Matter Link' : 'Link to Matter'}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowVersionHistory(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Version History
            </button>
            <button
              onClick={handleAIImprove}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Improve Draft
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center gap-2"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Matter Selector */}
        {showMatterSelector && (
          <div className="mb-6">
            <MatterSelector
              selectedMatterId={selectedMatterId || undefined}
              onMatterSelect={(id) => setSelectedMatterId(id || null)}
              documentId={document.id}
            />
          </div>
        )}

        {autoSaving && (
          <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Auto-saving...
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <CollaborativeEditor
            documentId={document.id}
            initialContent={content}
            currentUser={user}
            onContentChange={handleContentChange}
          />
        </div>
      </div>

      {/* Version History */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <VersionHistory
                documentId={document.id}
                currentVersion={currentVersion}
                onVersionRestore={handleVersionRestore}
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
