import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createEnrollment, getUserEnrollments, getAllEnrollments } from "@/lib/training-service"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const enrollmentData = await request.json()
    const enrollment = await createEnrollment(enrollmentData, user.email!)

    return NextResponse.json(enrollment)
  } catch (error: any) {
    console.error("API error in POST /api/training/enrollments:", error)
    return NextResponse.json({ error: error.message || "Failed to create enrollment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    console.log("GET /api/training/enrollments: Starting request")
    
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("GET /api/training/enrollments: No user found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("GET /api/training/enrollments: User authenticated:", user.email)

    // Check if user is admin
    const url = new URL(request.url)
    const isAdmin = url.searchParams.get('admin') === 'true'
    
    console.log("GET /api/training/enrollments: isAdmin =", isAdmin)
    
    if (isAdmin) {
      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      console.log("GET /api/training/enrollments: Profile check result:", { profile, profileError })

      if (profileError || !profile || !profile.is_admin) {
        console.log("GET /api/training/enrollments: Admin access denied")
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }

      console.log("GET /api/training/enrollments: Admin access granted, fetching enrollments")
      // Admin can see all enrollments
      const enrollments = await getAllEnrollments()
      console.log("GET /api/training/enrollments: Enrollments fetched successfully")
      return NextResponse.json({ enrollments })
    } else {
      console.log("GET /api/training/enrollments: Regular user, fetching user enrollments")
      // Regular user sees only their enrollments
      const enrollments = await getUserEnrollments(user.email!)
      return NextResponse.json({ enrollments })
    }
  } catch (error: any) {
    console.error("API error in GET /api/training/enrollments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch enrollments" }, { status: 500 })
  }
}
