"use client"

import { useEffect } from "react"
import { getJobsFromDB } from "@/lib/job-service-client"

const JOB_CACHE_KEY = "jobCache"
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function jobsAreEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false
  // Compare by id and updated_at
  const aMap = Object.fromEntries(a.map(j => [j.id, j.updated_at]))
  const bMap = Object.fromEntries(b.map(j => [j.id, j.updated_at]))
  return Object.keys(aMap).every(id => aMap[id] === bMap[id]) && Object.keys(bMap).every(id => aMap[id] === bMap[id])
}

export default function JobCachePreloader() {
  useEffect(() => {
    async function fetchAndCacheJobs() {
      // Use cache for fast UI
      let cacheRaw = localStorage.getItem(JOB_CACHE_KEY)
      let cache = cacheRaw ? JSON.parse(cacheRaw) : null
      // Always start a background fetch
      const { jobs: freshJobs } = await getJobsFromDB()
      if (!cache || !Array.isArray(cache.jobs) || !jobsAreEqual(cache.jobs, freshJobs)) {
        localStorage.setItem(
          JOB_CACHE_KEY,
          JSON.stringify({ jobs: freshJobs, timestamp: Date.now() })
        )
        // Notify app of cache update
        window.dispatchEvent(new Event("jobsCacheUpdated"))
      }
    }
    fetchAndCacheJobs()
  }, [])
  return null
} 