import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Creates a Supabase client for client-side (browser) code.
 * This client is aware of and uses cookies for session management.
 */
export function createBrowserClient() {
  return _createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
} 