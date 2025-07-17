import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { initializeUser } from '@/lib/user-initialization'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, metadata } = await request.json()
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await initializeUser(userId, email, metadata)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error initializing user:', error)
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    )
  }
} 