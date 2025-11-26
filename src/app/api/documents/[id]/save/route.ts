import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'

export async function POST(
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
    const { content, changeSummary } = body

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    // Verify document ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id, current_version, content')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if content has actually changed
    const contentChanged = document.content !== content
    const newVersionNumber = document.current_version + (contentChanged ? 1 : 0)

    // Start a transaction-like operation
    const updates: any[] = []

    if (contentChanged) {
      // Create version snapshot
      updates.push(
        supabase
          .from('document_versions')
          .insert({
            document_id: id,
            version_number: newVersionNumber,
            content: document.content || '',
            created_by: user.id,
            change_summary: changeSummary || 'Content updated',
            file_size: Buffer.byteLength(document.content || '', 'utf8')
          })
      )

      // Update document with new version
      updates.push(
        supabase
          .from('documents')
          .update({
            content,
            current_version: newVersionNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      )
    } else {
      // Just update the timestamp
      updates.push(
        supabase
          .from('documents')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      )
    }

    // Execute all updates
    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Database errors:', errors)
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'document_saved',
        resource_type: 'document',
        resource_id: id,
        details: {
          version: newVersionNumber,
          content_changed: contentChanged,
          change_summary: changeSummary
        }
      })

    return NextResponse.json({
      success: true,
      version: newVersionNumber,
      message: contentChanged ? `Document saved as version ${newVersionNumber}` : 'Document saved'
    })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
