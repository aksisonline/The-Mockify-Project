import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { enrollmentIds } = await request.json()

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json({ error: "Enrollment IDs are required" }, { status: 400 })
    }

    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete the enrollments
    const { error } = await serviceClient
      .from("training_enrollments")
      .delete()
      .in("id", enrollmentIds)

    if (error) {
      console.error("Error deleting enrollments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${enrollmentIds.length} enrollment(s)`,
      deletedCount: enrollmentIds.length
    })

  } catch (error: any) {
    console.error("API error in DELETE /api/training/enrollments/mass-delete:", error)
    return NextResponse.json({ error: error.message || "Failed to delete enrollments" }, { status: 500 })
  }
} 