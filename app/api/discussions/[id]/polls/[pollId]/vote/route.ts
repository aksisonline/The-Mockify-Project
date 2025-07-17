import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { votePoll } from "@/lib/discussions-service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before using its properties
    const { pollId } = await params
    const { optionIds } = await request.json()

    // Validate input
    if (!Array.isArray(optionIds)) {
      return NextResponse.json({ error: "optionIds must be an array" }, { status: 400 })
    }

    // Validate that all optionIds belong to this poll
    if (optionIds.length > 0) {
      const { data: options, error: optionsError } = await supabase
        .from("discussion_poll_options")
        .select("id")
        .eq("poll_id", pollId)
        .in("id", optionIds)

      if (optionsError) {
        console.error("Error validating poll options:", optionsError)
        return NextResponse.json({ error: "Failed to validate poll options" }, { status: 500 })
      }

      if (options.length !== optionIds.length) {
        return NextResponse.json({ error: "Invalid option IDs" }, { status: 400 })
      }
    }

    await votePoll(pollId, optionIds, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error voting on poll:", error)
    if (error.message === "Poll has expired") {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 })
    }
    if (error.message === "This poll only allows one selection") {
      return NextResponse.json({ error: "This poll only allows one selection" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to vote on poll" }, { status: 500 })
  }
}
