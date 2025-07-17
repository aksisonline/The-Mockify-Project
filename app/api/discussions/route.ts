import { type NextRequest, NextResponse } from "next/server"
import { getDiscussions, createDiscussion, createPoll } from "@/lib/discussions-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category_id = searchParams.get("category_id") || undefined
    const tag = searchParams.get("tag") || undefined
    const search = searchParams.get("search") || undefined
    const sort_by = (searchParams.get("sort_by") as "newest" | "popular" | "activity") || "newest"
    const author_id = searchParams.get("author_id") || undefined

    const discussions = await getDiscussions({
      limit,
      offset,
      category_id,
      tag,
      search,
      sort_by,
      author_id,
    })

    // Return in the format expected by admin client
    return NextResponse.json({ discussions })
  } catch (error) {
    console.error("Error fetching discussions:", error)
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const data = await request.json()

    // Debug: Log the incoming data
    console.log('📥 Received request data:', JSON.stringify(data, null, 2))
    console.log('📊 Poll data check:', {
      hasPoll: !!data.poll,
      pollQuestion: data.poll?.question,
      pollOptions: data.poll?.options,
      pollOptionsLength: data.poll?.options?.length
    })

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    // Content is optional for polls (poll question can serve as content)
    if (!data.content && !data.poll) {
      return NextResponse.json({ error: "Content or poll data is required" }, { status: 400 })
    }

    const discussion = await createDiscussion({
      ...data,
      author_id: userId,
    })

    // Award points for creating a new discussion
    try {
      await supabase.rpc('award_points_with_category', {
        p_user_id: userId,
        p_amount: 20,
        p_category_name: 'community',
        p_reason: 'Creating a new discussion',
        p_metadata: { discussion_id: discussion.id }
      })
    } catch (pointsError) {
      console.error('Error awarding points for discussion:', pointsError)
      // Don't fail the discussion creation if points awarding fails
    }

    // Poll creation logic
    let poll = null
    console.log('🔍 Checking poll creation conditions:', {
      hasPoll: !!data.poll,
      hasQuestion: !!(data.poll && data.poll.question),
      hasOptions: !!(data.poll && Array.isArray(data.poll.options)),
      optionsLength: data.poll?.options?.length || 0,
      meetsMinOptions: !!(data.poll && Array.isArray(data.poll.options) && data.poll.options.length >= 2)
    })
    
    if (data.poll && data.poll.question && Array.isArray(data.poll.options) && data.poll.options.length >= 2) {
      console.log('✅ Poll conditions met! Creating poll with data:', {
        question: data.poll.question,
        is_multiple_choice: !!data.poll.allowMultipleSelections,
        is_anonymous: !!data.poll.isAnonymous,
        options: data.poll.options
      })
      
      try {
        poll = await createPoll(
          {
            discussion_id: discussion.id,
            question: data.poll.question,
            is_multiple_choice: !!data.poll.allowMultipleSelections,
            is_anonymous: !!data.poll.isAnonymous,
            expires_at: data.poll.expiresAt || null,
          },
          data.poll.options.map((opt: any, idx: number) => ({
            option_text: opt.text,
            display_order: idx,
          }))
        )
        console.log('🎉 Poll created successfully:', poll)
      } catch (pollError) {
        console.error('❌ Error creating poll:', pollError)
        console.error('❌ Poll error details:', {
          message: (pollError as any)?.message || 'Unknown error',
          code: (pollError as any)?.code || 'Unknown code',
          details: (pollError as any)?.details || 'No details'
        })
        // Don't fail the discussion creation if poll creation fails
        // Just log the error and continue
      }
    } else {
      console.log('❌ Poll conditions not met - poll will not be created')
    }

    return NextResponse.json({ discussion, poll }, { status: 201 })
  } catch (error) {
    console.error("Error creating discussion:", error)
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 })
  }
}
