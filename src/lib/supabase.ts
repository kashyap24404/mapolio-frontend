import { createBrowserClient } from '@supabase/ssr'

// Create a single supabase client for client-side use
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Database types (based on your existing schema)
interface Database {
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
      profile_buy_transactions: {
        Row: {
          id: string
          user_id: string
          gateway_transaction_id: string
          credits_purchased: number
          amount_cents: number
          gateway_payload: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gateway_transaction_id: string
          credits_purchased: number
          amount_cents: number
          gateway_payload?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gateway_transaction_id?: string
          credits_purchased?: number
          amount_cents?: number
          gateway_payload?: Record<string, any> | null
          created_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'purchase' | 'usage'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: 'purchase' | 'usage'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'purchase' | 'usage'
          description?: string
          created_at?: string
        }
      }
      pricing_plan: {
        Row: {
          id: string
          name: string
          price_per_credit: number
          min_purchase_usd: number
          max_purchase_usd: number
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price_per_credit: number
          min_purchase_usd: number
          max_purchase_usd: number
          description: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_per_credit?: number
          min_purchase_usd?: number
          max_purchase_usd?: number
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          created_at: string
          updated_at: string
          published: boolean
          meta_description: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
          published?: boolean
          meta_description?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
          published?: boolean
          meta_description?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      finalize_dynamic_paypal_purchase: {
        Args: {
          user_id_input: string
          credits_to_add: number
          amount_cents_input: number
          gateway_id_input: string
          gateway_payload: Record<string, unknown>
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}

// Typed Supabase client
type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>

export type { Database, TypedSupabaseClient }