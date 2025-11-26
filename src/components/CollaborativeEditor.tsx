'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import TiptapEditor from '@/components/Tiptapeditor'

interface Collaborator {
  id: string
  email: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: Date
}

interface CollaborativeEditorProps {
  documentId: string
  initialContent: string
  currentUser: any
  onContentChange: (content: string) => void
}

export default function CollaborativeEditor({
  documentId,
  initialContent,
  currentUser,
  onContentChange
}: CollaborativeEditorProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [content, setContent] = useState(initialContent)
  const [isOnline, setIsOnline] = useState(false)

  // Colors for different collaborators
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

  useEffect(() => {
    // Subscribe to real-time changes for this document
    const channel = supabase
      .channel(`document-${documentId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const onlineUsers = Object.values(presenceState).flat() as any[]

        const collabUsers = onlineUsers.map((user, index) => ({
          id: user.user_id,
          email: user.email,
          color: colors[index % colors.length],
          lastSeen: new Date()
        }))

        setCollaborators(collabUsers)
        setIsOnline(collabUsers.length > 1)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            email: currentUser.email,
            document_id: documentId,
            last_active: new Date().toISOString()
          })
        }
      })

    // Listen for document content changes
    const contentChannel = supabase
      .channel(`document-content-${documentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${documentId}`
      }, (payload) => {
        if (payload.new.content && payload.new.content !== content) {
          setContent(payload.new.content)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      contentChannel.unsubscribe()
    }
  }, [documentId, currentUser, content])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
  }, [onContentChange])

  return (
    <div className="relative">
      {/* Collaborators indicator */}
      {isOnline && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">
              {collaborators.length} user{collaborators.length > 1 ? 's' : ''} online
            </span>
          </div>
          <div className="flex space-x-1">
            {collaborators.slice(0, 4).map((collab, index) => (
              <div
                key={collab.id}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: collab.color }}
                title={collab.email}
              >
                {collab.email.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold text-gray-700">
                +{collaborators.length - 4}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className={`${isOnline ? 'pr-16' : ''}`}>
        <TiptapEditor
          content={content}
          onUpdate={handleContentChange}
          editable={true}
        />
      </div>

      {/* Real-time activity indicator */}
      {isOnline && (
        <div className="mt-4 text-xs text-gray-500 flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Real-time collaboration active</span>
        </div>
      )}
    </div>
  )
}
