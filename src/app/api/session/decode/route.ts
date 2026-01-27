import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'
import {
  decodeSessionData,
  validateSessionData,
  parseSessionSummary,
  toSafeLogFormat,
  extractSessionMetadata,
  SessionDecoderError,
} from '@/lib/sessionDecoder'
import { AuditLogger } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionData } = body

    if (!sessionData) {
      return NextResponse.json(
        { error: 'sessionData is required' },
        { status: 400 }
      )
    }

    if (typeof sessionData !== 'string') {
      return NextResponse.json(
        { error: 'sessionData must be a string' },
        { status: 400 }
      )
    }

    // Validate the session data first
    const validation = validateSessionData(sessionData)

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid session data format',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      )
    }

    // Decode the session data
    const decoded = decodeSessionData(sessionData)
    const metadata = extractSessionMetadata(decoded)

    // Log the decode action (with masked data for security)
    await AuditLogger.log(
      user.id,
      'session_decoded',
      'session',
      decoded.sessionId.slice(0, 8),
      {
        format: decoded.metadata.format,
        validationWarnings: validation.warnings,
      },
      request
    )

    return NextResponse.json({
      success: true,
      decoded: {
        sessionId: decoded.sessionId,
        signature: decoded.signature,
        metadata: decoded.metadata,
        extractedMetadata: metadata,
      },
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
      },
    })
  } catch (error) {
    if (error instanceof SessionDecoderError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Session decode error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionData = searchParams.get('data')

    if (!sessionData) {
      return NextResponse.json(
        {
          message: 'Session Decoder API',
          usage: {
            POST: {
              description: 'Decode session data',
              body: { sessionData: 'string' },
            },
            GET: {
              description: 'Decode session data via query parameter',
              params: { data: 'encoded session string' },
            },
          },
        },
        { status: 200 }
      )
    }

    // Parse and decode the session data
    const result = parseSessionSummary(sessionData)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to decode session data',
          details: result.error,
          validation: result.validation,
        },
        { status: 400 }
      )
    }

    // Log the decode action
    if (result.data) {
      await AuditLogger.log(
        user.id,
        'session_decoded',
        'session',
        result.data.sessionId.slice(0, 8),
        {
          format: result.data.metadata.format,
          method: 'GET',
        },
        request
      )
    }

    return NextResponse.json({
      success: true,
      decoded: result.data
        ? {
            sessionId: result.data.sessionId,
            signature: result.data.signature,
            metadata: result.data.metadata,
          }
        : null,
      validation: result.validation,
    })
  } catch (error) {
    console.error('Session decode GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
