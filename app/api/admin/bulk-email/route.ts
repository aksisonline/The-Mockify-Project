import { NextRequest, NextResponse } from 'next/server'
import { sendBulkCustomEmails } from '@/lib/email-service'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { withAuth, UserRole, getAuthenticatedUser } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createServiceRoleClient()
    
    // Check admin access using withAuth utility
    await withAuth(UserRole.Admin)()
    
    // Get the authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      subject, 
      htmlContent, 
      filters = {},
      recipientType = 'all' // 'all', 'filtered', 'selected'
    } = body

    if (!subject || !htmlContent) {
      return NextResponse.json({ 
        error: 'Subject and content are required' 
      }, { status: 400 })
    }

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        is_admin,
        is_public,
        phone_code,
        phone_number,
        created_at,
        employment(
          company_name,
          designation,
          location
        ),
        profile_completion(
          completion_percentage,
          basic_details,
          employment,
          certifications,
          address,
          social_links
        )
      `)

    // Apply filters
    if (recipientType === 'filtered') {
      if (filters.adminFilter) {
        if (filters.adminFilter === 'admin') {
          query = query.eq('is_admin', true)
        } else if (filters.adminFilter === 'user') {
          query = query.eq('is_admin', false)
        }
      }

      if (filters.searchTerm) {
        query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`)
      }

      if (filters.company) {
        // Note: Company filtering will be applied after fetching public profile data
        // This is a limitation of the current approach - we'll filter in memory
      }

      if (filters.location) {
        // Note: Location filtering will be applied after fetching public profile data
        // This is a limitation of the current approach - we'll filter in memory
      }

      if (filters.profileCompletion) {
        if (filters.profileCompletion === 'completed') {
          query = query.eq('profile_completion.completion_percentage', 100)
        } else if (filters.profileCompletion === 'incomplete') {
          query = query.or('profile_completion.completion_percentage.lt.100,profile_completion.is.null')
        }
      }

      if (filters.dateRange) {
        if (filters.dateRange.from) {
          query = query.gte('created_at', filters.dateRange.from)
        }
        if (filters.dateRange.to) {
          query = query.lte('created_at', filters.dateRange.to)
        }
      }
    } else if (recipientType === 'selected' && filters.selectedUserIds) {
      query = query.in('id', filters.selectedUserIds)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'No users found matching the criteria' 
      }, { status: 400 })
    }

    // Enhance users with public profile data (similar to admin users API)
    let enhancedUsers: any[] = users
    
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

        // Enhance users with public profile data
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
                   (user.phone_code && user.phone_number ? `${user.phone_code}${user.phone_number}` : null)
          }
        })
      } catch (error) {
        console.error('Error fetching public profile data:', error)
        // If public profile fetch fails, still use the original users
        enhancedUsers = users
      }
    }

    // Apply company and location filters after fetching public profile data
    if (recipientType === 'filtered') {
      if (filters.company) {
        enhancedUsers = enhancedUsers.filter((user: any) => 
          user.company?.toLowerCase().includes(filters.company.toLowerCase()) ||
          user.employment?.some((e: any) => e.company_name?.toLowerCase().includes(filters.company.toLowerCase()))
        )
      }

      if (filters.location) {
        enhancedUsers = enhancedUsers.filter((user: any) => 
          user.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
          user.employment?.some((e: any) => e.location?.toLowerCase().includes(filters.location.toLowerCase()))
        )
      }
    }

    if (!enhancedUsers || enhancedUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No users found matching the criteria' 
      }, { status: 400 })
    }

    // Prepare email data for bulk sending
    const emailData = enhancedUsers.map(user => {
      // Process variables for this user
      let processedBody = htmlContent
      
      // Get employment data (take first employment record if multiple exist)
      const employment = user.employment && user.employment.length > 0 ? user.employment[0] : null
      
      const variables = {
        '{{name}}': user.full_name || 'User',
        '{{email}}': user.email,
        '{{company}}': user.company || employment?.company_name || 'N/A',
        '{{jobTitle}}': user.job_title || employment?.designation || 'N/A',
        '{{location}}': user.location || employment?.location || 'N/A',
        '{{joinDate}}': new Date(user.created_at).toLocaleDateString(),
        '{{userId}}': user.id,
        '{{isAdmin}}': user.is_admin ? 'Yes' : 'No',
        '{{profileCompletion}}': user.profile_completion?.completion_percentage?.toString() + '%' || 'N/A'
      }

      Object.entries(variables).forEach(([key, value]) => {
        processedBody = processedBody.replace(new RegExp(key, 'g'), value)
      })

      const processedSubject = subject.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        return (variables as any)[`{{${key}}}`] || match
      })

      return {
        to: user.email,
        variables: {
          name: user.full_name || 'User',
          email: user.email,
          company: user.company || employment?.company_name || '',
          jobTitle: user.job_title || employment?.designation || '',
          location: user.location || employment?.location || '',
          joinDate: new Date(user.created_at).toLocaleDateString(),
          userId: user.id,
          isAdmin: user.is_admin ? 'Yes' : 'No',
          profileCompletion: user.profile_completion?.completion_percentage?.toString() + '%' || 'N/A'
        },
        htmlContent: processedBody
      }
    })

    // Send bulk emails
    const result = await sendBulkCustomEmails(
      emailData.map(data => ({
        to: data.to,
        variables: data.variables,
        htmlContent: data.htmlContent
      })),
      subject
    )

    return NextResponse.json({
      success: true,
      message: `Email sent to ${enhancedUsers.length} users`,
      recipientCount: enhancedUsers.length,
      emailResult: result
    })

  } catch (error) {
    console.error('Bulk email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send bulk email' 
    }, { status: 500 })
  }
} 