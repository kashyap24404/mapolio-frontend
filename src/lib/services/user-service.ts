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
        60000, // 60 second timeout
        3, // 3 retries
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
            .single();
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `get-profile-by-email-${email}` // unique key
      );

      if (existingProfile) {
        return { profile: existingProfile, error: null };
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        return { profile: null, error: fetchError };
      }

      // Create new profile
      const newProfileId = userId || crypto.randomUUID();
      const { data: newProfile, error: createError } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .insert({
              id: newProfileId,
              email,
              credits: 0,
              notification_settings: {}
            })
            .select()
            .single();
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `create-profile-legacy-${newProfileId}` // unique key
      );

      return { profile: newProfile, error: createError };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get profile by ID
  async getProfileById(id: string) {
    // Validate ID
    if (!id) {
      return { profile: null, error: new Error('User ID is required') };
    }
    
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `get-profile-by-id-${id}` // unique key
      );

      return { profile: data, error };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Update profile
  async updateProfile(id: string, updates: { display_name?: string; notification_settings?: Record<string, any> }) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `update-profile-${id}` // unique key
      );

      return { profile: data, error };
    } catch (error) {
      return { profile: null, error };
    }
  }
}