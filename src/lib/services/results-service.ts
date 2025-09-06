import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

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
        60000, // 60 second timeout
        3, // 3 retries
        `add-results-${jobId}` // unique key
      );

      return { results: data, error };
    } catch (error) {
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
        60000, // 60 second timeout
        3, // 3 retries
        `get-job-results-${jobId}` // unique key
      );

      return { results: data, error };
    } catch (error) {
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
        60000, // 60 second timeout
        3, // 3 retries
        `export-job-results-${jobId}` // unique key
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
      return { csv: null, error };
    }
  }
}