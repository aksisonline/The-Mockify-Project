import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { jobCategories, jobTypes, experienceLevels } from "@/data/jobs-data"

// GET - Fetch categories with accurate counts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // console.log("API: Fetching categories with counts from database...")

    // Get count of all active and approved jobs
    const { count: totalCount, error: totalError } = await supabase
      .from("jobs")
      .select(`
        *,
        job_approval_queue!inner(status)
      `, { count: "exact", head: true })
      .eq("is_active", true)
      .eq("job_approval_queue.status", "approved")

    if (totalError) {
      console.error("API: Error fetching total count:", totalError)
    } else {
      // console.log("API: Total active jobs count:", totalCount)
    }

    // Get counts for each category (only approved jobs)
    const { data: categoryCounts, error } = await supabase
      .from("jobs")
      .select(`
        category,
        job_approval_queue!inner(status)
      `)
      .eq("is_active", true)
      .eq("job_approval_queue.status", "approved")
      .not("category", "is", null)

    if (error) {
      console.error("API: Error fetching category counts:", error)
      return NextResponse.json(jobCategories) // fallback to static data
    }

    // console.log("API: Raw category data from database:", categoryCounts)

    // Create a map of category counts
    const countsMap = new Map<string, number>()
    categoryCounts?.forEach((item: any) => {
      const currentCount = countsMap.get(item.category) || 0
      countsMap.set(item.category, currentCount + 1)
    })

    // console.log("API: Category counts map:", Object.fromEntries(countsMap))

    // Update the static categories with accurate counts
    const updatedCategories = jobCategories.map(category => {
      if (category.id === "all") {
        return { ...category, count: totalCount || 0 }
      }
      return { ...category, count: countsMap.get(category.id) || 0 }
    })

    // console.log("API: Updated categories with real counts:", updatedCategories)

    // Get job type counts (only approved jobs)
    const { data: jobTypeCounts, error: jobTypeError } = await supabase
      .from("jobs")
      .select(`
        job_type,
        job_approval_queue!inner(status)
      `)
      .eq("is_active", true)
      .eq("job_approval_queue.status", "approved")
      .not("job_type", "is", null)

    const jobTypeCountsMap = new Map<string, number>()
    jobTypeCounts?.forEach((item: any) => {
      const currentCount = jobTypeCountsMap.get(item.job_type) || 0
      jobTypeCountsMap.set(item.job_type, currentCount + 1)
    })

    const updatedJobTypes = jobTypes.map(jobType => ({
      ...jobType,
      count: jobTypeCountsMap.get(jobType.id) || 0
    }))

    // Get experience level counts (only approved jobs)
    const { data: experienceLevelCounts, error: expError } = await supabase
      .from("jobs")
      .select(`
        experience_level,
        job_approval_queue!inner(status)
      `)
      .eq("is_active", true)
      .eq("job_approval_queue.status", "approved")
      .not("experience_level", "is", null)

    const expCountsMap = new Map<string, number>()
    experienceLevelCounts?.forEach((item: any) => {
      const currentCount = expCountsMap.get(item.experience_level) || 0
      expCountsMap.set(item.experience_level, currentCount + 1)
    })

    const updatedExperienceLevels = experienceLevels.map(level => ({
      ...level,
      count: expCountsMap.get(level.id) || 0
    }))

    return NextResponse.json({
      categories: updatedCategories,
      jobTypes: updatedJobTypes,
      experienceLevels: updatedExperienceLevels,
      totalJobs: totalCount || 0,
      categoryCounts: Object.fromEntries(countsMap)
    })
  } catch (error) {
    console.error("Error in getCategoriesWithCounts:", error)
    return NextResponse.json(jobCategories) // fallback to static data
  }
} 