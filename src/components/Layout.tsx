'use client'

import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        {/* You can add a Footer component here if needed */}
      </div>
    </AuthProvider>
  )
}
