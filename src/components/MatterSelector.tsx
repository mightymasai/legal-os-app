'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Matter {
  id: string
  title: string
  description?: string
  status: string
  client_id?: string
  deadline?: string
  clients?: { name: string; email: string }
}

interface MatterSelectorProps {
  selectedMatterId?: string
  onMatterSelect: (matterId: string | null) => void
  documentId: string
}

export default function MatterSelector({ selectedMatterId, onMatterSelect, documentId }: MatterSelectorProps) {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMatterTitle, setNewMatterTitle] = useState('')
  const [newMatterDescription, setNewMatterDescription] = useState('')

  useEffect(() => {
    fetchMatters()
  }, [])

  const fetchMatters = async () => {
    try {
      const { data, error } = await supabase
        .from('matters')
        .select(`
          id,
          title,
          description,
          status,
          client_id,
          deadline,
          clients (
            name,
            email
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMatters(data || [])
    } catch (error) {
      console.error('Error fetching matters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMatterTitle.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('matters')
        .insert({
          user_id: user.id,
          title: newMatterTitle,
          description: newMatterDescription,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setMatters(prev => [data, ...prev])
      setNewMatterTitle('')
      setNewMatterDescription('')
      setShowCreateForm(false)

      // Auto-select the newly created matter
      onMatterSelect(data.id)
    } catch (error) {
      console.error('Error creating matter:', error)
      alert('Failed to create matter')
    }
  }

  const handleLinkMatter = async (matterId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ matter_id: matterId })
        .eq('id', documentId)

      if (error) throw error

      onMatterSelect(matterId)
    } catch (error) {
      console.error('Error linking matter:', error)
      alert('Failed to link matter to document')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const selectedMatter = matters.find(m => m.id === selectedMatterId)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Link to Matter</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ New Matter'}
        </button>
      </div>

      {selectedMatter && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">{selectedMatter.title}</h4>
              <p className="text-sm text-blue-700">
                Status: {selectedMatter.status}
                {selectedMatter.clients && ` • Client: ${selectedMatter.clients.name}`}
              </p>
            </div>
            <button
              onClick={() => onMatterSelect(null)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Unlink
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateMatter} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matter Title
            </label>
            <input
              type="text"
              value={newMatterTitle}
              onChange={(e) => setNewMatterTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Smith vs. Johnson Contract Dispute"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newMatterDescription}
              onChange={(e) => setNewMatterDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of the matter..."
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Create Matter
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!selectedMatter && !showCreateForm && (
        <div>
          <p className="text-sm text-gray-600 mb-3">Select an existing matter:</p>
          {matters.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No matters found. Create your first matter above.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {matters.map((matter) => (
                <button
                  key={matter.id}
                  onClick={() => handleLinkMatter(matter.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{matter.title}</div>
                  <div className="text-sm text-gray-600">
                    Status: {matter.status}
                    {matter.clients && ` • ${matter.clients.name}`}
                    {matter.deadline && ` • Due: ${new Date(matter.deadline).toLocaleDateString()}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
