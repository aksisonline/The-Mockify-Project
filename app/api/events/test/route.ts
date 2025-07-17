import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("=== Events Test API Called ===")

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const envCheck = {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      supabaseServiceKey: !!supabaseServiceKey,
      supabaseUrlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "missing",
    }

    console.log("Environment variables:", envCheck)

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing required environment variables",
        env: envCheck,
      })
    }

    // Test Supabase connection
    const supabase = await createServerClient()

    console.log("Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("events")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("Connection test failed:", connectionError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
        code: connectionError.code,
        env: envCheck,
      })
    }

    console.log("Testing data retrieval...")
    const { data: sampleData, error: sampleError } = await supabase.from("events").select("*").limit(3)

    if (sampleError) {
      console.error("Sample data retrieval failed:", sampleError)
      return NextResponse.json({
        success: false,
        error: "Data retrieval failed",
        details: sampleError.message,
        code: sampleError.code,
        env: envCheck,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      eventCount: connectionTest,
      sampleEvents: sampleData?.length || 0,
      sampleData: sampleData?.slice(0, 1), // Just show first event
      env: envCheck,
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
