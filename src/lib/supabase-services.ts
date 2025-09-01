import { supabase } from './supabase'

// User Management
export const userService = {
  // Create a new profile (used after signup)
  async createProfile(userId: string, email: string, displayName?: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: displayName || null,
        credits: 0,
        notification_settings: {}
      })
      .select()
      .single()

    return { profile: data, error }
  },

  // Get or create user profile by email (legacy - for backward compatibility)
  async getOrCreateProfile(email: string, userId?: string) {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return { profile: existingProfile, error: null }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { profile: null, error: fetchError }
    }

    // Create new profile
    const newProfileId = userId || crypto.randomUUID()
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: newProfileId,
        email,
        credits: 0,
        notification_settings: {}
      })
      .select()
      .single()

    return { profile: newProfile, error: createError }
  },

  // Get profile by ID
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    return { profile: data, error }
  },

  // Update profile
  async updateProfile(id: string, updates: { display_name?: string; notification_settings?: Record<string, any> }) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { profile: data, error }
  }
}

// Credit Management
export const creditService = {
  // Get user's credit balance
  async getUserCredits(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (error) return { credits: null, error }

    return { 
      credits: {
        total: data.credits || 0
      }, 
      error: null 
    }
  },

  // Purchase credits (add to existing balance)
  async purchaseCredits(userId: string, creditsAmount: number, price: number) {
    // Get current credits
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) return { success: false, error: fetchError }

    const currentCredits = currentProfile.credits || 0
    const newCredits = currentCredits + creditsAmount

    // Update credits
    const { data, error } = await supabase
      .from('profiles')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) return { success: false, error }

    return { success: true, profile: data, error: null }
  },

  // Get purchase history for a user
  async getPurchaseHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('profile_buy_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return { transactions: null, error }
    
    return { transactions: data, error: null }
  },

  // Get credit transaction history
  async getCreditTransactions(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return { transactions: null, error }
    
    return { transactions: data, error: null }
  },

  // Use credits (deduct from balance)
  async useCredits(userId: string, creditsToUse: number) {
    // Get current credits
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) return { success: false, error: fetchError }

    const currentCredits = currentProfile.credits || 0

    if (currentCredits < creditsToUse) {
      return { 
        success: false, 
        error: { message: 'Insufficient credits' } 
      }
    }

    const newCredits = currentCredits - creditsToUse

    // Update credits
    const { data, error } = await supabase
      .from('profiles')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) return { success: false, error }

    return { success: true, profile: data, error: null }
  }
}

// Scraping Job Management
export const scrapingService = {
  // Create a new scraping job
  async createJob(userId: string, searchQuery: string, location: string) {
    const { data, error } = await supabase
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
      .single()

    return { job: data, error }
  },

  // Update job status
  async updateJobStatus(
    jobId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    resultsCount?: number,
    creditsUsed?: number
  ) {
    const updateData: any = { status }
    
    if (resultsCount !== undefined) updateData.results_count = resultsCount
    if (creditsUsed !== undefined) updateData.credits_used = creditsUsed
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('scraping_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single()

    return { job: data, error }
  },

  // Get user's jobs
  async getUserJobs(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { jobs: data, error }
  },

  // Get job by ID
  async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    return { job: data, error }
  }
}

// Scraping Results Management
export const resultsService = {
  // Add results to a job
  async addResults(jobId: string, results: any[]) {
    const { data, error } = await supabase
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
      .select()

    return { results: data, error }
  },

  // Get results for a job
  async getJobResults(jobId: string, limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('scraping_results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    return { results: data, error }
  },

  // Export results as CSV data
  async exportJobResults(jobId: string) {
    const { data, error } = await supabase
      .from('scraping_results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) return { csv: null, error }

    // Convert to CSV format
    if (!data || data.length === 0) {
      return { csv: '', error: null }
    }

    const headers = [
      'Business Name', 'Address', 'Phone', 'Website', 
      'Rating', 'Review Count', 'Category', 'Hours',
      'Latitude', 'Longitude'
    ]

    const csvRows = [
      headers.join(','),
      ...data.map(row => [
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
    ]

    return { csv: csvRows.join('\n'), error: null }
  }
}

// Scraper Configuration Services
export const scraperService = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('scraper_categories')
      .select('*')
      .order('label', { ascending: true })

    return { categories: data, error }
  },

  // Get all countries
  async getCountries() {
    const { data, error } = await supabase
      .from('scraper_countries')
      .select('*')
      .order('name', { ascending: true })

    return { countries: data, error }
  },

  // Get all data types
  async getDataTypes() {
    const { data, error } = await supabase
      .from('scraper_data_types')
      .select('*')
      .order('label', { ascending: true })

    return { dataTypes: data, error }
  },

  // Get all ratings
  async getRatings() {
    const { data, error } = await supabase
      .from('scraper_ratings')
      .select('*')
      .order('id', { ascending: true })

    return { ratings: data, error }
  }
}