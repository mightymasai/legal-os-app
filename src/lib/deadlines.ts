import { supabase } from './supabase'

export interface Deadline {
  id: string
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'completed' | 'overdue'
  matter_id?: string
  document_id?: string
  assigned_to?: string
  created_by: string
  created_at: string
  updated_at: string
}

export class DeadlineManager {
  /**
   * Get all upcoming deadlines for a user
   */
  static async getUpcomingDeadlines(userId: string, daysAhead: number = 30): Promise<Deadline[]> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)

      const { data, error } = await supabase
        .from('deadlines')
        .select(`
          *,
          matter:matters(title),
          document:documents(title)
        `)
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
        .lte('due_date', futureDate.toISOString())
        .neq('status', 'completed')
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error fetching deadlines:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Deadline fetch error:', error)
      return []
    }
  }

  /**
   * Get overdue deadlines
   */
  static async getOverdueDeadlines(userId: string): Promise<Deadline[]> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('deadlines')
        .select(`
          *,
          matter:matters(title),
          document:documents(title)
        `)
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
        .lt('due_date', now)
        .neq('status', 'completed')
        .order('due_date', { ascending: false })

      if (error) {
        console.error('Error fetching overdue deadlines:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Overdue deadline fetch error:', error)
      return []
    }
  }

  /**
   * Create a new deadline
   */
  static async createDeadline(
    userId: string,
    deadlineData: Omit<Deadline, 'id' | 'created_at' | 'updated_at' | 'created_by'>
  ): Promise<Deadline | null> {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .insert({
          ...deadlineData,
          created_by: userId,
          status: deadlineData.status || 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating deadline:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Deadline creation error:', error)
      return null
    }
  }

  /**
   * Update deadline status
   */
  static async updateDeadlineStatus(
    deadlineId: string,
    status: 'pending' | 'completed' | 'overdue',
    userId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', deadlineId)
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)

      if (error) {
        console.error('Error updating deadline:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Deadline update error:', error)
      return false
    }
  }

  /**
   * Get deadline statistics
   */
  static async getDeadlineStats(userId: string) {
    try {
      const [upcoming, overdue] = await Promise.all([
        this.getUpcomingDeadlines(userId, 7), // Next 7 days
        this.getOverdueDeadlines(userId)
      ])

      const urgent = upcoming.filter(d => d.priority === 'urgent' || this.getDaysUntil(d.due_date) <= 1)
      const completedThisWeek = await this.getCompletedThisWeek(userId)

      return {
        totalUpcoming: upcoming.length,
        urgent: urgent.length,
        overdue: overdue.length,
        completedThisWeek: completedThisWeek.length
      }
    } catch (error) {
      console.error('Error getting deadline stats:', error)
      return {
        totalUpcoming: 0,
        urgent: 0,
        overdue: 0,
        completedThisWeek: 0
      }
    }
  }

  /**
   * Get completed deadlines this week
   */
  private static async getCompletedThisWeek(userId: string): Promise<Deadline[]> {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
        .eq('status', 'completed')
        .gte('updated_at', weekAgo.toISOString())

      if (error) {
        console.error('Error fetching completed deadlines:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Completed deadlines fetch error:', error)
      return []
    }
  }

  /**
   * Get days until deadline
   */
  static getDaysUntil(dueDate: string): number {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Get deadline priority color
   */
  static getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * Get deadline status color
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * Send deadline reminder notifications
   */
  static async sendReminders(userId: string): Promise<void> {
    try {
      const urgentDeadlines = await this.getUpcomingDeadlines(userId, 1) // Next 24 hours
      const overdueDeadlines = await this.getOverdueDeadlines(userId)

      // In a real implementation, this would integrate with email/SMS services
      console.log(`Sending reminders for ${urgentDeadlines.length} urgent and ${overdueDeadlines.length} overdue deadlines`)

      // Log reminder events
      const reminders = [...urgentDeadlines, ...overdueDeadlines]
      for (const deadline of reminders) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'deadline_reminder_sent',
            resource_type: 'deadline',
            resource_id: deadline.id,
            details: {
              deadline_title: deadline.title,
              due_date: deadline.due_date,
              priority: deadline.priority,
              status: deadline.status
            }
          })
      }
    } catch (error) {
      console.error('Error sending reminders:', error)
    }
  }
}
