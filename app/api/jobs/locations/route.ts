import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''

    const supabase = await createServerClient()

    let locationsQuery = supabase
      .from('jobs')
      .select(`
        location,
        job_approval_queue!inner(status)
      `)
      .eq('is_active', true)
      .eq('job_approval_queue.status', 'approved')
      .not('location', 'is', null)

    if (query) {
      locationsQuery = locationsQuery.ilike('location', `%${query}%`)
    }

    const { data: locations, error } = await locationsQuery

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json([])
    }

    // Extract unique locations and filter by query
    const uniqueLocations = [...new Set(locations?.map(item => item.location).filter(Boolean))]
    
    // Filter by query if provided
    const filteredLocations = query 
      ? uniqueLocations.filter(location => 
          location.toLowerCase().includes(query.toLowerCase())
        )
      : uniqueLocations

    return NextResponse.json(filteredLocations.slice(0, 10)) // Limit to 10 results
  } catch (error) {
    console.error('Error in locations API:', error)
    return NextResponse.json([])
  }
} 