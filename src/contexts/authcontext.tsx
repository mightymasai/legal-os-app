// src/contexts/AuthContext.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: typeof AuthService.signIn
  signUp: typeof AuthService.signUp
  signOut: typeof AuthService.signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Initial check
    AuthService.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    signIn: AuthService.signIn,
    signUp: AuthService.signUp,
    signOut: AuthService.signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
