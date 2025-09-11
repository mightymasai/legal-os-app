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
  content: any; // Using 'any' for now, can be refined to a specific JSON structure
  created_at: string;
};

export default function Templates() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  
  // State for the new template form
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
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

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Document Templates</h1>
        
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Template
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <p>You haven't created any templates yet.</p>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{template.name}</h3>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
