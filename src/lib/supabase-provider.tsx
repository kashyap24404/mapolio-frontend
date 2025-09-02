'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { userService, creditService } from '@/lib/supabase-services'
import { type User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

// Define the pricing plan type based on your table structure
interface PricingPlan {
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

interface UserCredits {
  total: number
}

interface SupabaseContextType {
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

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [pricingPlan, setPricingPlan] = useState<PricingPlan | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize and check for existing session
  useEffect(() => {
    let isMounted = true
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
        
        // Load pricing plan regardless of user authentication
        await loadPricingPlan()
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setCredits(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { profile: profileData, error } = await userService.getProfileById(userId)
      
      if (profileData) {
        setProfile(profileData)
        await loadUserCredits(userId)
      } else if (error?.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await userService.createProfile(userId, userData.user.email!)
          await loadUserProfile(userId) // Retry loading
        }
      } else {
        console.error('Error loading user profile:', error)
      }
    } catch (error) {
      console.error('Unexpected error loading user profile:', error)
    }
  }

  const loadUserCredits = async (userId: string) => {
    try {
      const { credits: userCredits, error } = await creditService.getUserCredits(userId)
      if (!error && userCredits) {
        setCredits(userCredits)
      } else if (error) {
        console.error('Error loading user credits:', error)
      }
    } catch (error) {
      console.error('Unexpected error loading user credits:', error)
    }
  }

  const loadPricingPlan = async () => {
    try {
      const { plan, error } = await creditService.getActivePricingPlan()
      if (!error && plan) {
        setPricingPlan(plan)
      } else if (error) {
        console.error('Error loading pricing plan:', error)
      }
    } catch (error) {
      console.error('Unexpected error loading pricing plan:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setLoading(false)
        return { success: false, error }
      }

      if (data.user) {
        setUser(data.user)
        await loadUserProfile(data.user.id)
        setLoading(false)
        return { success: true }
      }

      setLoading(false)
      return { success: false, error: { message: 'Failed to sign in' } }
    } catch (error) {
      setLoading(false)
      return { success: false, error }
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName || null
          }
        }
      })
      
      if (error) {
        setLoading(false)
        return { success: false, error }
      }

      if (data.user) {
        // Check if user needs email confirmation
        if (data.user.email_confirmed_at) {
          // Email already confirmed (unlikely for new users)
          setLoading(false)
          return { success: true, needsVerification: false }
        } else {
          // Email confirmation required
          setLoading(false)
          return { success: true, needsVerification: true, email: data.user.email }
        }
      }

      setLoading(false)
      return { success: false, error: { message: 'Failed to sign up' } }
    } catch (error) {
      setLoading(false)
      return { success: false, error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCredits(null)
  }

  const refreshCredits = async () => {
    if (user && profile) {
      await loadUserCredits(user.id)
    }
  }

  const purchaseCredits = async (amount: number, price: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    const { success, profile: updatedProfile, error } = await creditService.purchaseCredits(user.id, amount, price)
    
    if (success && updatedProfile) {
      // Update local profile with new credit balance
      setProfile(updatedProfile)
      // Refresh credits to update the context
      await refreshCredits()
    }

    return { success, error }
  }

  const useCredits = async (amount: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    const { success, profile: updatedProfile, error } = await creditService.useCredits(user.id, amount)
    
    if (success && updatedProfile) {
      // Update local profile with new credit balance
      setProfile(updatedProfile)
      // Refresh credits to update the context
      await refreshCredits()
    }

    return { success, error }
  }

  const updateProfile = async (updates: { display_name?: string; notification_settings?: Record<string, any> }) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    const { profile: updatedProfile, error } = await userService.updateProfile(user.id, updates)
    
    if (error) {
      return { success: false, error }
    }

    if (updatedProfile) {
      setProfile(updatedProfile)
      return { success: true }
    }

    return { success: false, error: { message: 'Failed to update profile' } }
  }

  const value = {
    user,
    profile,
    credits,
    pricingPlan,
    loading,
    signIn,
    signUp,
    signOut,
    refreshCredits,
    purchaseCredits,
    useCredits,
    updateProfile
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}