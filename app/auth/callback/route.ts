import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { initializeUser } from "@/lib/user-initialization"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  if (error) {
    console.error("[Auth Callback] Error during authentication:", {
      error,
      error_description,
      url: requestUrl.toString()
    })
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_callback_error#error=${error}&error_description=${encodeURIComponent(error_description || '')}`
    )
  }

  if (code) {
    try {
      const supabase = await createServerClient()

      // Exchange the code for a session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error("[Auth Callback] Session exchange error:", sessionError)
        throw sessionError
      }

      if (!session?.user) {
        console.error("[Auth Callback] No user in session after exchange")
        throw new Error("No user in session")
      }

      // Initialize user data for new users
      const initResult = await initializeUser(
        session.user.id,
        session.user.email!,
        session.user.user_metadata
      )

      if (!initResult.success) {
        console.error("[Auth Callback] User initialization failed:", initResult.details)
        // Continue with redirect even if initialization fails
        // The user can still log in, and we can retry initialization later
      } else if (initResult.wasInitialized) {
        // console.log("[Auth Callback] User initialized successfully:", initResult.details)
      }

      // Redirect to the home page
      return NextResponse.redirect(requestUrl.origin)
    } catch (error) {
      console.error("[Auth Callback] Critical error:", error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_callback_error#error=server_error&error_code=unexpected_failure&error_description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
      )
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
