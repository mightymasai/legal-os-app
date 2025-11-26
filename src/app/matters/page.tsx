import { requireAuth } from '@/lib/authServer'
import MattersClient from './MattersClient'

export default async function Matters() {
  // Server-side auth check
  await requireAuth()

  return <MattersClient />
}
