import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // console.log('Admin jobs test API called')
    
    return NextResponse.json({ 
      message: 'Admin jobs test endpoint working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in GET /api/admin/jobs/test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 