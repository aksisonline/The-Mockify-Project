import { NextResponse } from "next/server"
import { getJobs } from "@/lib/job-service-client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const searchTerm = searchParams.get("search")
  const location = searchParams.get("location")
  const jobType = searchParams.get("jobType")
  const experienceLevel = searchParams.get("experienceLevel")
  const minSalary = searchParams.get("minSalary")
  const maxSalary = searchParams.get("maxSalary")
  const sortBy = searchParams.get("sortBy") || "relevance"
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  // Get jobs with filters
  const filteredJobs = getJobs({
    searchTerm: searchTerm || undefined,
    location: location || undefined,
    jobTypes: jobType ? jobType.split(",") : undefined,
    experienceLevels: experienceLevel ? experienceLevel.split(",") : undefined,
    salaryRange: minSalary || maxSalary ? [Number(minSalary) || 0, Number(maxSalary) || 50] : undefined,
  })

  // Sort jobs
  const sortedJobs = [...filteredJobs]
  if (sortBy === "recent") {
    sortedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy === "salary-high") {
    sortedJobs.sort((a, b) => (b.maxSalary ?? 0) - (a.maxSalary ?? 0))
  } else if (sortBy === "salary-low") {
    sortedJobs.sort((a, b) => (a.minSalary ?? 0) - (b.minSalary ?? 0))
  }

  // Paginate results
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedJobs = sortedJobs.slice(startIndex, endIndex)

  // Return response with pagination metadata
  return NextResponse.json({
    jobs: paginatedJobs,
    pagination: {
      total: filteredJobs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredJobs.length / limit),
    },
  })
}
