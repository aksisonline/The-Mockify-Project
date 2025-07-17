import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, checkUserRole, UserRole } from "@/lib/auth-utils"

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // First delete from approval queue
    const { error: queueError } = await supabase
      .from("job_approval_queue")
      .delete()
      .eq("job_id", jobId)

    if (queueError) {
      console.error('Error deleting from approval queue:', queueError)
      // Continue with job deletion even if approval queue deletion fails
    }

    // Then delete the job
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)

    if (error) {
      console.error('Error deleting job:', error)
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/jobs/[id]:', error)
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 