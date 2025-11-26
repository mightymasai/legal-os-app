import { supabase } from './supabase'

export const AuthService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signUp(email: string, password: string, data?: object) {
    return supabase.auth.signUp({ email, password, options: { data } })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  onAuthStateChange(callback: (event: string, session: { user: { id: string } } | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
