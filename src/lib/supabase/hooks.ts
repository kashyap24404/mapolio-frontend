import { useContext } from 'react'
import { SupabaseContext } from '@/lib/supabase/context'

// Re-export page visibility hooks for convenience
export { usePageVisibility, useActiveOnVisible } from './hooks/usePageVisibility'

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}