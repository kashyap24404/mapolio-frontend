import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

// Credit Management
export const creditService = {
  // Get active pricing plan
  async getActivePricingPlan() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('pricing_plan')
            .select('*');
          return result;
        },
        15000, // 15 second timeout
        2, // 2 retries
        'get-active-pricing-plan' // unique key
      );

      if (error) {
        return { 
          plan: null, 
          error 
        };
      }

      // Return the first active plan if any exist, otherwise null
      const plan = data && data.length > 0 ? data[0] : null;

      return { 
        plan, 
        error: null 
      };
    } catch (error) {
      return { 
        plan: null, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  },

  // Get user's credit balance
  async getUserCredits(userId: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();
          return result;
        },
        15000, // Increased to 15 seconds
        2, // 2 retries
        `get-user-credits-${userId}` // unique key
      );

      if (error) return { credits: null, error };

      return { 
        credits: {
          total: data.credits || 0
        }, 
        error: null 
      };
    } catch (error) {
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn(`Network timeout while loading credits for user ${userId}. This may be due to tab inactivity.`);
        // Return a special error that indicates a retry might help
        return { 
          credits: null, 
          error: new Error('Network timeout - please refresh the page or check your connection') 
        };
      }
      return { credits: null, error };
    }
  },

  // Purchase credits (add to existing balance)
  async purchaseCredits(userId: string, creditsAmount: number, price: number) {
    try {
      // Get current credits
      const { data: currentProfile, error: fetchError } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();
          return result;
        },
        15000, // Increased to 15 seconds
        2, // 2 retries
        `get-current-credits-${userId}` // unique key
      );

      if (fetchError) return { success: false, error: fetchError };

      const currentCredits = currentProfile.credits || 0;
      const newCredits = currentCredits + creditsAmount;

      // Update credits
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .update({
              credits: newCredits,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
          return result;
        },
        15000, // Increased to 15 seconds
        2, // 2 retries
        `update-credits-${userId}` // unique key
      );

      if (error) return { success: false, error };

      return { success: true, profile: data, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get purchase history for a user
  async getPurchaseHistory(userId: string, limit = 10) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profile_buy_transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(limit);
          return result;
        },
        15000, // Increased to 15 seconds
        2, // 2 retries
        `get-purchase-history-${userId}` // unique key
      );

      return { transactions: data || [], error };
    } catch (error) {
      return { transactions: [], error };
    }
  }
}