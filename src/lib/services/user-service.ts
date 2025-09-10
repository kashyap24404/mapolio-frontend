import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

// User Management
export const userService = {
  // Create a new profile (used after signup)
  async createProfile(userId: string, email: string, displayName?: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email,
              display_name: displayName || null,
              credits: 0,
              notification_settings: {}
            })
            .select()
            .single();
          return result;
        },
        30000, // 30 second timeout
        2, // 2 retries
        `create-profile-${userId}` // unique key
      );

      return { profile: data, error };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get or create user profile by email (legacy - for backward compatibility)
  async getOrCreateProfile(email: string, userId?: string) {
    try {
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle(); // Use maybeSingle to handle case where no profile exists
          return result;
        },
        30000, // 30 second timeout
        2, // 2 retries
        `get-profile-${email}` // unique key
      );

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return { profile: null, error: fetchError };
      }

      // If profile exists, return it
      if (existingProfile) {
        return { profile: existingProfile, error: null };
      }

      // If no profile exists and userId is provided, create one
      if (userId) {
        const { profile, error: createError } = await this.createProfile(userId, email);
        if (createError) {
          console.error('Error creating profile:', createError);
          return { profile: null, error: createError };
        }
        return { profile, error: null };
      }

      // No profile exists and no userId provided
      return { profile: null, error: new Error('Profile not found and no user ID provided for creation') };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get user profile by ID
  async getProfileById(userId: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          return result;
        },
        30000, // 30 second timeout
        2, // 2 retries
        `get-profile-by-id-${userId}` // unique key
      );

      return { profile: data, error };
    } catch (error) {
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn(`Network timeout while loading profile for user ${userId}. This may be due to tab inactivity.`);
        // Return a special error that indicates a retry might help
        return { 
          profile: null, 
          error: new Error('Network timeout - please refresh the page or check your connection') 
        };
      }
      return { profile: null, error };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: { display_name?: string; notification_settings?: Record<string, any> }) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
          return result;
        },
        30000, // 30 second timeout
        2, // 2 retries
        `update-profile-${userId}` // unique key
      );

      return { profile: data, error };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get user's task statistics
  async getUserStats(userId: string) {
    try {
      // Fetch profile data for credits
      const { data: profileData, error: profileError } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();
          return result;
        },
        30000, // 30 second timeout
        2, // 2 retries
        `get-user-stats-profile-${userId}` // unique key
      );

      if (profileError) throw profileError;

      // Calculate used credits from credit_transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .in('type', ['scraping', 'purchase', 'bonus', 'refund']);

      if (transactionError) throw transactionError;

      // Calculate credits: purchases/bonuses add credits, scraping/refunds subtract credits
      const totalCredits = profileData?.credits || 0;
      const usedCredits = (transactionData || []).reduce((total: number, transaction: any) => {
        if (transaction.type === 'scraping') {
          return total + Math.abs(transaction.amount); // Scraping uses credits (positive amount means used)
        }
        return total;
      }, 0);

      // Fetch task statistics
      const { data: taskStats, error: taskError } = await supabase
        .from('scraper_task')
        .select('status')
        .eq('user_id', userId);

      if (taskError) throw taskError;

      const totalTasks = taskStats?.length || 0;
      const completedTasks = taskStats?.filter((task: { status: string }) => task.status === 'completed').length || 0;
      const failedTasks = taskStats?.filter((task: { status: string }) => task.status === 'failed').length || 0;

      return {
        totalCredits,
        usedCredits,
        availableCredits: totalCredits - usedCredits,
        totalTasks,
        completedTasks,
        failedTasks
      };
    } catch (error) {
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn(`Network timeout while loading user stats for user ${userId}. This may be due to tab inactivity.`);
        throw new Error('Network timeout - please refresh the page or check your connection');
      }
      throw error;
    }
  }
}