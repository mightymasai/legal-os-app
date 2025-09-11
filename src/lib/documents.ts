import { supabase } from './supabase'

export const DocumentService = {
  async getDocuments(userId: string) {
    return supabase.from('documents').select('*').eq('user_id', userId)
  },

  async createDocument(userId: string, title: string) {
    return supabase.from('documents').insert({ user_id: userId, title, content: '' }).select().single()
  },

  async getDocumentById(documentId: string) {
    return supabase.from('documents').select('*').eq('id', documentId).single()
  },

  async updateDocument(documentId: string, content: string) {
    return supabase.from('documents').update({ content }).eq('id', documentId).select().single()
  },

  async deleteDocument(documentId: string) {
    return supabase.from('documents').delete().eq('id', documentId)
  },
}
