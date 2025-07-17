import { NextResponse } from "next/server"
import { getTrainingPrograms, mockTrainingPrograms } from "@/lib/training-service"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"

export async function GET() {
  try {
    const programs = await getTrainingPrograms()

    // If we got an empty array, return mock data as fallback
    if (!programs || programs.length === 0) {
      return NextResponse.json(mockTrainingPrograms)
    }

    return NextResponse.json(programs)
  } catch (error: any) {
    console.error("API error in GET /api/training/programs:", error)

    // Return mock data instead of an error
    return NextResponse.json(mockTrainingPrograms)
  }
}

export async function POST(request: Request) {
  try {
    // Check admin access
    await withAuth(UserRole.Admin)()
    
    // Use service role client to bypass RLS policies for admin operations
    const supabase = createServiceRoleClient()
    const programData = await request.json()

    const { data, error } = await supabase
      .from("training_programs")
      .insert({
        ...programData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating training program:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API error in POST /api/training/programs:", error)
    if (error.message?.includes("Admin access required")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return NextResponse.json({ error: error.message || "Failed to create training program" }, { status: 500 })
  }
}
