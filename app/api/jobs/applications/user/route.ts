import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          location,
          job_type,
          experience_level,
          salary_range
        )
      `)
      .eq('applicant_id', userId)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching user applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error('Error in user applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 