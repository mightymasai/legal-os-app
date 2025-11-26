import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'
import { VersionManager } from '@/lib/versioning'
import { AuditLogger } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { content } = body

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    // Verify document ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get current document content for version comparison
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('content')
      .eq('id', id)
      .single()

    // Update document content
    const { data, error } = await supabase
      .from('documents')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    // Create version if content changed significantly (not just auto-save)
    // We'll create versions for manual saves or significant changes
    if (request.headers.get('x-save-type') === 'manual' ||
        !currentDoc?.content ||
        Math.abs(content.length - currentDoc.content.length) > 100) {
      await VersionManager.createVersion(
        id,
        content,
        user.id,
        request.headers.get('x-save-type') === 'manual' ? 'Manual save' : 'Auto-save'
      )
    }

    // Log the document edit action
    await AuditLogger.logDocumentAction(
      user.id,
      'edited',
      id,
      {
        save_type: request.headers.get('x-save-type') || 'auto',
        content_length: content.length,
        version_created: request.headers.get('x-save-type') === 'manual'
      },
      request
    )

    return NextResponse.json({ success: true, document: data })
  } catch (error) {
    console.error('Autosave error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
