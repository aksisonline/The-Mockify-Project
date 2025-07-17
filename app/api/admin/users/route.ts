import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"

// Utility function to get avatar URL with proper fallback logic
function getAvatarUrl(user: any, publicProfileData?: any): string | null {
  // 1. First priority: public_profiles avatar_url (from public profiles view)
  if (publicProfileData?.avatar_url) {
    return publicProfileData.avatar_url
  }
  
  // 2. Second priority: Uploaded avatar from profiles table
  if (user.avatar_url) {
    return user.avatar_url
  }
  
  // 3. Last resort: Return null to trigger letters fallback
  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await withAuth(UserRole.Admin)()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Build query to get all users with complete data
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        phone_code,
        phone_number,
        dob,
        gender,
        is_admin,
        is_public,
        avc_id,
        has_business_card,
        last_login,
        created_at,
        updated_at,
        profile_completion(
          completion_percentage,
          basic_details,
          employment,
          certifications,
          address,
          social_links
        )
      `)

    // Apply search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,avc_id.ilike.%${search}%`)
    }

    // Apply ordering
    const { data: users, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // If we have users, fetch public profile data for public users only
    let enhancedUsers = users || []
    
    if (users && users.length > 0) {
      // Only fetch public profile data for users who are public
      const publicUserIds = users.filter(user => user.is_public).map(user => user.id)
      
      try {
        let publicProfilesMap: Record<string, any> = {}
        
        if (publicUserIds.length > 0) {
          // Fetch public profile data directly from the public_profiles view
          const { data: publicProfiles, error: publicError } = await supabase
            .from("public_profiles")
            .select("*")
            .in("id", publicUserIds)

          if (publicError) {
            console.error('Error fetching public profiles:', publicError)
          } else if (publicProfiles) {
            // Create a map of public profile data
            publicProfilesMap = publicProfiles.reduce((acc, profile) => {
              acc[profile.id] = profile
              return acc
            }, {} as Record<string, any>)
          }
        }

        // Enhance users with public profile data and proper avatar fallback
        enhancedUsers = users.map(user => {
          const publicProfile = publicProfilesMap[user.id]
          
          return {
            ...user,
            // Add public profile data if available (only for public users)
            company: publicProfile?.company_name || null,
            job_title: publicProfile?.designation || null,
            location: publicProfile?.city || null,
            country: publicProfile?.country || null,
            total_points: publicProfile?.total_points || 0,
            certifications: publicProfile?.certifications || [],
            social_links: publicProfile?.social_links || {},
            // Use phone from public_profiles if available, otherwise construct from profiles
            phone: publicProfile?.phone || 
                   (user.phone_code && user.phone_number ? `${user.phone_code}${user.phone_number}` : null),
            // Use proper avatar fallback logic - public profiles first priority
            avatar_url: getAvatarUrl(user, publicProfile)
          }
        })
      } catch (error) {
        console.error('Error fetching public profile data:', error)
        // If public profile fetch fails, still return users with basic avatar logic
        enhancedUsers = users.map(user => ({
          ...user,
          avatar_url: getAvatarUrl(user, null)
        }))
      }
    }

    return NextResponse.json({
      users: enhancedUsers,
      count: enhancedUsers.length
    })

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 