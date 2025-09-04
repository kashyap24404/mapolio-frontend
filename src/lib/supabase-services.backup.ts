import { supabase } from './supabase'

// Add a timeout wrapper for fetch requests with retry mechanism
const withTimeoutAndRetry = async <T>(fn: () => Promise<T>, timeoutMs: number = 30000, retries: number = 3): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} with timeout ${timeoutMs}ms`);
      const timeoutPromise = new Promise<never>((_, reject) => {
        console.log(`Setting timeout for ${timeoutMs}ms`);
        setTimeout(() => {
          console.log('Timeout triggered');
          reject(new Error(`Request timeout after ${timeoutMs}ms - please check your network connection`));
        }, timeoutMs);
      });
      
      const fnPromise = fn();
      console.log('Executing function promise');
      
      const result = await Promise.race([fnPromise, timeoutPromise]);
      console.log('Function completed successfully');
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, (error as Error).message || error);
      
      // Check if this is an authentication error that might be resolved by refreshing the session
      if ((error as Error)?.message?.includes('JWT expired') || 
          (error as any)?.code === 'PGRST301' || 
          (error as any)?.status === 401) {
        console.log('Authentication error detected, attempting to refresh session...');
        try {
          // Try to refresh the session
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
          } else if (session) {
            console.log('Session refreshed successfully');
            // If session was refreshed, retry immediately without additional delay
            continue;
          }
        } catch (refreshError) {
          console.error('Error during session refresh attempt:', refreshError);
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All retry attempts failed, throwing last error');
  // Provide more context in the error message
  if (lastError && lastError.message) {
    lastError.message = `${lastError.message} (Failed after ${retries} attempts)`;
  }
  throw lastError;
};

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
        3 // 3 retries
      );

      return { profile: data, error };
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
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
        30000, // 30 second timeout
        3 // 3 retries
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
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { profile: newProfile, error: createError };
    } catch (error) {
      console.error('Unexpected error getting or creating profile:', error);
      return { profile: null, error };
    }
  },

  // Get profile by ID
  async getProfileById(id: string) {
    console.log('Fetching profile for ID:', id);
    
    // Validate ID
    if (!id) {
      console.error('Cannot fetch profile: ID is missing');
      return { profile: null, error: new Error('User ID is required') };
    }
    
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          console.log('Executing Supabase query for profile ID:', id);
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (error) {
        console.error('Supabase error fetching profile:', error);
      } else {
        console.log('Successfully fetched profile:', data);
      }
      
      return { profile: data, error };
    } catch (error) {
      console.error('Unexpected error getting profile by ID:', error);
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
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { profile: data, error };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { profile: null, error };
    }
  }
}

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
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (error) {
        console.error('Error fetching pricing plan:', error);
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
      console.error('Unexpected error getting pricing plan:', error);
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
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (error) return { credits: null, error };

      return { 
        credits: {
          total: data.credits || 0
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected error getting user credits:', error);
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
        30000, // 30 second timeout
        3 // 3 retries
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
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (error) return { success: false, error };

      return { success: true, profile: data, error: null };
    } catch (error) {
      console.error('Unexpected error purchasing credits:', error);
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
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { transactions: data || [], error };
    } catch (error) {
      console.error('Unexpected error getting purchase history:', error);
      return { transactions: [], error };
    }
  }
}

// Scraping Job Management
export const scrapingService = {
  // Create a new scraping job
  async createJob(userId: string, searchQuery: string, location: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_jobs')
            .insert({
              user_id: userId,
              search_query: searchQuery,
              location: location,
              status: 'pending',
              results_count: 0,
              credits_used: 0
            })
            .select()
            .single();
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { job: data, error };
    } catch (error) {
      console.error('Unexpected error creating job:', error);
      return { job: null, error };
    }
  },

  // Update job status
  async updateJobStatus(
    jobId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    resultsCount?: number,
    creditsUsed?: number
  ) {
    try {
      const updateData: any = { status };
      
      if (resultsCount !== undefined) updateData.results_count = resultsCount;
      if (creditsUsed !== undefined) updateData.credits_used = creditsUsed;
      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_jobs')
            .update(updateData)
            .eq('id', jobId)
            .select()
            .single();
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { job: data, error };
    } catch (error) {
      console.error('Unexpected error updating job status:', error);
      return { job: null, error };
    }
  },

  // Get user's jobs
  async getUserJobs(userId: string, limit = 10) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { jobs: data, error };
    } catch (error) {
      console.error('Unexpected error getting user jobs:', error);
      return { jobs: null, error };
    }
  },

  // Get job by ID
  async getJobById(jobId: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('id', jobId)
            .single();
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { job: data, error };
    } catch (error) {
      console.error('Unexpected error getting job by ID:', error);
      return { job: null, error };
    }
  }
};

// Scraping Results Management
export const resultsService = {
  // Add results to a job
  async addResults(jobId: string, results: any[]) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_results')
            .insert(
              results.map(result => ({
                job_id: jobId,
                business_name: result.business_name,
                address: result.address,
                phone: result.phone,
                website: result.website,
                rating: result.rating,
                review_count: result.review_count,
                category: result.category,
                hours: result.hours,
                latitude: result.latitude,
                longitude: result.longitude
              }))
            )
            .select();
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { results: data, error };
    } catch (error) {
      console.error('Unexpected error adding results:', error);
      return { results: null, error };
    }
  },

  // Get results for a job
  async getJobResults(jobId: string, limit = 100, offset = 0) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_results')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { results: data, error };
    } catch (error) {
      console.error('Unexpected error getting job results:', error);
      return { results: null, error };
    }
  },

  // Export results as CSV data
  async exportJobResults(jobId: string) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraping_results')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (error) return { csv: null, error };

      // Convert to CSV format
      if (!data || data.length === 0) {
        return { csv: '', error: null };
      }

      const headers = [
        'Business Name', 'Address', 'Phone', 'Website', 
        'Rating', 'Review Count', 'Category', 'Hours',
        'Latitude', 'Longitude'
      ];

      const csvRows = [
        headers.join(','),
        ...data.map((row: any) => [
          `"${row.business_name || ''}"`,
          `"${row.address || ''}"`,
          `"${row.phone || ''}"`,
          `"${row.website || ''}"`,
          row.rating || '',
          row.review_count || '',
          `"${row.category || ''}"`,
          `"${row.hours || ''}"`,
          row.latitude || '',
          row.longitude || ''
        ].join(','))
      ];

      return { csv: csvRows.join('\n'), error: null };
    } catch (error) {
      console.error('Unexpected error exporting job results:', error);
      return { csv: null, error };
    }
  }
};

// Scraper Configuration Services
export const scraperService = {
  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_categories')
            .select('*')
            .order('label', { ascending: true });
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { categories: data, error };
    } catch (error) {
      console.error('Unexpected error getting categories:', error);
      return { categories: null, error };
    }
  },

  // Get all countries
  async getCountries() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_countries')
            .select('*')
            .order('name', { ascending: true });
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { countries: data, error };
    } catch (error) {
      console.error('Unexpected error getting countries:', error);
      return { countries: null, error };
    }
  },

  // Get all data types
  async getDataTypes() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_data_types')
            .select('*')
            .order('label', { ascending: true });
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { dataTypes: data, error };
    } catch (error) {
      console.error('Unexpected error getting data types:', error);
      return { dataTypes: null, error };
    }
  },

  // Get all ratings
  async getRatings() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_ratings')
            .select('*')
            .order('id', { ascending: true });
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { ratings: data, error };
    } catch (error) {
      console.error('Unexpected error getting ratings:', error);
      return { ratings: null, error };
    }
  }
}

// Scraper Task Services
const scraperTaskService = {
  // Get completed scraper tasks for a user
  async getCompletedTasks(userId: string, limit = 10) {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_task')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(limit);
          return result;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      return { tasks: data || [], error };
    } catch (error) {
      console.error('Unexpected error getting completed tasks:', error);
      return { tasks: [], error };
    }
  }
}

export {
  userService,
  creditService,
  scrapingService,
  resultsService,
  scraperService,
  scraperTaskService
}
