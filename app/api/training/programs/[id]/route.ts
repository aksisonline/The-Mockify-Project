import { NextResponse } from "next/server"
import { getTrainingProgram } from "@/lib/training-service"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const program = await getTrainingProgram(id)
    return NextResponse.json(program)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin access
    await withAuth(UserRole.Admin)()
    
    const { id } = await params
    // Use service role client to bypass RLS policies for admin operations
    const supabase = createServiceRoleClient()
    const programData = await request.json()

    const { data, error } = await supabase
      .from("training_programs")
      .update({
        ...programData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating training program:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API error in PUT /api/training/programs/[id]:", error)
    if (error.message?.includes("Admin access required")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return NextResponse.json({ error: error.message || "Failed to update training program" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin access
    await withAuth(UserRole.Admin)()
    
    const { id } = await params
    // Use service role client to bypass RLS policies for admin operations
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("training_programs")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting training program:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API error in DELETE /api/training/programs/[id]:", error)
    if (error.message?.includes("Admin access required")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return NextResponse.json({ error: error.message || "Failed to delete training program" }, { status: 500 })
  }
}
