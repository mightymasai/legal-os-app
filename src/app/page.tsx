'use client'

import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import Dashboard from './dashboard/page'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Legal OS...</p>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />
  }

  // Show dashboard for authenticated users
  return <Dashboard />
}
