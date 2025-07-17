import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("=== Debug Endpoint Called ===")

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
    }

    console.log("Environment variables:", envCheck)

    const supabase = createServerClient()

    // Test 1: Basic connection
    console.log("Test 1: Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("events")
      .select("count", { count: "exact", head: true })

    // Test 2: Check if events table exists and has data
    console.log("Test 2: Checking events table...")
    const { data: eventsData, error: eventsError } = await supabase.from("events").select("*").limit(1)

    // Test 3: Get table schema info
    console.log("Test 3: Getting table info...")
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("get_table_info", { table_name: "events" })
      .single()

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tests: {
        connection: {
          success: !connectionError,
          error: connectionError?.message,
          count: connectionTest,
        },
        eventsTable: {
          success: !eventsError,
          error: eventsError?.message,
          hasData: eventsData && eventsData.length > 0,
          sampleEvent: eventsData?.[0],
        },
        tableInfo: {
          success: !tableError,
          error: tableError?.message,
          info: tableInfo,
        },
      },
    }

    console.log("Debug info:", JSON.stringify(debugInfo, null, 2))

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
