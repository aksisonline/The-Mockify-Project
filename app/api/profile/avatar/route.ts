import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createServerClient()

    // Get session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { avatar_url } = await request.json()
    if (!avatar_url) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 })
    }

    // Update the avatar_url in the profiles table
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating avatar:", error)
      return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatar_url })
  } catch (error) {
    console.error("Error in avatar update:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 