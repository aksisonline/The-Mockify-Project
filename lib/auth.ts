import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
} 