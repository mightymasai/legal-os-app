import { supabase } from './supabase'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  case_type: string
  jurisdiction: string
  steps: WorkflowStep[]
  required_documents: string[]
  deadlines: WorkflowDeadline[]
  notifications: WorkflowNotification[]
  is_active: boolean
  created_at: string
}

export interface WorkflowStep {
  id: string
  name: string
  description: string
  order: number
  type: 'document_generation' | 'review' | 'approval' | 'client_task' | 'external_action'
  config: Record<string, any>
  dependencies: string[] // IDs of steps that must complete first
  estimated_duration: number // hours
}

export interface WorkflowDeadline {
  name: string
  description: string
  days_from_intake: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: 'attorney' | 'paralegal' | 'client'
}

export interface WorkflowNotification {
  trigger: string
  recipient: 'client' | 'attorney' | 'staff'
  type: 'email' | 'sms' | 'in_app'
  template: string
  delay_days?: number
}

export interface ActiveWorkflow {
  id: string
  matter_id: string
  template_id: string
  status: 'active' | 'completed' | 'paused'
  current_step: string
  completed_steps: string[]
  created_documents: Record<string, string> // step_id -> document_id
  created_deadlines: string[]
  started_at: string
  completed_at?: string
  progress_percentage: number
}

export class WorkflowAutomationService {
  /**
   * Initialize workflow for new matter
   */
  static async initializeWorkflow(
    matterId: string,
    caseType: string,
    jurisdiction: string,
    intakeData: Record<string, any>
  ): Promise<ActiveWorkflow | null> {
    try {
      // Find appropriate workflow template
      const template = await this.findWorkflowTemplate(caseType, jurisdiction)

      if (!template) {
        console.log(`No workflow template found for ${caseType} in ${jurisdiction}`)
        return null
      }

      // Create active workflow
      const { data: workflow, error } = await supabase
        .from('active_workflows')
        .insert({
          matter_id: matterId,
          template_id: template.id,
          status: 'active',
          current_step: template.steps[0]?.id || '',
          completed_steps: [],
          created_documents: {},
          created_deadlines: [],
          progress_percentage: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating workflow:', error)
        return null
      }

      // Execute initial workflow steps
      await this.executeWorkflowStep(workflow.id, template.steps[0], intakeData)

      // Set up deadlines
      await this.setupWorkflowDeadlines(workflow.id, template.deadlines, matterId)

      // Schedule notifications
      await this.scheduleWorkflowNotifications(workflow.id, template.notifications, matterId)

      return workflow
    } catch (error) {
      console.error('Workflow initialization error:', error)
      return null
    }
  }

  /**
   * Find appropriate workflow template
   */
  private static async findWorkflowTemplate(
    caseType: string,
    jurisdiction: string
  ): Promise<WorkflowTemplate | null> {
    try {
      // First try exact match
      let { data: template } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('case_type', caseType)
        .eq('jurisdiction', jurisdiction)
        .eq('is_active', true)
        .single()

      // If no exact match, try case type only
      if (!template) {
        const { data } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('case_type', caseType)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)

        template = data?.[0]
      }

      return template || null
    } catch (error) {
      console.error('Template search error:', error)
      return null
    }
  }

  /**
   * Execute a workflow step
   */
  private static async executeWorkflowStep(
    workflowId: string,
    step: WorkflowStep,
    intakeData: Record<string, any>
  ): Promise<void> {
    try {
      switch (step.type) {
        case 'document_generation':
          await this.generateDocumentForStep(workflowId, step, intakeData)
          break

        case 'review':
          await this.createReviewTask(workflowId, step)
          break

        case 'approval':
          await this.createApprovalTask(workflowId, step)
          break

        case 'client_task':
          await this.createClientTask(workflowId, step)
          break

        case 'external_action':
          await this.executeExternalAction(workflowId, step, intakeData)
          break
      }

      // Mark step as completed
      await this.markStepCompleted(workflowId, step.id)
    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error)
    }
  }

  /**
   * Generate document for workflow step
   */
  private static async generateDocumentForStep(
    workflowId: string,
    step: WorkflowStep,
    intakeData: Record<string, any>
  ): Promise<void> {
    try {
      const templateId = step.config.template_id
      const variables = this.prepareDocumentVariables(step.config.variables, intakeData)

      // Create document from template
      const response = await fetch('/api/documents/create-from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          title: step.config.document_title,
          variables
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Link document to workflow
        await supabase
          .from('active_workflows')
          .update({
            created_documents: supabase.sql`created_documents || ${JSON.stringify({
              [step.id]: data.document.id
            })}`
          })
          .eq('id', workflowId)
      }
    } catch (error) {
      console.error('Document generation error:', error)
    }
  }

  /**
   * Prepare document variables from intake data
   */
  private static prepareDocumentVariables(
    variableConfig: Record<string, string>,
    intakeData: Record<string, any>
  ): Record<string, any> {
    const variables: Record<string, any> = {}

    Object.entries(variableConfig).forEach(([varName, dataPath]) => {
      // Simple dot notation support (e.g., "client.name")
      const value = dataPath.split('.').reduce((obj, key) => obj?.[key], intakeData)
      if (value !== undefined) {
        variables[varName] = value
      }
    })

    return variables
  }

  /**
   * Set up workflow deadlines
   */
  private static async setupWorkflowDeadlines(
    workflowId: string,
    deadlines: WorkflowDeadline[],
    matterId: string
  ): Promise<void> {
    try {
      const deadlineInserts = deadlines.map(deadline => ({
        matter_id: matterId,
        title: deadline.name,
        description: deadline.description,
        due_date: new Date(Date.now() + deadline.days_from_intake * 24 * 60 * 60 * 1000).toISOString(),
        priority: deadline.priority,
        created_by: 'system' // This should be the actual user
      }))

      const { data: createdDeadlines, error } = await supabase
        .from('deadlines')
        .insert(deadlineInserts)
        .select('id')

      if (!error && createdDeadlines) {
        const deadlineIds = createdDeadlines.map(d => d.id)

        await supabase
          .from('active_workflows')
          .update({
            created_deadlines: deadlineIds
          })
          .eq('id', workflowId)
      }
    } catch (error) {
      console.error('Deadline setup error:', error)
    }
  }

  /**
   * Mark workflow step as completed
   */
  private static async markStepCompleted(workflowId: string, stepId: string): Promise<void> {
    try {
      await supabase
        .from('active_workflows')
        .update({
          completed_steps: supabase.sql`array_append(completed_steps, ${stepId})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)

      // Check if workflow is complete
      await this.checkWorkflowCompletion(workflowId)
    } catch (error) {
      console.error('Step completion error:', error)
    }
  }

  /**
   * Check if workflow is complete
   */
  private static async checkWorkflowCompletion(workflowId: string): Promise<void> {
    try {
      const { data: workflow } = await supabase
        .from('active_workflows')
        .select('*, workflow_templates(*)')
        .eq('id', workflowId)
        .single()

      if (workflow && workflow.workflow_templates) {
        const template = workflow.workflow_templates
        const completedCount = workflow.completed_steps?.length || 0
        const totalSteps = template.steps?.length || 0

        if (completedCount === totalSteps) {
          await supabase
            .from('active_workflows')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              progress_percentage: 100
            })
            .eq('id', workflowId)
        } else {
          const progress = Math.round((completedCount / totalSteps) * 100)
          await supabase
            .from('active_workflows')
            .update({
              progress_percentage: progress
            })
            .eq('id', workflowId)
        }
      }
    } catch (error) {
      console.error('Workflow completion check error:', error)
    }
  }

  /**
   * Get workflow templates for a practice area
   */
  static async getWorkflowTemplates(caseType?: string): Promise<WorkflowTemplate[]> {
    try {
      let query = supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (caseType) {
        query = query.eq('case_type', caseType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Template fetch error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Template fetch error:', error)
      return []
    }
  }

  /**
   * Get active workflow for a matter
   */
  static async getActiveWorkflow(matterId: string): Promise<ActiveWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('active_workflows')
        .select(`
          *,
          workflow_templates(*)
        `)
        .eq('matter_id', matterId)
        .eq('status', 'active')
        .single()

      if (error) {
        return null
      }

      return data
    } catch (error) {
      console.error('Active workflow fetch error:', error)
      return null
    }
  }

  /**
   * Create default workflow templates
   */
  static async createDefaultTemplates(): Promise<void> {
    try {
      const templates: Omit<WorkflowTemplate, 'id' | 'created_at'>[] = [
        {
          name: 'Contract Dispute Litigation',
          description: 'Complete workflow for contract dispute cases',
          case_type: 'contract_dispute',
          jurisdiction: 'general',
          is_active: true,
          steps: [
            {
              id: 'intake_review',
              name: 'Review Intake Information',
              description: 'Review and validate client intake information',
              order: 1,
              type: 'review',
              config: {},
              dependencies: [],
              estimated_duration: 2
            },
            {
              id: 'generate_complaint',
              name: 'Generate Initial Complaint',
              description: 'Create initial complaint document',
              order: 2,
              type: 'document_generation',
              config: {
                template_id: 'complaint_template',
                document_title: 'Complaint - {{client_name}} vs {{defendant_name}}',
                variables: {
                  client_name: 'client.name',
                  defendant_name: 'defendant_name',
                  case_facts: 'case_facts'
                }
              },
              dependencies: ['intake_review'],
              estimated_duration: 4
            },
            {
              id: 'conflict_check',
              name: 'Perform Conflict Check',
              description: 'Automated conflict of interest check',
              order: 3,
              type: 'external_action',
              config: { action_type: 'conflict_check' },
              dependencies: ['intake_review'],
              estimated_duration: 1
            }
          ],
          required_documents: ['complaint', 'summons', 'client_intake'],
          deadlines: [
            {
              name: 'File Initial Complaint',
              description: 'File complaint with court within statute of limitations',
              days_from_intake: 30,
              priority: 'urgent',
              assigned_to: 'attorney'
            },
            {
              name: 'Serve Defendant',
              description: 'Serve complaint and summons on defendant',
              days_from_intake: 60,
              priority: 'high',
              assigned_to: 'paralegal'
            }
          ],
          notifications: [
            {
              trigger: 'workflow_started',
              recipient: 'client',
              type: 'email',
              template: 'case_intake_confirmation'
            },
            {
              trigger: 'document_generated',
              recipient: 'attorney',
              type: 'in_app',
              template: 'document_ready_review'
            }
          ]
        },
        {
          name: 'Estate Planning Package',
          description: 'Complete estate planning workflow',
          case_type: 'estate_planning',
          jurisdiction: 'general',
          is_active: true,
          steps: [
            {
              id: 'client_interview',
              name: 'Client Intake Interview',
              description: 'Complete comprehensive client interview',
              order: 1,
              type: 'client_task',
              config: {
                task_description: 'Schedule and complete estate planning intake interview',
                estimated_completion: 7
              },
              dependencies: [],
              estimated_duration: 8
            },
            {
              id: 'generate_will',
              name: 'Generate Last Will & Testament',
              description: 'Create customized will document',
              order: 2,
              type: 'document_generation',
              config: {
                template_id: 'will_template',
                document_title: 'Last Will and Testament - {{client_name}}',
                variables: {
                  client_name: 'client.name',
                  beneficiaries: 'beneficiaries',
                  executors: 'executors'
                }
              },
              dependencies: ['client_interview'],
              estimated_duration: 6
            },
            {
              id: 'generate_trust',
              name: 'Generate Revocable Living Trust',
              description: 'Create revocable living trust document',
              order: 3,
              type: 'document_generation',
              config: {
                template_id: 'trust_template',
                document_title: 'Revocable Living Trust - {{client_name}}',
                variables: {
                  client_name: 'client.name',
                  trust_property: 'trust_property',
                  trustees: 'trustees'
                }
              },
              dependencies: ['client_interview'],
              estimated_duration: 8
            }
          ],
          required_documents: ['will', 'trust', 'power_of_attorney', 'healthcare_directive'],
          deadlines: [
            {
              name: 'Complete Client Interview',
              description: 'Finish comprehensive client intake',
              days_from_intake: 14,
              priority: 'high',
              assigned_to: 'attorney'
            },
            {
              name: 'Document Review Period',
              description: 'Allow time for client document review',
              days_from_intake: 45,
              priority: 'medium',
              assigned_to: 'client'
            }
          ],
          notifications: [
            {
              trigger: 'workflow_started',
              recipient: 'client',
              type: 'email',
              template: 'estate_planning_started'
            },
            {
              trigger: 'document_generated',
              recipient: 'client',
              type: 'email',
              template: 'document_ready_review',
              delay_days: 1
            }
          ]
        }
      ]

      for (const template of templates) {
        await supabase
          .from('workflow_templates')
          .upsert(template, { onConflict: 'name,case_type,jurisdiction' })
      }

      console.log('Default workflow templates created')
    } catch (error) {
      console.error('Template creation error:', error)
    }
  }

  // Helper methods for specific step types
  private static async createReviewTask(workflowId: string, step: WorkflowStep): Promise<void> {
    // Implementation for creating review tasks
    console.log(`Creating review task for step: ${step.name}`)
  }

  private static async createApprovalTask(workflowId: string, step: WorkflowStep): Promise<void> {
    // Implementation for creating approval tasks
    console.log(`Creating approval task for step: ${step.name}`)
  }

  private static async createClientTask(workflowId: string, step: WorkflowStep): Promise<void> {
    // Implementation for creating client tasks
    console.log(`Creating client task for step: ${step.name}`)
  }

  private static async executeExternalAction(
    workflowId: string,
    step: WorkflowStep,
    intakeData: Record<string, any>
  ): Promise<void> {
    // Implementation for external actions (like conflict checks, API calls, etc.)
    console.log(`Executing external action for step: ${step.name}`)
  }

  private static async scheduleWorkflowNotifications(
    workflowId: string,
    notifications: WorkflowNotification[],
    matterId: string
  ): Promise<void> {
    // Implementation for scheduling notifications
    console.log(`Scheduling ${notifications.length} notifications for workflow`)
  }
}
