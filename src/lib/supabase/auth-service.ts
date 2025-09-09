import { supabase } from '@/lib/supabase/client'
import { loadUserProfile } from '@/lib/supabase/user-service'
import { loadPricingPlan } from '@/lib/supabase/pricing-service'
import { withTimeoutAndRetry } from '@/lib/services/base-service'

// Debounce utility for visibility changes
let visibilityDebounceTimer: NodeJS.Timeout | null = null;
let lastVisibilityCheck = 0;
let isVisibilityHandlerActive = false; // Flag to prevent multiple handlers
const VISIBILITY_DEBOUNCE_MS = 3000; // 3 seconds - increased for better stability
const MIN_CHECK_INTERVAL = 60000; // 60 seconds minimum between session checks - increased to reduce frequency

// Handle tab visibility changes to refresh session when user returns to tab
export const setupVisibilityHandler = (user: any, setUser: Function, setProfile: Function, setCredits: Function) => {
  // Prevent multiple handlers from being set up
  if (isVisibilityHandlerActive) {
    return () => {};
  }
  
  isVisibilityHandlerActive = true;
  
  const handleVisibilityChange = async () => {
    // Only process when becoming visible, user exists, and we're not in the middle of processing
    if (document.visibilityState !== 'visible' || !user) {
      return;
    }

    // Clear any existing timer
    if (visibilityDebounceTimer) {
      clearTimeout(visibilityDebounceTimer);
    }

    // Debounce rapid visibility changes
    visibilityDebounceTimer = setTimeout(async () => {
      const now = Date.now();
      
      // Don't check session too frequently
      if (now - lastVisibilityCheck < MIN_CHECK_INTERVAL) {
        return;
      }

      lastVisibilityCheck = now;
      
      try {
        const { data: { session } } = await withTimeoutAndRetry(
          async () => {
            return await supabase.auth.getSession();
          },
          60000, // 60 second timeout
          3, // 3 retries
          'check-session'
        );
        
        // Only refresh if session is actually expired (with 10 minute buffer)
        if (!session || (session.expires_at && new Date(session.expires_at * 1000) < new Date(Date.now() + 10 * 60 * 1000))) {
          const { data: { session: refreshedSession }, error } = await withTimeoutAndRetry(
            async () => {
              return await supabase.auth.refreshSession();
            },
            60000, // 60 second timeout
            3, // 3 retries
            'refresh-session'
          );
          
          if (error) {
            setUser(null);
            setProfile(null);
            setCredits(null);
          } else if (refreshedSession?.user) {
            // Only update user if it's different to prevent unnecessary re-renders
            if (refreshedSession.user.id !== user.id) {
              setUser(refreshedSession.user);
            }
            // Profile and credits reload will be handled by the auth state change listener
          } else {
            setUser(null);
            setProfile(null);
            setCredits(null);
          }
        }
      } catch (error) {
        // Don't force sign out on network errors - just log and continue
      }
    }, VISIBILITY_DEBOUNCE_MS);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    isVisibilityHandlerActive = false;
    if (visibilityDebounceTimer) {
      clearTimeout(visibilityDebounceTimer);
      visibilityDebounceTimer = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

export const signIn = async (
  email: string, 
  password: string, 
  setLoading: Function,
  setUser: Function,
  setProfile: Function,
  setCredits: Function
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
  setLoading: Function,
  setUser: Function,
  setProfile: Function,
  setCredits: Function
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
  setUser: Function,
  setProfile: Function,
  setCredits: Function
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