import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/authServer'
import { ConflictChecker } from '@/lib/conflicts'
import { AuditLogger } from '@/lib/audit'
import { WorkflowAutomationService } from '@/lib/workflow-automation'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: matters, error } = await supabase
      .from('matters')
      .select(`
        *,
        client:clients(name, email),
        documents:documents(id, title, status, created_at)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching matters:', error)
      return NextResponse.json({ error: 'Failed to fetch matters' }, { status: 500 })
    }

    return NextResponse.json({ matters: matters || [] })
  } catch (error) {
    console.error('Matters GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, client_id, description, case_number, court, opposing_party, deadline, status, case_type, jurisdiction, intake_data } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data: matter, error } = await supabase
      .from('matters')
      .insert({
        user_id: user.id,
        client_id: client_id || null,
        title,
        description,
        case_number,
        court,
        opposing_party,
        deadline,
        status: status || 'active'
      })
      .select(`
        *,
        client:clients(name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating matter:', error)
      return NextResponse.json({ error: 'Failed to create matter' }, { status: 500 })
    }

    // Perform conflict check if we have parties involved
    let conflictCheck = null
    const partiesInvolved = []

    if (client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', client_id)
        .single()

      if (client?.name) partiesInvolved.push(client.name)
    }

    if (opposing_party) partiesInvolved.push(opposing_party)

    if (partiesInvolved.length > 0) {
      conflictCheck = await ConflictChecker.checkConflicts(matter.id, user.id, partiesInvolved)
    }

    // Initialize automated workflow if case type and intake data provided
    let workflow = null
    if (case_type && intake_data) {
      workflow = await WorkflowAutomationService.initializeWorkflow(
        matter.id,
        case_type,
        jurisdiction || 'general',
        intake_data
      )
    }

    // Log the matter creation
    await AuditLogger.logMatterAction(
      user.id,
      'created',
      matter.id,
      {
        title,
        client_id,
        case_number,
        court,
        conflict_check_performed: !!conflictCheck,
        risk_level: conflictCheck?.risk_level,
        workflow_initialized: !!workflow
      },
      request
    )

    return NextResponse.json({ matter, conflictCheck, workflow })
  } catch (error) {
    console.error('Matters POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
