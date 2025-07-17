import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface Job {
  id: string
  title: string
  description: string
  company: string
  location?: string
  salary_range?: string
  job_type: string
  experience_level: string
  category?: string
  requirements?: string[]
  benefits?: string[]
  application_deadline?: string
  company_logo?: string
  posted_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  cover_letter?: string
  status: string
  applied_at: string
  updated_at: string
}

export function useJobs() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all jobs with optional filters
  const fetchJobs = useCallback(async (filters?: {
    category?: string
    jobType?: string
    experienceLevel?: string
    searchTerm?: string
    location?: string
    limit?: number
    offset?: number
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.jobType) params.append('jobType', filters.jobType)
      if (filters?.experienceLevel) params.append('experienceLevel', filters.experienceLevel)
      if (filters?.searchTerm) params.append('search', filters.searchTerm)
      if (filters?.location) params.append('location', filters.location)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch jobs')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user's own jobs
  const fetchMyJobs = useCallback(async (includeInactive = false) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/my-jobs?includeInactive=${includeInactive}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch your jobs')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Post a new job
  const postJob = useCallback(async (jobData: Omit<Job, 'id' | 'posted_by' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post job')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Update a job
  const updateJob = useCallback(async (jobId: string, jobData: Partial<Job>) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update job')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Delete a job (soft delete)
  const deleteJob = useCallback(async (jobId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete job')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Apply for a job
  const applyForJob = useCallback(async (jobId: string, coverLetter?: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: coverLetter,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to apply for job')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Fetch user's job applications
  const fetchMyApplications = useCallback(async () => {
    if (!user?.id) throw new Error('User not authenticated')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/apply')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    loading,
    error,
    fetchJobs,
    fetchMyJobs,
    postJob,
    updateJob,
    deleteJob,
    applyForJob,
    fetchMyApplications,
  }
} 