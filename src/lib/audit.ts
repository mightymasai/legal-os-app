import { supabase } from './supabase'

export interface AuditEvent {
  id: string
  user_id: string
  action: string
  resource_type: 'document' | 'matter' | 'client' | 'user' | 'system'
  resource_id: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export class AuditLogger {
  /**
   * Log a user action
   */
  static async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    try {
      const auditEvent = {
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: this.getClientIP(request),
        user_agent: request?.headers.get('user-agent') || undefined
      }

      await supabase
        .from('audit_logs')
        .insert(auditEvent)
    } catch (error) {
      console.error('Audit logging error:', error)
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  /**
   * Log document actions
   */
  static async logDocumentAction(
    userId: string,
    action: 'created' | 'viewed' | 'edited' | 'deleted' | 'shared' | 'downloaded',
    documentId: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.log(userId, `document_${action}`, 'document', documentId, details, request)
  }

  /**
   * Log matter actions
   */
  static async logMatterAction(
    userId: string,
    action: 'created' | 'updated' | 'viewed' | 'closed' | 'conflict_checked',
    matterId: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.log(userId, `matter_${action}`, 'matter', matterId, details, request)
  }

  /**
   * Log user authentication actions
   */
  static async logAuthAction(
    userId: string,
    action: 'login' | 'logout' | 'password_changed' | 'profile_updated',
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.log(userId, `auth_${action}`, 'user', userId, details, request)
  }

  /**
   * Get audit trail for a resource
   */
  static async getAuditTrail(
    resourceType: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditEvent[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(full_name, email)
        `)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching audit trail:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Audit trail fetch error:', error)
      return []
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(
    userId: string,
    limit: number = 100
  ): Promise<AuditEvent[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user activity:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('User activity fetch error:', error)
      return []
    }
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const { data: events, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error generating compliance report:', error)
        return null
      }

      // Analyze the audit events
      const report = {
        period: { startDate, endDate },
        totalEvents: events?.length || 0,
        eventBreakdown: this.analyzeEventBreakdown(events || []),
        complianceMetrics: this.calculateComplianceMetrics(events || []),
        riskIndicators: this.identifyRiskIndicators(events || []),
        recommendations: this.generateComplianceRecommendations(events || [])
      }

      return report
    } catch (error) {
      console.error('Compliance report generation error:', error)
      return null
    }
  }

  /**
   * Analyze event breakdown by type
   */
  private static analyzeEventBreakdown(events: AuditEvent[]): Record<string, number> {
    const breakdown: Record<string, number> = {}

    events.forEach(event => {
      breakdown[event.action] = (breakdown[event.action] || 0) + 1
    })

    return breakdown
  }

  /**
   * Calculate compliance metrics
   */
  private static calculateComplianceMetrics(events: AuditEvent[]) {
    const documentActions = events.filter(e => e.resource_type === 'document')
    const matterActions = events.filter(e => e.resource_type === 'matter')

    return {
      totalDocumentsAccessed: new Set(documentActions.map(e => e.resource_id)).size,
      totalMattersManaged: new Set(matterActions.map(e => e.resource_id)).size,
      conflictChecksPerformed: events.filter(e => e.action === 'conflict_check_performed').length,
      documentsSharedSecurely: events.filter(e => e.action === 'document_shared').length,
      regularSecurityAudits: events.filter(e => e.action.includes('security')).length
    }
  }

  /**
   * Identify risk indicators
   */
  private static identifyRiskIndicators(events: AuditEvent[]): string[] {
    const indicators: string[] = []

    // Check for unusual access patterns
    const lateNightAccess = events.filter(e => {
      const hour = new Date(e.created_at).getHours()
      return hour < 6 || hour > 22 // Outside 6 AM - 10 PM
    })

    if (lateNightAccess.length > events.length * 0.1) {
      indicators.push('Unusual after-hours access detected')
    }

    // Check for failed authentication attempts
    const failedAuths = events.filter(e => e.action.includes('failed'))
    if (failedAuths.length > 5) {
      indicators.push('Multiple authentication failures detected')
    }

    // Check for document sharing with external parties
    const externalShares = events.filter(e => e.action === 'document_shared' && e.details?.external)
    if (externalShares.length > 10) {
      indicators.push('High volume of external document sharing')
    }

    return indicators
  }

  /**
   * Generate compliance recommendations
   */
  private static generateComplianceRecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = []

    const hasConflictChecks = events.some(e => e.action === 'conflict_check_performed')
    if (!hasConflictChecks) {
      recommendations.push('Implement regular conflict checking procedures')
    }

    const documentAccesses = events.filter(e => e.resource_type === 'document').length
    if (documentAccesses > 100) {
      recommendations.push('Consider implementing additional document access controls')
    }

    const externalShares = events.filter(e => e.action === 'document_shared').length
    if (externalShares > 20) {
      recommendations.push('Review document sharing policies and procedures')
    }

    // Always include basic recommendations
    recommendations.push('Maintain regular backups of all client data')
    recommendations.push('Conduct annual security training for all staff')
    recommendations.push('Regularly review and update access permissions')

    return recommendations
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(request?: Request): string | undefined {
    if (!request) return undefined

    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = request.headers.get('x-client-ip')

    return forwarded?.split(',')[0] || realIP || clientIP || undefined
  }

  /**
   * Check for suspicious activity
   */
  static async detectSuspiciousActivity(userId: string): Promise<{
    alerts: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    try {
      // Get recent activity (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: recentEvents } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', yesterday.toISOString())

      const alerts: string[] = []
      let riskLevel: 'low' | 'medium' | 'high' = 'low'

      if (!recentEvents) return { alerts, riskLevel }

      // Check for unusual patterns
      const uniqueIPs = new Set(recentEvents.map(e => e.ip_address).filter(Boolean))
      if (uniqueIPs.size > 3) {
        alerts.push('Access from multiple IP addresses detected')
        riskLevel = 'medium'
      }

      const failedActions = recentEvents.filter(e => e.action.includes('failed')).length
      if (failedActions > 5) {
        alerts.push('Multiple failed actions detected')
        riskLevel = 'high'
      }

      const bulkDownloads = recentEvents.filter(e => e.action === 'document_downloaded').length
      if (bulkDownloads > 20) {
        alerts.push('Unusual volume of document downloads')
        riskLevel = 'medium'
      }

      return { alerts, riskLevel }
    } catch (error) {
      console.error('Suspicious activity detection error:', error)
      return { alerts: ['Unable to analyze activity patterns'], riskLevel: 'low' }
    }
  }

  /**
   * Export audit data for compliance reporting
   */
  static async exportAuditData(
    userId: string,
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string | null> {
    try {
      const { data: events, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

      if (error || !events) {
        console.error('Error exporting audit data:', error)
        return null
      }

      if (format === 'csv') {
        return this.convertToCSV(events)
      }

      return JSON.stringify(events, null, 2)
    } catch (error) {
      console.error('Audit data export error:', error)
      return null
    }
  }

  /**
   * Convert audit events to CSV format
   */
  private static convertToCSV(events: AuditEvent[]): string {
    const headers = ['timestamp', 'action', 'resource_type', 'resource_id', 'ip_address', 'details']
    const rows = events.map(event => [
      event.created_at,
      event.action,
      event.resource_type,
      event.resource_id,
      event.ip_address || '',
      JSON.stringify(event.details || {})
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    return csvContent
  }
}
