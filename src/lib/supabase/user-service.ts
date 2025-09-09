import { supabase } from '@/lib/supabase/client'
import { userService } from '@/lib/services'
import { loadUserCredits } from '@/lib/supabase/credit-service'
import { withTimeoutAndRetry } from '@/lib/services/base-service'

export const loadUserProfile = async (userId: string, setProfile: Function, setCredits: Function) => {
  console.log('Loading user profile for ID:', userId);
  
  // Validate userId
  if (!userId) {
    console.error('Cannot load user profile: userId is missing');
    return;
  }
  
  try {
    const { profile, error } = await userService.getProfileById(userId);
    
    if (!error && profile) {
      setProfile(profile);
      // Load credits after profile is loaded
      try {
        await loadUserCredits(userId, setCredits);
      } catch (creditsError) {
        // Continue with profile even if credits loading fails
      }
    } else if (error) {
      // Try to create profile if it doesn't exist
      try {
        const { data: userData } = await withTimeoutAndRetry(
          async () => {
            return await supabase.auth.getUser();
          },
          60000, // 60 second timeout
          3, // 3 retries
          'get-user-data'
        );
        if (userData.user) {
          const { profile: newProfile, error: createError } = await userService.createProfile(userId, userData.user.email!);
          if (!createError && newProfile) {
            setProfile(newProfile);
            // Load credits after profile is created
            try {
              await loadUserCredits(userId, setCredits);
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
        await loadUserCredits(userId, setCredits);
      } catch (creditsError) {
        console.error('Error loading user credits as fallback:', creditsError);
      }
    }
  }
};

export const updateProfile = async (
  userId: string,
  profile: any,
  updates: { display_name?: string; notification_settings?: Record<string, any> },
  setProfile: Function
) => {
  if (!userId || !profile) {
    return { success: false, error: { message: 'User not authenticated' } }
  }

  try {
    const { profile: updatedProfile, error } = await userService.updateProfile(userId, updates)
    
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