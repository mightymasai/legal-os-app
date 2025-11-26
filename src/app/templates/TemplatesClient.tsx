'use client'

import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Define the type for a Template object
export type Template = {
  id: string;
  name: string;
  content: Record<string, unknown>; // Using Record for JSON structure
  created_at: string;
};

export default function TemplatesClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Array<{id: string, name: string, content: Record<string, unknown>, created_at: string}>>([])
  const [fetchLoading, setFetchLoading] = useState(true)

  // State for the new template form
  const [newName, setNewName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchTemplates()
    }
  }, [user, loading, router])

  const fetchTemplates = async () => {
    if (!user) return;
    setFetchLoading(true)
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error.message)
    } else {
      setTemplates(data || [])
    }
    setFetchLoading(false)
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) {
        alert('Template Name is required.');
        return;
    }

    setCreateLoading(true)
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: newName,
        content: { placeholder: 'This is a new template.' } // Default content
      })
      .select();

    if (error) {
      alert('Error creating template: ' + error.message)
    } else {
      setTemplates(prevTemplates => [data[0], ...prevTemplates]);
      setNewName(''); // Clear the form
    }
    setCreateLoading(false)
  }

  if (loading || fetchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading templates...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
          <button
            onClick={() => router.push('/documents')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Documents
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Template</h2>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={createLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {createLoading ? 'Creating...' : 'Create Template'}
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first template above.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Template</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // For now, just show an alert. In a full implementation, this would open a modal
                      // to fill in template variables and create a document
                      alert('Template creation modal would open here. For now, you can create documents directly from the Documents page.')
                    }}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
