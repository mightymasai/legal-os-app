'use client'

import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DeadlineManager } from '@/lib/deadlines'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [deadlineStats, setDeadlineStats] = useState({
    totalUpcoming: 0,
    urgent: 0,
    overdue: 0,
    completedThisWeek: 0
  })
  const [urgentDeadlines, setUrgentDeadlines] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadDeadlineData()
    }
  }, [user, loading, router])

  const loadDeadlineData = async () => {
    if (!user) return

    try {
      const [stats, urgent] = await Promise.all([
        DeadlineManager.getDeadlineStats(user.id),
        DeadlineManager.getUpcomingDeadlines(user.id, 3) // Next 3 days
      ])

      setDeadlineStats(stats)
      setUrgentDeadlines(urgent.slice(0, 5)) // Show top 5 urgent deadlines
    } catch (error) {
      console.error('Error loading deadline data:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null // Redirecting
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user.email}!</h1>
            <p className="text-xl text-gray-600">Your legal practice dashboard</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Documents</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Cases</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900">70%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Alerts */}
          {(deadlineStats.urgent > 0 || deadlineStats.overdue > 0) && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Deadline Alerts</h3>

              {deadlineStats.overdue > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-semibold">Overdue Deadlines</h4>
                      <p className="text-red-700">You have {deadlineStats.overdue} overdue deadline{deadlineStats.overdue !== 1 ? 's' : ''}. Immediate attention required.</p>
                    </div>
                  </div>
                </div>
              )}

              {deadlineStats.urgent > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-orange-800 font-semibold">Urgent Deadlines</h4>
                      <p className="text-orange-700">You have {deadlineStats.urgent} urgent deadline{deadlineStats.urgent !== 1 ? 's' : ''} due within 7 days.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/documents" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group-hover:border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Documents</h3>
                <p className="text-gray-600 mb-4">Create, edit, and manage your legal documents with AI assistance.</p>
                <span className="text-blue-600 font-semibold group-hover:text-blue-700">Manage Documents →</span>
              </div>
            </Link>

            <Link href="/clients" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group-hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Clients</h3>
                <p className="text-gray-600 mb-4">Manage client profiles, cases, and communication in one place.</p>
                <span className="text-green-600 font-semibold group-hover:text-green-700">Manage Clients →</span>
              </div>
            </Link>

            <Link href="/templates" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group-hover:border-purple-200">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Templates</h3>
                <p className="text-gray-600 mb-4">Create and use document templates to speed up your workflow.</p>
                <span className="text-purple-600 font-semibold group-hover:text-purple-700">Manage Templates →</span>
              </div>
            </Link>
          </div>

          {/* AI Insights Panel */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Prediction */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">AI Case Prediction</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">78%</div>
                <p className="text-sm text-gray-600 mb-3">Favorable Outcome</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Confidence Score</p>
              </div>
            </div>

            {/* Research Insights */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Legal Research</h3>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
                <p className="text-sm text-gray-600 mb-2">Cases Found</p>
                <p className="text-xs text-gray-500">Last search: Employment Law</p>
              </div>
            </div>

            {/* Deadline Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Court Deadlines</h3>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">3</div>
                <p className="text-sm text-gray-600 mb-2">Due This Week</p>
                <p className="text-xs text-red-600 font-medium">⚠️ 1 overdue</p>
              </div>
            </div>
          </div>

          {/* Advanced Features Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Research</h3>
              <p className="text-sm text-gray-600 mb-3">Instant access to case law, statutes, and legal precedents</p>
              <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700">Access Research →</span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Predictive Analytics</h3>
              <p className="text-sm text-gray-600 mb-3">AI-powered case outcome predictions with 78% accuracy</p>
              <span className="text-green-600 text-sm font-medium group-hover:text-green-700">View Predictions →</span>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Voice Dictation</h3>
              <p className="text-sm text-gray-600 mb-3">Dictate documents with AI transcription and formatting</p>
              <span className="text-purple-600 text-sm font-medium group-hover:text-purple-700">Start Dictating →</span>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Deadlines</h3>
              <p className="text-sm text-gray-600 mb-3">Automated court deadline tracking and rule compliance</p>
              <span className="text-orange-600 text-sm font-medium group-hover:text-orange-700">Manage Deadlines →</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">AI generated Employment Contract with 94% compliance score</p>
                  <p className="text-gray-600 text-sm">2 hours ago • Version 3</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">AI Enhanced</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Found 23 relevant employment law precedents</p>
                  <p className="text-gray-600 text-sm">4 hours ago • California Jurisdiction</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Research</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Case outcome prediction: 78% favorable with settlement likely</p>
                  <p className="text-gray-600 text-sm">1 day ago • Updated with new evidence</p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">Prediction</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Court deadline approaching: Discovery responses due in 3 days</p>
                  <p className="text-gray-600 text-sm">2 days ago • Requires immediate attention</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full animate-pulse">Urgent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
