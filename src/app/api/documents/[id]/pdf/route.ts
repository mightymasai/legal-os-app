import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'

// Serverless-friendly PDF generation
// Uses client-side PDF generation approach for better compatibility with serverless environments
export async function GET(
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

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title, content, user_id')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create HTML content optimized for PDF printing
    // This will be used by client-side PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${document.title}</title>
          <style>
            @media print {
              @page {
                margin: 1in;
                size: A4;
              }
            }
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 0;
              padding: 40px;
              font-size: 12pt;
              color: #000;
              max-width: 8.5in;
            }
            h1 {
              font-size: 24pt;
              margin-bottom: 20px;
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            p {
              margin-bottom: 12px;
              text-align: justify;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              font-size: 10pt;
              color: #666;
            }
            .content {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          <h1>${document.title}</h1>
          <div class="content">
            ${document.content || '<p>No content</p>'}
          </div>
        </body>
      </html>
    `

    // For serverless environments, we'll use an external PDF service or client-side generation
    // Option: Use Gotenberg API, Browserless API, or similar service
    const pdfServiceUrl = process.env.PDF_SERVICE_URL
    
    if (pdfServiceUrl) {
      try {
        const response = await fetch(pdfServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.PDF_SERVICE_API_KEY && {
              'Authorization': `Bearer ${process.env.PDF_SERVICE_API_KEY}`
            })
          },
          body: JSON.stringify({
            html: htmlContent,
            options: {
              format: 'A4',
              printBackground: true,
              margin: {
                top: '1in',
                right: '1in',
                bottom: '1in',
                left: '1in'
              }
            }
          })
        })

        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer()
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`
            }
          })
        }
      } catch (serviceError) {
        console.warn('PDF service unavailable, using fallback:', serviceError)
      }
    }

    // Fallback: Return HTML with instructions for client-side PDF generation
    // The client can use window.print() or a library like jsPDF
    return NextResponse.json({
      success: true,
      html: htmlContent,
      title: document.title,
      message: 'Use browser print-to-PDF or client-side PDF generation',
      instructions: 'Open this HTML in a new window and use browser print (Ctrl+P / Cmd+P) to save as PDF'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
