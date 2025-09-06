'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SupabaseContext } from './context'
import { loadUserProfile } from './user-service'
import { loadUserCredits } from './credit-service'
import { loadPricingPlan } from './pricing-service'
import { setupVisibilityHandler, signIn, signUp, signOut } from './auth-service'
import { refreshCredits, purchaseCredits, useCredits } from './credit-service'
import { updateProfile } from './user-service'
import { SupabaseContextType, Profile, UserCredits, PricingPlan } from './types'
import { User } from '@supabase/supabase-js'

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
          if (isMounted) {
            setLoading(false)
          }
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          // Load profile and credits with error handling
          try {
            await loadUserProfile(session.user.id, setProfile, setCredits)
          } catch (profileError) {
            console.error('Error loading user profile after session init:', profileError)
            // Continue with session even if profile loading fails
          }
        } else {
          // No session, ensure state is clean
          setUser(null)
          setProfile(null)
          setCredits(null)
        }
        
        // Load pricing plan regardless of user authentication
        try {
          await loadPricingPlan(setPricingPlan)
        } catch (planError) {
          console.error('Error loading pricing plan:', planError)
          // Continue without pricing plan
        }
        
        if (isMounted) {
          setLoading(false)
        }
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
      async (event: any, session: any) => {
        if (!isMounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          setUser(session.user)
          try {
            await loadUserProfile(session.user.id, setProfile, setCredits)
          } catch (profileError) {
            console.error('Error loading user profile after auth change:', profileError)
            // Continue with session even if profile loading fails
          }
        } else {
          setUser(null)
          setProfile(null)
          setCredits(null)
        }
        
        if (isMounted) {
          setLoading(false)
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
    return setupVisibilityHandler(user, setUser, setProfile, setCredits)
  }, [user])

  const handleSignIn = async (email: string, password: string) => {
    return await signIn(email, password, setLoading, setUser, setProfile, setCredits)
  }

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    return await signUp(email, password, displayName, setLoading, setUser, setProfile, setCredits)
  }

  const handleSignOut = async () => {
    return await signOut(setUser, setProfile, setCredits)
  }

  const handleRefreshCredits = async () => {
    if (user && user.id) {
      try {
        await refreshCredits(user.id, (userId: string) => loadUserCredits(userId, setCredits))
      } catch (error) {
        console.error('Error refreshing credits:', error);
      }
    } else {
      console.warn('Cannot refresh credits: User not authenticated');
    }
  }

  const handlePurchaseCredits = async (amount: number, price: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    return await purchaseCredits(
      user.id, 
      profile, 
      amount, 
      price, 
      setProfile, 
      setCredits, 
      (userId: string) => loadUserCredits(userId, setCredits)
    )
  }

  const handleUseCredits = async (amount: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    return await useCredits(
      user.id, 
      profile, 
      amount, 
      setProfile, 
      setCredits, 
      (userId: string) => loadUserCredits(userId, setCredits)
    )
  }

  const handleUpdateProfile = async (updates: { display_name?: string; notification_settings?: Record<string, any> }) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    return await updateProfile(user.id, profile, updates, setProfile)
  }

  const contextValue: SupabaseContextType = {
    user,
    profile,
    credits,
    pricingPlan,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshCredits: handleRefreshCredits,
    purchaseCredits: handlePurchaseCredits,
    useCredits: handleUseCredits,
    updateProfile: handleUpdateProfile
  }

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  )
}