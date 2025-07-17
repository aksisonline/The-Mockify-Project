import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Creates a Supabase client for server-side code (Server Components, API Routes, Route Handlers).
 * It uses the Next.js `cookies` function to manage session data.
 */
export async function createServerClient() {
  const cookieStore = await cookies()
  return _createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: any) {
          await cookieStore.set(name, value, options)
        },
        async remove(name: string, options: any) {
          await cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for server-side code within Next.js Middleware.
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })
}

/**
 * Creates a Supabase client with the service role key for admin-level operations.
 * WARNING: Never expose this client or its key to the browser.
 */
export function createServiceRoleClient() {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!supabaseServiceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// For static generation (no cookies/headers context)
export function createStaticServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
} 