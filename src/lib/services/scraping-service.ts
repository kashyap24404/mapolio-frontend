import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

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
        60000, // 60 second timeout
        3, // 3 retries
        `create-scraping-job-${userId}` // unique key
      );

      return { job: data, error };
    } catch (error) {
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
        60000, // 60 second timeout
        3, // 3 retries
        `update-job-status-${jobId}` // unique key
      );

      return { job: data, error };
    } catch (error) {
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
        60000, // 60 second timeout
        3, // 3 retries
        `get-user-jobs-${userId}` // unique key
      );

      return { jobs: data, error };
    } catch (error) {
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
        60000, // 60 second timeout
        3, // 3 retries
        `get-job-by-id-${jobId}` // unique key
      );

      return { job: data, error };
    } catch (error) {
      return { job: null, error };
    }
  }
}