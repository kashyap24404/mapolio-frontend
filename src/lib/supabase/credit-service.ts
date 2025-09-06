import { supabase } from '@/lib/supabase/client'
import { creditService } from '@/lib/services'
import { withTimeoutAndRetry } from '@/lib/services/base-service'

export const loadUserCredits = async (userId: string, setCredits: Function) => {
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

export const refreshCredits = async (userId: string, loadUserCredits: Function) => {
  if (userId) {
    try {
      await loadUserCredits(userId)
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  } else {
    console.warn('Cannot refresh credits: User not authenticated');
  }
}

export const purchaseCredits = async (
  userId: string,
  profile: any,
  amount: number, 
  price: number,
  setProfile: Function,
  setCredits: Function,
  loadUserCredits: Function
) => {
  if (!userId || !profile) {
    return { success: false, error: { message: 'User not authenticated' } }
  }

  try {
    const { success, profile: updatedProfile, error } = await creditService.purchaseCredits(userId, amount, price)
    
    if (success && updatedProfile) {
      setProfile(updatedProfile)
      // Refresh credits after purchase
      try {
        await loadUserCredits(userId, setCredits)
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

export const useCredits = async (
  userId: string,
  profile: any,
  amount: number,
  setProfile: Function,
  setCredits: Function,
  loadUserCredits: Function
) => {
  if (!userId || !profile) {
    return { success: false, error: { message: 'User not authenticated' } }
  }

  try {
    // Get current credits first
    const { credits: currentCredits, error: fetchError } = await creditService.getUserCredits(userId)
    
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
    const { data, error } = await withTimeoutAndRetry(
      async () => {
        return await supabase
          .from('profiles')
          .update({
            credits: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()
      },
      60000, // 60 second timeout
      3, // 3 retries
      `use-credits-${userId}`
    )

    if (!error && data) {
      // Update the profile in state
      setProfile({ ...profile, credits: newTotal })
      // Refresh credits after usage
      try {
        await loadUserCredits(userId, setCredits)
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