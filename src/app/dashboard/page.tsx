'use client'

import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard, {user.email}!</h1>
        <p className="text-lg">This is your central hub for Legal OS.</p>
        {/* Add dashboard content here */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Recent Documents</h2>
            <p>View and manage your latest legal documents.</p>
            <a href="/documents" className="text-indigo-600 hover:underline">Go to Documents</a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Client Management</h2>
            <p>Manage your client profiles and cases.</p>
            <a href="/clients" className="text-indigo-600 hover:underline">Go to Clients</a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Templates</h2>
            <p>Access and create document templates.</p>
            <a href="/templates" className="text-indigo-600 hover:underline">Go to Templates</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
