'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Legal OS
          </Link>

          {user ? (
            // Authenticated user navigation
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/documents" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Documents
              </Link>
              <Link href="/templates" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Templates
              </Link>
              <Link href="/clients" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Clients
              </Link>
              <Link href="/matters" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Matters
              </Link>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            // Non-authenticated user navigation
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium scroll-smooth">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium scroll-smooth">
                Pricing
              </a>
              <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            {user ? (
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
