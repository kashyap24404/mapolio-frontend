import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase.ts'

export type Profile = Database['public']['Tables']['profiles']['Row']

export interface PricingPlan {
  id: string
  name: string
  price_per_credit: number
  min_purchase_usd: number
  max_purchase_usd: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCredits {
  total: number
}

export interface SupabaseContextType {
  user: User | null
  profile: Profile | null
  credits: UserCredits | null
  pricingPlan: PricingPlan | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: any; needsVerification?: boolean; email?: string }>
  signOut: () => Promise<void>
  refreshCredits: () => Promise<void>
  purchaseCredits: (amount: number, price: number) => Promise<{ success: boolean; error?: any }>
  useCredits: (amount: number) => Promise<{ success: boolean; error?: any }>
  updateProfile: (updates: { display_name?: string; notification_settings?: Record<string, any> }) => Promise<{ success: boolean; error?: any }>
}