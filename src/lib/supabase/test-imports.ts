import { SupabaseProvider, useSupabase } from './index'
import { supabase } from './client'

// This file is just to verify that the imports work correctly
console.log('SupabaseProvider:', SupabaseProvider)
console.log('supabase:', supabase)

export { SupabaseProvider, useSupabase, supabase }