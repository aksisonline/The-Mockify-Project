import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { user_id, platform, url, updated_at } = await request.json()

    // Validate required fields
    if (!user_id || !platform || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Upsert the social link
    const { data, error } = await supabase
      .from("social_links")
      .upsert(
        {
          user_id,
          platform,
          url,
          updated_at
        },
        {
          onConflict: "user_id,platform"
        }
      )
      .select()
      .single()

    if (error) {
      console.error("Error saving social link:", error)
      return NextResponse.json(
        { error: "Failed to save social link" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in social links API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching social links:", error)
      return NextResponse.json(
        { error: "Failed to fetch social links" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in social links API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const platform = searchParams.get("platform")

    if (!userId || !platform) {
      return NextResponse.json(
        { error: "User ID and platform are required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("user_id", userId)
      .eq("platform", platform)

    if (error) {
      console.error("Error deleting social link:", error)
      return NextResponse.json(
        { error: "Failed to delete social link" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in social links API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 