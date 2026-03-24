import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client for server-side operations that don't require
 * user authentication (like admin API routes).
 * 
 * This client uses the anon key and doesn't rely on cookies.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
