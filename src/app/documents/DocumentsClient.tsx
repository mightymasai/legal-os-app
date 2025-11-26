'use client'

import Link from 'next/link'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DocumentService } from '@/lib/documents'

export default function DocumentsClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Array<{id: string, title: string, created_at: string, updated_at: string}>>([])
  const [newDocTitle, setNewDocTitle] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchDocuments()
    }
  }, [user, loading, router])

  const fetchDocuments = async () => {
    setFetchLoading(true)
    const { data, error } = await DocumentService.getDocuments(user!.id)
    if (error) {
      console.error('Error fetching documents:', error.message)
    } else {
      setDocuments(data || [])
    }
    setFetchLoading(false)
  }

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim() || !user) return
    setCreateLoading(true)
    const { data, error } = await DocumentService.createDocument(user.id, newDocTitle)
    if (error) {
      console.error('Error creating document:', error.message)
    } else if (data) {
      setNewDocTitle('')
      fetchDocuments() // Refresh the list
    }
    setCreateLoading(false)
  }

  if (loading || fetchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading documents...</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null // Redirecting
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <div className="flex gap-3">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => router.push('/templates')}
            >
              New from Template
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New document title"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
              />
              <button
                onClick={handleCreateDocument}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new document or using a template.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-indigo-600 truncate">{doc.title}</p>
                            <p className="text-sm text-gray-500">Document</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}
