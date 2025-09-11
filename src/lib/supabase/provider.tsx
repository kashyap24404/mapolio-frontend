'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SupabaseContext } from './context'
import { loadUserProfile } from './user-service'
import { loadUserCredits } from './credit-service'
import { loadPricingPlan } from './pricing-service'
import { setupVisibilityHandler, signIn, signUp, signOut } from './auth-service'
import { refreshCredits, purchaseCredits, useCredits } from './credit-service'
import { updateProfile } from './user-service'
import { SupabaseContextType, Profile, UserCredits, PricingPlan } from './types'
import { User, Session } from '@supabase/supabase-js'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [pricingPlan, setPricingPlan] = useState<PricingPlan | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable functions to prevent infinite loops
  const stableSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  const stableSetProfile = useCallback((newProfile: Profile | null) => {
    setProfile(newProfile);
  }, []);

  const stableSetCredits = useCallback((newCredits: UserCredits | null) => {
    setCredits(newCredits);
  }, []);

  const stableSetPricingPlan = useCallback((newPricingPlan: PricingPlan | null) => {
    setPricingPlan(newPricingPlan);
  }, []);

  const stableSetLoading = useCallback((newLoading: boolean) => {
    setLoading(newLoading);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<SupabaseContextType>(() => ({
    user,
    profile,
    credits,
    pricingPlan,
    loading,
    signIn: async (email: string, password: string) => {
      return await signIn(email, password, stableSetLoading, stableSetUser, stableSetProfile, stableSetCredits)
    },
    signUp: async (email: string, password: string, displayName?: string) => {
      return await signUp(email, password, displayName, stableSetLoading, stableSetUser, stableSetProfile, stableSetCredits)
    },
    signOut: async () => {
      return await signOut(stableSetUser, stableSetProfile, stableSetCredits)
    },
    refreshCredits: async () => {
      if (user && user.id) {
        try {
          await refreshCredits(user.id, (userId: string) => loadUserCredits(userId, stableSetCredits))
        } catch (error) {
          console.error('Error refreshing credits:', error);
        }
      } else {
        console.warn('Cannot refresh credits: User not authenticated');
      }
    },
    purchaseCredits: async (amount: number, price: number) => {
      if (!user || !profile) {
        return { success: false, error: { message: 'User not authenticated' } }
      }

      return await purchaseCredits(
        user.id, 
        profile, 
        amount, 
        price, 
        stableSetProfile, 
        stableSetCredits, 
        (userId: string) => loadUserCredits(userId, stableSetCredits)
      )
    },
    useCredits: async (amount: number) => {
      if (!user || !profile) {
        return { success: false, error: { message: 'User not authenticated' } }
      }

      return await useCredits(
        user.id, 
        profile, 
        amount, 
        stableSetProfile, 
        stableSetCredits, 
        (userId: string) => loadUserCredits(userId, stableSetCredits)
      )
    },
    updateProfile: async (updates: { display_name?: string; notification_settings?: Record<string, unknown> }) => {
      if (!user || !profile) {
        return { success: false, error: { message: 'User not authenticated' } }
      }

      return await updateProfile(user.id, profile, updates, stableSetProfile)
    }
  }), [user, profile, credits, pricingPlan, loading])

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
          if (isMounted) {
            stableSetLoading(false)
          }
          return
        }
        
        if (session?.user) {
          stableSetUser(session.user)
          // Load profile and credits with error handling
          try {
            await loadUserProfile(session.user.id, stableSetProfile, stableSetCredits)
          } catch (profileError) {
            console.error('Error loading user profile after session init:', profileError)
            // Continue with session even if profile loading fails
          }
        } else {
          // No session, ensure state is clean
          stableSetUser(null)
          stableSetProfile(null)
          stableSetCredits(null)
        }
        
        // Load pricing plan regardless of user authentication
        try {
          await loadPricingPlan(stableSetPricingPlan)
        } catch (planError) {
          // Continue without pricing plan
        }
        
        if (isMounted) {
          stableSetLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (isMounted) {
          stableSetLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!isMounted) return
        
        if (session?.user) {
          stableSetUser(session.user)
          try {
            await loadUserProfile(session.user.id, stableSetProfile, stableSetCredits)
          } catch (profileError) {
            console.error('Error loading user profile after auth change:', profileError)
            // Continue with session even if profile loading fails
          }
        } else {
          stableSetUser(null)
          stableSetProfile(null)
          stableSetCredits(null)
        }
        
        if (isMounted) {
          stableSetLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle tab visibility changes to refresh session when user returns to tab
  useEffect(() => {
    return setupVisibilityHandler(user, stableSetUser, stableSetProfile, stableSetCredits)
  }, [user])

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  )
}