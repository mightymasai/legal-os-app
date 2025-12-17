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
    const { html } = body

    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'Invalid HTML content' }, { status: 400 })
    }

    // For demo purposes, simulate AI processing
    // In production, this would proxy to your n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl) {
      // Real n8n integration
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            html: html,
            action: 'improve_draft',
            timestamp: new Date().toISOString()
          })
        })

        if (!response.ok) {
          throw new Error(`n8n webhook failed: ${response.status}`)
        }

        const result = await response.json()
        return NextResponse.json(result)
      } catch (error) {
        console.error('n8n proxy error:', error)
        // Fall back to demo processing
      }
    }

    // Demo AI processing - simulate improvements
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time

    // Simple demo improvements (in real app, this would come from n8n/AI service)
    let improvedHtml = html

    // Basic improvements for demo
    improvedHtml = improvedHtml.replace(/don't/g, "do not") // Contractions
    improvedHtml = improvedHtml.replace(/can't/g, "cannot")
    improvedHtml = improvedHtml.replace(/won't/g, "will not")
    improvedHtml = improvedHtml.replace(/\s+/g, ' ') // Multiple spaces
    improvedHtml = improvedHtml.trim()

    // Add some basic structure if missing
    if (!improvedHtml.includes('<p>') && improvedHtml.length > 0) {
      improvedHtml = `<p>${improvedHtml}</p>`
    }

    // Log the AI interaction
    try {
      await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          action: 'revise',
          input_text: html,
          output_text: improvedHtml
        })
    } catch (logError) {
      console.error('Failed to log AI interaction:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      improvedHtml,
      message: 'Document draft improved with AI assistance'
    })
  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 })
  }
}


