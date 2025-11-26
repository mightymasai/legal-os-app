import { requireAuth } from '@/lib/authServer'
import DocumentEditorClient from './DocumentEditorClient'

// Define the type for a Document
type Document = {
  id: string;
  title: string;
  content: string;
  user_id: string;
};

async function getDocument(id: string) {
  const supabase = await import('@/lib/supabase').then(m => m.supabase)
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('Document not found')
  }

  return data as Document
}

export default async function DocumentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  // Server-side auth check
  const user = await requireAuth()

  // Await params and fetch document on server
  const { id } = await params
  const document = await getDocument(id)

  // Security check: ensure the document belongs to the logged-in user
  if (document.user_id !== user.id) {
    throw new Error('Access denied')
  }

  return <DocumentEditorClient document={document} />
}
