import type { Database } from '../supabase'

export interface Page {
  id: string
  slug: string
  title: string
  content: string
  created_at: string
  updated_at: string
  published: boolean
  meta_description: string | null
}

// Define the type using the Database type from the generated types
export type PageRow = Database['public']['Tables']['pages']['Row']