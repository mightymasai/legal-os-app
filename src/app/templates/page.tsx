import { requireAuth } from '@/lib/authServer'
import TemplatesClient from './TemplatesClient'

// Define the type for a Template object
export type Template = {
  id: string;
  name: string;
  content: Record<string, unknown>; // Using Record for JSON structure
  created_at: string;
};

export default async function Templates() {
  // Server-side auth check
  await requireAuth()

  return <TemplatesClient />
}
