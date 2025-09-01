import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create client with real-time enabled and legacy compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    }
  },
  global: {
    headers: {
      'X-Client-Info': '@supabase/supabase-js',
    }
  },
  db: {
    schema: 'public'
  }
})

// Database types (based on your existing schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          credits: number
          created_at: string
          updated_at: string
          notification_settings: Record<string, any>
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
          notification_settings?: Record<string, any>
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
          notification_settings?: Record<string, any>
        }
      }
      scraping_jobs: {
        Row: {
          id: string
          user_id: string
          search_query: string
          location: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          results_count: number
          credits_used: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          search_query: string
          location: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results_count?: number
          credits_used?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: string
          location?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results_count?: number
          credits_used?: number
          created_at?: string
          completed_at?: string | null
        }
      }
      scraping_results: {
        Row: {
          id: string
          job_id: string
          business_name: string
          address: string
          phone: string | null
          website: string | null
          rating: number | null
          review_count: number | null
          category: string | null
          hours: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          business_name: string
          address: string
          phone?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number | null
          category?: string | null
          hours?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          business_name?: string
          address?: string
          phone?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number | null
          category?: string | null
          hours?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Typed Supabase client
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>