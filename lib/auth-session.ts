import { createClient } from "@/lib/supabase-browser"

// Force refresh the session and cookies
export async function refreshAuthSession() {
  const supabase = createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error("Session refresh error:", error)
      return { session: null, error }
    }

    return { session, error: null }
  } catch (error) {
    console.error("Session refresh error:", error)
    return { session: null, error }
  }
}

// Get current session
export async function getCurrentSession() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { session: user, error }
  } catch (error) {
    console.error("Get session error:", error)
    return { session: null, error }
  }
}
