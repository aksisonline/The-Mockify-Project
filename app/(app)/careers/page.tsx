"use client"

import { Suspense, useEffect, useState } from "react"
import type { JobCategory, JobType, ExperienceLevel } from "@/types/job"

import HeroSection from "@/components/careers/HeroSection"
import JobListings from "@/components/careers/JobListings"
import ContentWrapper from "@/components/ContentWrapper"
import JobCachePreloader from "@/components/careers/JobCachePreloader"
import UserCachePreloader from "@/components/careers/UserCachePreloader"
import AppHeader from "@/components/ui/AppHeader"

export default function CareersPage() {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await fetch('/api/jobs/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch filter data')
        }
        
        const data = await response.json()
        setCategories(data.categories || [])
        setJobTypes(data.jobTypes || [])
        setExperienceLevels(data.experienceLevels || [])
      } catch (error) {
        console.error("Error fetching filter data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [])

  if (loading) {
    return (
      <ContentWrapper>
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
          <AppHeader title="Careers" subtitle="Find your next opportunity in life" />
          <div className="max-w-7xl mx-auto">
            <HeroSection />
            <main className="flex-grow">
              <div className="py-16">
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-lg text-muted-foreground">Loading job listings...</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      <JobCachePreloader />
      <UserCachePreloader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Careers" subtitle="Find your next opportunity in life" />
        <div className="max-w-7xl mx-auto">
          <div className="min-h-screen flex flex-col">
            <HeroSection />
            <main className="flex-grow">
              <Suspense
                fallback={
                  <div className="py-16">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-lg text-muted-foreground">Loading job listings...</span>
                    </div>
                  </div>
                }
              >
                <JobListings
                  initialCategories={categories}
                  initialJobTypes={jobTypes}
                  initialExperienceLevels={experienceLevels}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </ContentWrapper>
  )
}
