import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"
import { awardCategoryPoints } from "@/lib/points-category-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check admin access
    await withAuth(UserRole.Admin)()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const reason = formData.get('reason') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    }

    // Read and parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataRows = lines.slice(1)

    // Validate headers
    const requiredHeaders = ['email', 'points']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    const emailIndex = headers.indexOf('email')
    const pointsIndex = headers.indexOf('points')

    const results = {
      processed: 0,
      errors: [] as Array<{ row: number, email: string, error: string }>
    }

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row.trim()) continue

      const columns = row.split(',').map(col => col.trim().replace(/"/g, ''))
      const email = columns[emailIndex]
      const pointsStr = columns[pointsIndex]

      try {
        // Validate email
        if (!email || !email.includes('@')) {
          results.errors.push({
            row: i + 2, // +2 because we start from 0 and skip header
            email: email || 'empty',
            error: 'Invalid email format'
          })
          continue
        }

        // Validate points
        const points = parseInt(pointsStr)
        if (isNaN(points) || points <= 0) {
          results.errors.push({
            row: i + 2,
            email,
            error: 'Points must be a positive number'
          })
          continue
        }

        // Find user by email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single()

        if (profileError || !profile) {
          results.errors.push({
            row: i + 2,
            email,
            error: 'User not found'
          })
          continue
        }

        // Award points
        await awardCategoryPoints(
          profile.id,
          category,
          points,
          reason,
          { source: 'bulk_upload', row: i + 2 }
        )

        results.processed++

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error)
        results.errors.push({
          row: i + 2,
          email: email || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.processed,
      errors: results.errors,
      totalRows: dataRows.length
    })

  } catch (error) {
    console.error('Error in bulk upload:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 