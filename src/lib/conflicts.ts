import { supabase } from './supabase'

export interface ConflictCheck {
  id: string
  matter_id: string
  checked_by: string
  parties_involved: string[]
  conflicts_found: ConflictResult[]
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface ConflictResult {
  party_name: string
  conflict_type: 'direct' | 'indirect' | 'potential' | 'past_representation'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  related_matters?: string[]
}

export class ConflictChecker {
  /**
   * Perform comprehensive conflict check for a matter
   */
  static async checkConflicts(
    matterId: string,
    userId: string,
    parties: string[]
  ): Promise<ConflictCheck | null> {
    try {
      const conflicts = await this.analyzeConflicts(matterId, userId, parties)
      const riskLevel = this.calculateRiskLevel(conflicts)
      const recommendations = this.generateRecommendations(conflicts, riskLevel)

      const conflictCheck: Omit<ConflictCheck, 'id' | 'created_at'> = {
        matter_id: matterId,
        checked_by: userId,
        parties_involved: parties,
        conflicts_found: conflicts,
        risk_level: riskLevel,
        recommendations
      }

      const { data, error } = await supabase
        .from('conflict_checks')
        .insert(conflictCheck)
        .select()
        .single()

      if (error) {
        console.error('Error saving conflict check:', error)
        return null
      }

      // Log the conflict check
      await this.logConflictCheck(userId, matterId, riskLevel)

      return data
    } catch (error) {
      console.error('Conflict check error:', error)
      return null
    }
  }

  /**
   * Analyze conflicts for given parties
   */
  private static async analyzeConflicts(
    matterId: string,
    userId: string,
    parties: string[]
  ): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = []

    for (const party of parties) {
      // Check for direct conflicts (current representation)
      const directConflicts = await this.checkDirectConflicts(party, userId)
      conflicts.push(...directConflicts)

      // Check for indirect conflicts (family, business relationships)
      const indirectConflicts = await this.checkIndirectConflicts(party, userId)
      conflicts.push(...indirectConflicts)

      // Check for past representation conflicts
      const pastConflicts = await this.checkPastRepresentation(party, userId)
      conflicts.push(...pastConflicts)

      // Check for organizational conflicts
      const orgConflicts = await this.checkOrganizationalConflicts(party, userId)
      conflicts.push(...orgConflicts)
    }

    return conflicts
  }

  /**
   * Check for direct conflicts (currently representing the party)
   */
  private static async checkDirectConflicts(party: string, userId: string): Promise<ConflictResult[]> {
    try {
      const { data: matters } = await supabase
        .from('matters')
        .select('id, title, client(name)')
        .eq('user_id', userId)
        .neq('status', 'closed')

      const conflicts: ConflictResult[] = []

      for (const matter of matters || []) {
        const clientName = matter.client?.name?.toLowerCase() || ''
        const partyLower = party.toLowerCase()

        // Check if party matches client name or is mentioned in matter title
        if (clientName.includes(partyLower) || matter.title.toLowerCase().includes(partyLower)) {
          conflicts.push({
            party_name: party,
            conflict_type: 'direct',
            description: `Currently representing ${matter.client?.name} in matter "${matter.title}"`,
            severity: 'critical',
            related_matters: [matter.id]
          })
        }
      }

      return conflicts
    } catch (error) {
      console.error('Direct conflict check error:', error)
      return []
    }
  }

  /**
   * Check for indirect conflicts (family, business relationships)
   */
  private static async checkIndirectConflicts(party: string, userId: string): Promise<ConflictResult[]> {
    try {
      // This would typically check against a relationships database
      // For now, we'll do basic name matching for common relationship indicators

      const relationshipIndicators = [
        'spouse', 'husband', 'wife', 'partner', 'child', 'parent', 'sibling',
        'brother', 'sister', 'son', 'daughter', 'father', 'mother',
        'llc', 'inc', 'corp', 'ltd', 'co', 'partners', 'associates'
      ]

      const conflicts: ConflictResult[] = []
      const partyLower = party.toLowerCase()

      for (const indicator of relationshipIndicators) {
        if (partyLower.includes(indicator)) {
          conflicts.push({
            party_name: party,
            conflict_type: 'indirect',
            description: `Potential indirect relationship detected (${indicator})`,
            severity: 'medium'
          })
        }
      }

      return conflicts
    } catch (error) {
      console.error('Indirect conflict check error:', error)
      return []
    }
  }

  /**
   * Check for past representation conflicts
   */
  private static async checkPastRepresentation(party: string, userId: string): Promise<ConflictResult[]> {
    try {
      const { data: closedMatters } = await supabase
        .from('matters')
        .select('id, title, client(name)')
        .eq('user_id', userId)
        .eq('status', 'closed')
        .order('updated_at', { ascending: false })
        .limit(50) // Check last 50 closed matters

      const conflicts: ConflictResult[] = []

      for (const matter of closedMatters || []) {
        const clientName = matter.client?.name?.toLowerCase() || ''
        const partyLower = party.toLowerCase()

        if (clientName.includes(partyLower) || matter.title.toLowerCase().includes(partyLower)) {
          conflicts.push({
            party_name: party,
            conflict_type: 'past_representation',
            description: `Previously represented ${matter.client?.name} in closed matter "${matter.title}"`,
            severity: 'high',
            related_matters: [matter.id]
          })
        }
      }

      return conflicts
    } catch (error) {
      console.error('Past representation check error:', error)
      return []
    }
  }

  /**
   * Check for organizational conflicts
   */
  private static async checkOrganizationalConflicts(party: string, userId: string): Promise<ConflictResult[]> {
    try {
      // Check if party is a company and if we've represented competitors or related entities
      const companySuffixes = ['llc', 'inc', 'corp', 'ltd', 'co', 'ltd', 'plc', 'gmbh']
      const partyLower = party.toLowerCase()

      const isCompany = companySuffixes.some(suffix => partyLower.includes(suffix))

      if (isCompany) {
        // Check for similar company names in past matters
        const { data: companyMatters } = await supabase
          .from('matters')
          .select('id, title, opposing_party')
          .eq('user_id', userId)
          .not('opposing_party', 'is', null)

        const conflicts: ConflictResult[] = []

        for (const matter of companyMatters || []) {
          const opposing = matter.opposing_party?.toLowerCase() || ''
          if (opposing && this.isSimilarCompany(partyLower, opposing)) {
            conflicts.push({
              party_name: party,
              conflict_type: 'potential',
              description: `Similar company "${matter.opposing_party}" involved in past matter "${matter.title}"`,
              severity: 'medium',
              related_matters: [matter.id]
            })
          }
        }

        return conflicts
      }

      return []
    } catch (error) {
      console.error('Organizational conflict check error:', error)
      return []
    }
  }

  /**
   * Check if two company names are similar
   */
  private static isSimilarCompany(name1: string, name2: string): boolean {
    // Simple similarity check - in production, this would use more sophisticated algorithms
    const words1 = name1.toLowerCase().split(/[\s\.,\-_]+/).filter(word => word.length > 2)
    const words2 = name2.toLowerCase().split(/[\s\.,\-_]+/).filter(word => word.length > 2)

    const commonWords = words1.filter(word => words2.includes(word))
    return commonWords.length >= 2 // At least 2 common significant words
  }

  /**
   * Calculate overall risk level from conflicts
   */
  private static calculateRiskLevel(conflicts: ConflictResult[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (conflicts.length === 0) return 'none'

    const criticalCount = conflicts.filter(c => c.severity === 'critical').length
    const highCount = conflicts.filter(c => c.severity === 'high').length
    const mediumCount = conflicts.filter(c => c.severity === 'medium').length

    if (criticalCount > 0) return 'critical'
    if (highCount > 0) return 'high'
    if (mediumCount >= 2) return 'high'
    if (mediumCount > 0) return 'medium'
    return 'low'
  }

  /**
   * Generate recommendations based on conflicts and risk level
   */
  private static generateRecommendations(conflicts: ConflictResult[], riskLevel: string): string[] {
    const recommendations: string[] = []

    switch (riskLevel) {
      case 'critical':
        recommendations.push('IMMEDIATE: Decline representation due to direct conflict of interest')
        recommendations.push('Document conflict check and reasoning in matter file')
        recommendations.push('Consider referral to another attorney')
        break

      case 'high':
        recommendations.push('HIGH RISK: Consult with senior partner before proceeding')
        recommendations.push('Obtain informed consent from all parties')
        recommendations.push('Establish ethical wall if proceeding')
        break

      case 'medium':
        recommendations.push('Obtain written conflict waiver from all parties')
        recommendations.push('Document conflict analysis and mitigation steps')
        recommendations.push('Monitor for changes in relationships')
        break

      case 'low':
        recommendations.push('Monitor situation for potential conflicts')
        recommendations.push('Document conflict check results')
        break

      default:
        recommendations.push('No conflicts identified - proceed with standard due diligence')
    }

    if (conflicts.some(c => c.conflict_type === 'past_representation')) {
      recommendations.push('Review applicable rules of professional conduct for former client conflicts')
    }

    return recommendations
  }

  /**
   * Log conflict check for audit trail
   */
  private static async logConflictCheck(userId: string, matterId: string, riskLevel: string): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'conflict_check_performed',
          resource_type: 'matter',
          resource_id: matterId,
          details: {
            risk_level: riskLevel,
            automated_check: true
          }
        })
    } catch (error) {
      console.error('Error logging conflict check:', error)
    }
  }

  /**
   * Get conflict check history for a matter
   */
  static async getConflictHistory(matterId: string): Promise<ConflictCheck[]> {
    try {
      const { data, error } = await supabase
        .from('conflict_checks')
        .select(`
          *,
          checked_by_profile:profiles!conflict_checks_checked_by_fkey(full_name, email),
          reviewed_by_profile:profiles!conflict_checks_reviewed_by_fkey(full_name, email)
        `)
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching conflict history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Conflict history fetch error:', error)
      return []
    }
  }

  /**
   * Mark conflict check as reviewed
   */
  static async reviewConflictCheck(
    conflictCheckId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conflict_checks')
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId
        })
        .eq('id', conflictCheckId)

      if (error) {
        console.error('Error reviewing conflict check:', error)
        return false
      }

      // Log the review
      await supabase
        .from('audit_logs')
        .insert({
          user_id: reviewerId,
          action: approved ? 'conflict_check_approved' : 'conflict_check_rejected',
          resource_type: 'conflict_check',
          resource_id: conflictCheckId,
          details: { notes, approved }
        })

      return true
    } catch (error) {
      console.error('Conflict check review error:', error)
      return false
    }
  }
}
