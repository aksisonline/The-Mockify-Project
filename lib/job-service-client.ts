import { jobCategories, jobTypes, experienceLevels, popularSearches, commonSkills } from "@/data/jobs-data"
import type { Job as SupabaseJob, JobApplication } from "@/types/supabase"
import type { JobCategory, JobType, ExperienceLevel } from "@/types/job"

type Job = SupabaseJob & {
  isFeatured?: boolean
  minSalary?: number
  maxSalary?: number
  tags?: string[]
}

// Helper to parse salary_range JSON
function parseSalaryRange(salary_range?: string): { minSalary: number, maxSalary: number } {
  if (!salary_range) return { minSalary: 0, maxSalary: 0 }
  try {
    const obj = JSON.parse(salary_range)
    return {
      minSalary: typeof obj.minSalary === 'number' ? obj.minSalary : 0,
      maxSalary: typeof obj.maxSalary === 'number' ? obj.maxSalary : 0,
    }
  } catch {
    return { minSalary: 0, maxSalary: 0 }
  }
}

// Get jobs from API
export async function getJobsFromDB(filters?: {
  category?: string
  jobTypes?: string[]
  experienceLevels?: string[]
  salaryRange?: [number, number]
  searchTerm?: string
  location?: string
  limit?: number
  offset?: number
}): Promise<{ jobs: Job[]; count: number }> {
  try {
    const params = new URLSearchParams()
    
    if (filters?.category) params.set('category', filters.category)
    if (filters?.jobTypes?.length) params.set('jobTypes', filters.jobTypes.join(','))
    if (filters?.experienceLevels?.length) params.set('experienceLevels', filters.experienceLevels.join(','))
    if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm)
    if (filters?.location) params.set('location', filters.location)
    if (filters?.limit) params.set('limit', filters.limit.toString())
    if (filters?.offset) params.set('offset', filters.offset.toString())

    const response = await fetch(`/api/jobs/search?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }

    const data = await response.json()
    
    // Parse salary ranges for each job
    const jobsWithSalary = data.jobs.map((job: Job) => {
      const { minSalary, maxSalary } = parseSalaryRange(job.salary_range)
      return { ...job, minSalary, maxSalary }
    })

    return {
      jobs: jobsWithSalary,
      count: data.count
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return { jobs: [], count: 0 }
  }
}

// Get categories with counts from API
export async function getCategoriesWithCounts(): Promise<JobCategory[]> {
  try {
    const response = await fetch('/api/jobs/categories')
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return jobCategories // fallback to static data
  }
}

// Get locations from API
export async function getLocations(query: string): Promise<string[]> {
  try {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    
    const response = await fetch(`/api/jobs/locations?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
}

// Add job application via API
export async function addJobApplication(application: {
  job_id: string
  applicant_id: string
  status?: string
}): Promise<JobApplication | null> {
  try {
    const response = await fetch('/api/jobs/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    })

    if (!response.ok) {
      throw new Error('Failed to create job application')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating job application:', error)
    return null
  }
}

// Get job application for user via API
export async function getJobApplicationForUser(jobId: string, userId: string): Promise<JobApplication | null> {
  try {
    const applications = await fetchUserApplicationsFromDB(userId)
    return applications.find((app: any) => app.job_id === jobId) || null
  } catch (error) {
    console.error('Error fetching job application for user:', error)
    return null
  }
}

// Fetch user applications from API
export async function fetchUserApplicationsFromDB(userId: string, access_token?: string | undefined): Promise<JobApplication[]> {
  try {
    const response = await fetch(`/api/jobs/applications/user?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user applications')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user applications:', error)
    return []
  }
}

// Static data functions (no API calls needed)
export function getCategories(): JobCategory[] {
  return jobCategories
}

export function getJobTypes(): JobType[] {
  return jobTypes
}

export function getExperienceLevels(): ExperienceLevel[] {
  return experienceLevels
}

export function getPopularSearches(): string[] {
  return popularSearches
}

export function getCommonSkills(): string[] {
  return commonSkills
}

// Get job by ID
export async function getJobById(id: string): Promise<Job | null> {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/jobs/${id}`)
    
    if (!response.ok) {
      console.error(`Error fetching job ${id}:`, response.status, response.statusText)
      return null
    }
    const job = await response.json()
    
    // Parse salary range if it exists
    if (job.salary_range) {
      const { minSalary, maxSalary } = parseSalaryRange(job.salary_range)
      return { ...job, minSalary, maxSalary }
    }
    
    return job
  } catch (error) {
    console.error('Error fetching job by ID:', error)
    return null
  }
}

// Get all job IDs (for static generation)
export async function getAllJobIds(): Promise<string[]> {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/jobs/search?limit=1000`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch job IDs')
    }

    const data = await response.json()
    return data.jobs.map((job: any) => job.id)
  } catch (error) {
    console.error('Error fetching job IDs:', error)
    return []
  }
}

// Get jobs with filtering (for static data)
export function getJobs(filters?: {
  category?: string
  jobTypes?: string[]
  experienceLevels?: string[]
  salaryRange?: [number, number]
  searchTerm?: string
  location?: string
}): any[] {
  // This is a static function that returns empty array
  // For dynamic filtering, use getJobsFromDB instead
  return []
} 