import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { templateId, title, variables } = body

    if (!templateId || !title) {
      return NextResponse.json({ error: 'Template ID and title are required' }, { status: 400 })
    }

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, name, content')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Process template content with variables
    let processedContent = template.content || ''

    // Simple variable replacement (in a real app, you'd want more sophisticated template processing)
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value))
      })
    }

    // Create new document from template
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        content: processedContent,
        user_id: user.id,
        type: 'template' // You might want to add this field to your schema
      })
      .select()
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      return NextResponse.json({ error: 'Failed to create document from template' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document created from template successfully'
    })
  } catch (error) {
    console.error('Create from template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
