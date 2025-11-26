import { requireAuth } from '@/lib/authServer'
import DocumentsClient from './DocumentsClient'

export default async function Documents() {
  // Server-side auth check
  await requireAuth()

  return <DocumentsClient />
}
