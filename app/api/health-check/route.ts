import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    const health = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      authentication: !sessionError,
      database: {} as any,
      api: {} as any
    }

    // Test database tables
    const tables = [
      'profiles',
      'discussions',
      'discussion_polls', 
      'discussion_votes',
      'discussion_bookmarks',
      'product_categories',
      'cart',
      'cart_items',
      'training_enrollments',
      'training_programs',
      'rewards',
      'reward_purchases',
      'points',
      'points_categories',
      'transactions',
      'tool_purchases',
      'tools',
      'notifications'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        health.database[table] = {
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0
        }
      } catch (err: any) {
        health.database[table] = {
          exists: false,
          error: err.message,
          count: 0
        }
      }
    }

    // Test database views
    const views = [
      'user_points_by_category',
      'reward_purchase_details'
    ]

    for (const view of views) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('*')
          .limit(1)
        
        health.database[view] = {
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0
        }
      } catch (err: any) {
        health.database[view] = {
          exists: false,
          error: err.message,
          count: 0
        }
      }
    }

    // Test API endpoints
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiEndpoints = [
      '/api/products/categories',
      '/api/cart',
      '/api/training/enrollments',
      '/api/transactions/tool-purchases',
      '/api/notifications'
    ]

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        health.api[endpoint] = {
          status: response.status,
          ok: response.ok,
          error: response.ok ? null : `${response.status} ${response.statusText}`
        }
      } catch (err: any) {
        health.api[endpoint] = {
          status: 0,
          ok: false,
          error: err.message
        }
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Error in health check:', error)
    return NextResponse.json({ 
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 