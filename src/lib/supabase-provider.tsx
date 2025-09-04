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
          if (isMounted) {
            setLoading(false)
          }
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          // Load profile and credits with error handling
          try {
            await loadUserProfile(session.user.id)
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
          await loadPricingPlan()
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
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          setUser(session.user)
          try {
            await loadUserProfile(session.user.id)
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
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('Tab became visible, checking session status...');
        
        // Check if session is still valid
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          // If session doesn't exist or is expired, try to refresh it
          if (!session || (session.expires_at && new Date(session.expires_at * 1000) < new Date())) {
            console.log('Session expired or missing, attempting to refresh...');
            const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
            
            if (error) {
              console.error('Failed to refresh session:', error);
              // If refresh fails, sign out the user
              setUser(null);
              setProfile(null);
              setCredits(null);
            } else if (refreshedSession?.user) {
              console.log('Session refreshed successfully');
              setUser(refreshedSession.user);
              try {
                await loadUserProfile(refreshedSession.user.id);
              } catch (profileError) {
                console.error('Error loading user profile after session refresh:', profileError);
              }
            } else {
              // No session after refresh, sign out
              setUser(null);
              setProfile(null);
              setCredits(null);
            }
          }
        } catch (error) {
          console.error('Error checking session status:', error);
          // Network errors during session check should not automatically sign out the user
          // They might be temporary connectivity issues
          console.warn('Network error during session check. This may be temporary.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Add a retry mechanism for network requests
  const withRetry = async <T extends unknown>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;
        console.warn(`Attempt ${i + 1} failed:`, (error as Error).message || error);
        
        // Don't retry if it's a specific error we know won't succeed
        if ((error as Error)?.message?.includes('Request timeout') && i < retries - 1) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  const loadUserProfile = async (userId: string) => {
    console.log('Loading user profile for ID:', userId);
    
    // Validate userId
    if (!userId) {
      console.error('Cannot load user profile: userId is missing');
      return;
    }
    
    try {
      const { profile, error } = await userService.getProfileById(userId);
      
      if (!error && profile) {
        console.log('Successfully loaded user profile:', profile);
        setProfile(profile);
        // Load credits after profile is loaded
        try {
          await loadUserCredits(userId);
        } catch (creditsError) {
          console.error('Error loading user credits after profile load:', creditsError);
          // Continue with profile even if credits loading fails
        }
      } else if (error) {
        console.error('Error loading user profile:', error);
        // Try to create profile if it doesn't exist
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            console.log('Creating new profile for user:', userData.user.id, userData.user.email);
            const { profile: newProfile, error: createError } = await userService.createProfile(userId, userData.user.email!);
            if (!createError && newProfile) {
              setProfile(newProfile);
              // Load credits after profile is created
              try {
                await loadUserCredits(userId);
              } catch (creditsError) {
                console.error('Error loading user credits after profile creation:', creditsError);
                // Continue with profile even if credits loading fails
              }
            } else {
              console.error('Error creating user profile:', createError);
            }
          }
        } catch (authError) {
          console.error('Error getting user data for profile creation:', authError);
        }
      }
    } catch (error) {
      console.error('Unexpected error loading user profile:', error);
      // Check if this is a network timeout error
      if ((error as Error)?.message?.includes('timeout')) {
        console.warn('Network timeout occurred while loading user profile. This may be due to poor network connectivity.');
        // We don't want to completely fail the authentication flow due to a profile loading issue
        // The user can still be authenticated even if we can't load their profile immediately
        // Profile will be loaded when network connectivity is restored
      }
      // Even if profile loading fails, try to load credits directly
      if (userId) {
        try {
          await loadUserCredits(userId);
        } catch (creditsError) {
          console.error('Error loading user credits as fallback:', creditsError);
        }
      }
    }
  };

  const loadUserCredits = async (userId: string) => {
    try {
      const { credits: userCredits, error } = await creditService.getUserCredits(userId);
      if (!error && userCredits) {
        setCredits(userCredits);
      } else if (error) {
        console.error('Error loading user credits:', error);
      }
    } catch (error) {
      console.error('Unexpected error loading user credits:', error);
    }
  };

  const loadPricingPlan = async () => {
    try {
      const { plan, error } = await creditService.getActivePricingPlan();
      if (!error && plan) {
        setPricingPlan(plan);
      } else if (error) {
        console.error('Error loading pricing plan:', error);
      }
    } catch (error) {
      console.error('Unexpected error loading pricing plan:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setLoading(false)
        console.error('Sign in error:', error);
        return { success: false, error }
      }

      if (data.user) {
        setUser(data.user)
        try {
          await loadUserProfile(data.user.id)
        } catch (profileError) {
          console.error('Error loading user profile after sign in:', profileError);
        }
        setLoading(false)
        return { success: true }
      }

      setLoading(false)
      return { success: false, error: { message: 'Failed to sign in - no user data returned' } }
    } catch (error: unknown) {
      setLoading(false)
      console.error('Unexpected sign in error:', error);
      return { success: false, error: { message: (error as Error).message || 'Failed to sign in - network error' } }
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
        console.error('Sign up error:', error);
        return { success: false, error }
      }

      if (data.user) {
        // Check if user needs email confirmation
        if (data.user.email_confirmed_at) {
          // Email already confirmed (unlikely for new users)
          setUser(data.user)
          try {
            await loadUserProfile(data.user.id)
          } catch (profileError) {
            console.error('Error loading user profile after sign up:', profileError);
          }
          setLoading(false)
          return { success: true, needsVerification: false }
        } else {
          // Email confirmation required
          setLoading(false)
          return { success: true, needsVerification: true, email: data.user.email }
        }
      }

      setLoading(false)
      return { success: false, error: { message: 'Failed to sign up - no user data returned' } }
    } catch (error: unknown) {
      setLoading(false)
      console.error('Unexpected sign up error:', error);
      return { success: false, error: { message: (error as Error).message || 'Failed to sign up - network error' } }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setCredits(null)
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const refreshCredits = async () => {
    if (user && user.id) {
      try {
        await loadUserCredits(user.id)
      } catch (error) {
        console.error('Error refreshing credits:', error);
      }
    } else {
      console.warn('Cannot refresh credits: User not authenticated');
    }
  }

  const purchaseCredits = async (amount: number, price: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    try {
      const { success, profile: updatedProfile, error } = await creditService.purchaseCredits(user.id, amount, price)
      
      if (success && updatedProfile) {
        setProfile(updatedProfile)
        // Refresh credits after purchase
        try {
          await loadUserCredits(user.id)
        } catch (creditsError) {
          console.error('Error refreshing credits after purchase:', creditsError)
        }
        return { success: true }
      } else {
        return { success: false, error }
      }
    } catch (error) {
      console.error('Unexpected error purchasing credits:', error)
      return { success: false, error: { message: 'Failed to purchase credits' } }
    }
  }

  const useCredits = async (amount: number) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    try {
      // Get current credits first
      const { credits: currentCredits, error: fetchError } = await creditService.getUserCredits(user.id)
      
      if (fetchError) {
        return { success: false, error: fetchError }
      }

      const currentTotal = currentCredits?.total || 0
      
      if (currentTotal < amount) {
        return { success: false, error: { message: 'Insufficient credits' } }
      }

      // Update credits
      const newTotal = currentTotal - amount
      // Use supabase directly to update credits since userService.updateProfile doesn't accept credits parameter
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('profiles')
          .update({
            credits: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()
      })

      if (!error && data) {
        // Update the profile in state
        setProfile({ ...profile, credits: newTotal })
        // Refresh credits after usage
        try {
          await loadUserCredits(user.id)
        } catch (creditsError) {
          console.error('Error refreshing credits after usage:', creditsError)
        }
        return { success: true }
      } else {
        return { success: false, error }
      }
    } catch (error) {
      console.error('Unexpected error using credits:', error)
      return { success: false, error: { message: 'Failed to use credits' } }
    }
  }

  const updateProfile = async (updates: { display_name?: string; notification_settings?: Record<string, any> }) => {
    if (!user || !profile) {
      return { success: false, error: { message: 'User not authenticated' } }
    }

    try {
      const { profile: updatedProfile, error } = await userService.updateProfile(user.id, updates)
      
      if (!error && updatedProfile) {
        setProfile(updatedProfile)
        return { success: true }
      } else {
        return { success: false, error: error || { message: 'Failed to update profile' } }
      }
    } catch (error) {
      console.error('Unexpected error updating profile:', error)
      return { success: false, error: { message: 'Failed to update profile' } }
    }
  }

  return (
    <SupabaseContext.Provider
      value={{
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
      }}
    >
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