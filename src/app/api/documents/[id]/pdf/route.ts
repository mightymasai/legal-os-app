import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'
import puppeteer from 'puppeteer'

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

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${document.title}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 40px;
              font-size: 12pt;
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
            @page {
              margin: 1in;
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

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      }
    })

    await browser.close()

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
