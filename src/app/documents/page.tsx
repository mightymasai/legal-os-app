'use client'

import Link from 'next/link' // Make sure this is here
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DocumentService } from '@/lib/documents'

export default function Documents() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [newDocTitle, setNewDocTitle] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      fetchDocuments()
    }
  }, [user, loading, router])

  const fetchDocuments = async () => {
    setFetchLoading(true)
    // The user object will exist here because of the useEffect check
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

  // This is the only loading/user check block you need before the final return
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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Your Documents</h1>
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="New document title"
            className="flex-grow p-2 border rounded-md"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
          />
          <button
            onClick={handleCreateDocument}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            disabled={createLoading}
          >
            {createLoading ? 'Creating...' : 'Create Document'}
          </button>
        </div>

        {documents.length === 0 ? (
          <p>You don't have any documents yet. Create one above!</p>
        ) : (
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li key={doc.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <Link href={`/documents/${doc.id}`} className="text-lg font-semibold text-indigo-600 hover:underline">
                  {doc.title}
                </Link>
                <span className="text-sm text-gray-500">Created: {new Date(doc.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
