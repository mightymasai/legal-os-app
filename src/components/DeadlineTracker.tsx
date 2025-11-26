'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Deadline {
  id: string
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'completed' | 'overdue'
  assigned_to?: string
  days_until_due: number
}

interface DeadlineTrackerProps {
  matterId: string
  onDeadlineAction: (deadlineId: string, action: 'complete' | 'snooze') => void
}

export default function DeadlineTracker({ matterId, onDeadlineAction }: DeadlineTrackerProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'upcoming'>('all')

  useEffect(() => {
    fetchDeadlines()
  }, [matterId])

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('matter_id', matterId)
        .order('due_date', { ascending: true })

      if (error) throw error

      const processedDeadlines = (data || []).map(deadline => ({
        ...deadline,
        days_until_due: Math.ceil((new Date(deadline.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))

      setDeadlines(processedDeadlines)
    } catch (error) {
      console.error('Error fetching deadlines:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'completed') return 'bg-green-100 text-green-800'
    if (status === 'overdue' || daysUntilDue < 0) return 'bg-red-100 text-red-800'
    if (daysUntilDue <= 3) return 'bg-orange-100 text-orange-800'
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const filteredDeadlines = deadlines.filter(deadline => {
    switch (filter) {
      case 'pending': return deadline.status === 'pending'
      case 'overdue': return deadline.status === 'overdue' || deadline.days_until_due < 0
      case 'upcoming': return deadline.status === 'pending' && deadline.days_until_due <= 7
      default: return true
    }
  })

  const handleStatusUpdate = async (deadlineId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', deadlineId)

      if (error) throw error

      // Refresh deadlines
      fetchDeadlines()
      onDeadlineAction(deadlineId, newStatus === 'completed' ? 'complete' : 'snooze')
    } catch (error) {
      console.error('Error updating deadline:', error)
      alert('Failed to update deadline status')
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Case Deadlines
        </h3>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Deadlines</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Due Soon</option>
          </select>
        </div>
      </div>

      {filteredDeadlines.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No deadlines found for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                deadline.status === 'completed'
                  ? 'bg-green-50 border-green-200 opacity-75'
                  : deadline.days_until_due < 0 || deadline.status === 'overdue'
                  ? 'bg-red-50 border-red-200'
                  : deadline.days_until_due <= 3
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`font-semibold ${
                      deadline.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {deadline.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(deadline.status, deadline.days_until_due)}`}>
                      {deadline.status === 'completed'
                        ? 'COMPLETED'
                        : deadline.days_until_due < 0 || deadline.status === 'overdue'
                        ? 'OVERDUE'
                        : `${deadline.days_until_due} days left`
                      }
                    </span>
                  </div>

                  {deadline.description && (
                    <p className="text-gray-600 text-sm mb-2">{deadline.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Due: {new Date(deadline.due_date).toLocaleDateString()}</span>
                    {deadline.assigned_to && (
                      <span>Assigned to: {deadline.assigned_to}</span>
                    )}
                  </div>
                </div>

                {deadline.status !== 'completed' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleStatusUpdate(deadline.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(deadline.id, deadline.status)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Snooze
                    </button>
                  </div>
                )}
              </div>

              {/* Progress indicator for upcoming deadlines */}
              {deadline.status === 'pending' && deadline.days_until_due > 0 && deadline.days_until_due <= 7 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Time remaining</span>
                    <span>{deadline.days_until_due} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        deadline.days_until_due <= 1 ? 'bg-red-500' :
                        deadline.days_until_due <= 3 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.max(10, (7 - deadline.days_until_due) / 7 * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Court Rules Reminder */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>Court Rules Automation:</strong> Deadlines are automatically calculated based on your jurisdiction's court rules.
            Missing a deadline can result in case dismissal or sanctions.
          </div>
        </div>
      </div>
    </div>
  )
}
