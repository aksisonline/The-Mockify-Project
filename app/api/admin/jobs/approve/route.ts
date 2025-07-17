import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, checkUserRole, UserRole } from "@/lib/auth-utils"
import { sendJobApprovalStatusEmail } from "@/lib/email-service"

// Helper function to check admin access
async function checkAdminAccess() {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  
  const userRole = await checkUserRole(user.id)
  if (userRole !== UserRole.Admin) {
    throw new Error('Admin access required')
  }
  
  return user
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    const user = await checkAdminAccess()

    const { jobId, action, rejectionReason } = await request.json()

    if (!jobId || !action) {
      return NextResponse.json({ error: 'Job ID and action are required' }, { status: 400 })
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting a job' }, { status: 400 })
    }

    // Get job details for email notification
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get poster profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", job.posted_by)
      .single()

    if (profileError) {
      console.error('Error fetching poster profile:', profileError)
    }

    // Update approval status in the approval queue
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (action === 'reject' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { error: updateError } = await supabase
      .from("job_approval_queue")
      .update(updateData)
      .eq("job_id", jobId)

    if (updateError) {
      console.error('Error updating job approval status:', updateError)
      return NextResponse.json({ error: 'Failed to update job approval status' }, { status: 500 })
    }

    // Create notification for the job poster
    const notificationData = {
      user_id: job.posted_by,
      title: `Job Posting ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: action === 'approve' 
        ? `Your job posting "${job.title}" has been approved and is now live on our platform!`
        : `Your job posting "${job.title}" was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      notification_type: action === 'approve' ? 'job_approved' : 'job_rejected',
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        job_title: job.title,
        rejection_reason: rejectionReason || null,
        job_id: jobId
      },
      is_read: false,
      created_at: new Date().toISOString()
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationData)

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the approval if notification creation fails
    }

    // Send email notification to job poster (non-blocking)
    try {
      await sendJobApprovalStatusEmail(
        profile?.email || "no-email@example.com",
        profile?.full_name || "Unknown User",
        job.title,
        action === 'approve' ? 'approved' : 'rejected',
        rejectionReason || ''
      )
    } catch (emailError) {
      console.error('Failed to send job approval status email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/jobs/approve:', error)
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 