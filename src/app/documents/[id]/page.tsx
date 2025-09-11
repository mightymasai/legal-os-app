'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Define the type for a Document
type Document = {
  id: string;
  title: string;
  content: string;
  user_id: string;
};

// The params object will contain the dynamic route parameter, in this case, 'id'
export default function DocumentEditorPage({ params: { id } }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // If auth is done and there's no user, redirect to signin
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }

    // Fetch the document from Supabase
    const fetchDocument = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
       .eq('id', id)
        .single(); // .single() gets one record, or null if not found

      if (error || !data) {
        console.error('Error fetching document or document not found:', error)
        alert('Error: Document not found or you do not have permission to view it.')
        router.push('/documents') // Redirect if document not found
        return
      }

      // Security check: ensure the fetched document belongs to the logged-in user
      if (user && data.user_id !== user.id) {
        alert('Error: You do not have permission to view this document.')
        router.push('/documents')
        return
      }

      setDocument(data)
      // Safely handle content which might be null or not a string
      setContent(typeof data.content === 'string' ? data.content : JSON.stringify(data.content || '', null, 2))
      setLoading(false)
    }

    if (user) {
        fetchDocument()
    }
 }, [id, user, authLoading, router])


  const handleSave = async () => {
    if (!document) return;
    setSaving(true)
    const { error } = await supabase
      .from('documents')
      .update({ content: content })
      .eq('id', document.id);

    if (error) {
      alert('Failed to save document: ' + error.message)
    } else {
      alert('Document saved successfully!')
    }
    setSaving(false)
  }

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="text-center p-10">Loading document...</div>
      </Layout>
    )
  }

  if (!document) {
    // This state is briefly hit before redirecting if a document isn't found
    return (
        <Layout>
            <div className="text-center p-10">Document not found.</div>
        </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        <p className="text-sm text-gray-500 mb-4">Document ID: {document.id}</p>
        
        <textarea
          className="w-full h-96 p-4 border rounded-md font-mono text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {saving ? 'Saving...' : 'Save Document'}
        </button>
      </div>
    </Layout>
  )
}
