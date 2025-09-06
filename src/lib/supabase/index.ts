// Export all supabase related components and hooks
export { SupabaseProvider } from './provider'
export { useSupabase } from './hooks'
export { supabase } from '@/lib/supabase/client'
export type { Profile, PricingPlan, UserCredits, SupabaseContextType } from './types'