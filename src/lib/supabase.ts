import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types for your Supabase tables (optional but recommended for type safety)
export type Profile = {
  id: string
  full_name: string
  avatar_url?: string
  updated_at?: string
}

export type Document = {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type Collaboration = {
  id: string
  document_id: string
  user_id: string
  permissions: 'read' | 'write' | 'admin'
  created_at: string
}

export type Template = {
  id: string
  user_id: string
  name: string
  content: string
  created_at: string
}

export type Client = {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
}
