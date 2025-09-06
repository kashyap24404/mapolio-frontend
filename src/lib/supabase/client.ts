import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../supabase'

// Create a single supabase client for client-side use
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)