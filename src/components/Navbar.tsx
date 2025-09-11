'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Legal OS
        </Link>
        <div className="space-x-4">
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/documents" className="hover:text-gray-300">
            Documents
          </Link>
          <Link href="/templates" className="hover:text-gray-300">
            Templates
          </Link>
          <Link href="/clients" className="hover:text-gray-300">
            Clients
          </Link>
          {user ? (
            <button onClick={signOut} className="hover:text-gray-300">
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-gray-300">
                Sign In
              </Link>
              <Link href="/auth/signup" className="hover:text-gray-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
