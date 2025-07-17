"use client"

import { useState, useEffect } from "react"
import type { TrainingProgram, TrainingEnrollment, EnrollmentFormData } from "@/lib/training-service"

export function useTrainingPrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/training/programs")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        }

        const data = await response.json()
        setPrograms(data)
      } catch (err: any) {
        console.error("Error in useTrainingPrograms:", err)
        setError(err.message || "Failed to fetch programs")
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const refetchPrograms = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/training/programs")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      setPrograms(data)
    } catch (err: any) {
      console.error("Error in refetchPrograms:", err)
      setError(err.message || "Failed to fetch programs")
    } finally {
      setLoading(false)
    }
  }

  return { programs, loading, error, refetch: refetchPrograms }
}

export function useTrainingEnrollment() {
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enrollInProgram = async (enrollmentData: EnrollmentFormData) => {
    try {
      setEnrolling(true)
      setError(null)

      const response = await fetch("/api/training/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enrollmentData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const enrollment = await response.json()
      return enrollment
    } catch (err: any) {
      console.error("Error in enrollInProgram:", err)
      setError(err.message || "Failed to enroll")
      throw err
    } finally {
      setEnrolling(false)
    }
  }

  return { enrollInProgram, enrolling, error }
}

export function useUserEnrollments() {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/training/enrollments")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        }

        const data = await response.json()
        // Handle both array and object response formats
        const enrollmentsData = Array.isArray(data) ? data : (data.enrollments || [])
        setEnrollments(enrollmentsData)
      } catch (err: any) {
        console.error("Error in useUserEnrollments:", err)
        setError(err.message || "Failed to fetch enrollments")
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  const refetchEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/training/enrollments")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      // Handle both array and object response formats
      const enrollmentsData = Array.isArray(data) ? data : (data.enrollments || [])
      setEnrollments(enrollmentsData)
    } catch (err: any) {
      console.error("Error in refetchEnrollments:", err)
      setError(err.message || "Failed to fetch enrollments")
    } finally {
      setLoading(false)
    }
  }

  return { enrollments, loading, error, refetch: refetchEnrollments }
}
