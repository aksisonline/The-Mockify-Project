// Authentication utilities
import { createServerClient } from "./supabase/server"
import { redirect } from "next/navigation"

export enum UserRole {
  User = "user",
  Admin = "admin",
  SuperAdmin = "superadmin",
}

// Check if user is authenticated and get user data
export async function getAuthenticatedUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return null
  }
}

// Check if user has admin role by querying the profiles table
export async function checkUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await createServerClient()
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()
    
    if (error || !profile) {
      console.error("Error fetching user profile:", error)
      return UserRole.User
    }
    
    return profile.is_admin ? UserRole.Admin : UserRole.User
  } catch (error) {
    console.error("Error checking user role:", error)
    return UserRole.User
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser()
  return !!user
}

// Check if user has required role
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return false
  }
  
  const userRole = await checkUserRole(user.id)
  
  // Admin has access to all user routes
  if (userRole === UserRole.Admin && requiredRole === UserRole.User) {
    return true
  }
  
  return userRole === requiredRole
}

// Middleware to protect admin routes
export function withAuth(requiredRole: UserRole = UserRole.User) {
  return async function authMiddleware() {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      redirect("/login")
    }
    
    const hasRequiredRole = await hasRole(requiredRole)
    
    if (!hasRequiredRole) {
      // Redirect to dashboard with access denied error
      redirect("/dashboard?error=access_denied")
    }
    
    return true
  }
}
