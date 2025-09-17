import { supabase } from '@/lib/supabase/client'
import { loadUserProfile } from '@/lib/supabase/user-service'
import { loadPricingPlan } from '@/lib/supabase/pricing-service'
import { withTimeoutAndRetry } from '@/lib/services/base-service'
import { User } from '@supabase/supabase-js'
import { Profile, UserCredits } from './types'

// This function is now a no-op as we're using SWR's built-in revalidation
// The previous visibility handler was causing the "thundering herd" problem
export const setupVisibilityHandler = (
  user: User | null, 
  setUser: (user: User | null) => void, 
  setProfile: (profile: Profile | null) => void, 
  setCredits: (credits: UserCredits | null) => void
) => {
  // This function is now a no-op as we're using SWR's built-in revalidation
  // The previous visibility handler was causing the "thundering herd" problem
  console.log('Custom visibility handler is disabled - using SWR revalidation instead');
  return () => {};
}

export const signIn = async (
  email: string, 
  password: string, 
  setLoading: (loading: boolean) => void,
  setUser: (user: User | null) => void,
  setProfile: (profile: Profile | null) => void,
  setCredits: (credits: UserCredits | null) => void
) => {
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
        await loadUserProfile(data.user.id, setProfile, setCredits)
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

export const signUp = async (
  email: string, 
  password: string, 
  displayName: string | undefined,
  setLoading: (loading: boolean) => void,
  setUser: (user: User | null) => void,
  setProfile: (profile: Profile | null) => void,
  setCredits: (credits: UserCredits | null) => void
) => {
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
          await loadUserProfile(data.user.id, setProfile, setCredits)
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

export const signOut = async (
  setUser: (user: User | null) => void,
  setProfile: (profile: Profile | null) => void,
  setCredits: (credits: UserCredits | null) => void
) => {
  try {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCredits(null)
  } catch (error) {
    console.error('Error during sign out:', error)
  }
}