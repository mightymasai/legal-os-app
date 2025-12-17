import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Graceful handling for missing env vars (prevents build failures)
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('Missing Supabase configuration. Please check your environment variables.')
  }
}

// Create client with fallback values to prevent runtime errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

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

export type Matter = {
  id: string
  user_id: string
  client_id?: string
  title: string
  description?: string
  status: 'active' | 'closed' | 'pending' | 'settled'
  case_number?: string
  court?: string
  opposing_party?: string
  deadline?: string
  created_at: string
  updated_at: string
}

export type DocumentVersion = {
  id: string
  document_id: string
  version_number: number
  content: string
  created_by: string
  created_at: string
  change_summary?: string
  file_size?: number
}

export type DocumentShare = {
  id: string
  document_id: string
  shared_with_user_id: string
  shared_by_user_id: string
  permissions: 'view' | 'edit' | 'admin'
  expires_at?: string
  created_at: string
}

export type AuditLog = {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: Record<string, any>
  ip_address?: string
  created_at: string
}