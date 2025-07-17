import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    // First, get the review request with user information
    const { data: existingRequest, error: fetchError } = await supabase
      .from('review_requests')
      .select(`
        *,
        profiles!review_requests_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingRequest) {
      console.error('Error fetching review request:', fetchError)
      return NextResponse.json({ error: "Review request not found" }, { status: 404 })
    }

    // Update the review request status
    const { data: reviewRequest, error } = await supabase
      .from('review_requests')
      .update({ status: data.status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating request status:', error)
      return NextResponse.json({ error: "Failed to update request status" }, { status: 500 })
    }

    // Award points if approved (this automatically sends a notification)
    if (data.status === 'approved') {
      try {
        await supabase.rpc('award_points_with_category', {
          p_user_id: existingRequest.user_id,
          p_amount: 20,
          p_category_name: 'reviews',
          p_reason: 'Review request approved',
          p_metadata: { 
            review_request_id: id,
            action: 'request_approved'
          }
        })
      } catch (pointsError) {
        console.error('Error awarding points for approved review request:', pointsError)
        // Don't fail the status update if points awarding fails
      }
    }

    return NextResponse.json({ request: reviewRequest })
  } catch (error) {
    console.error("Error updating request status:", error)
    return NextResponse.json({ error: "Failed to update request status" }, { status: 500 })
  }
} 