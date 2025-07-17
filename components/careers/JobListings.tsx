"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { JobCategory, JobType, ExperienceLevel } from "@/types/job"
import { Filter, Clock, DollarSign, Star, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CategoryFilter from "./filters/CategoryFilter"
import JobTypeFilter from "./filters/JobTypeFilter"
import ExperienceLevelFilter from "./filters/ExperienceLevelFilter"
import SalaryRangeFilter from "./filters/SalaryRangeFilter"
import JobCard from "./JobCard"
import { getJobsFromDB } from "@/lib/job-service-client"
import { FilterProvider, useFilters } from "@/contexts/filter-context"
import { useAuth } from "@/contexts/auth-context"
import FiltersSidebar from "./FiltersSidebar"

interface JobListingsProps {
  initialCategories: JobCategory[]
  initialJobTypes: JobType[]
  initialExperienceLevels: ExperienceLevel[]
}

const JOB_CACHE_KEY = "jobCache"
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const JOBS_PER_PAGE = 10

// Main component that provides the filter context
export default function JobListings({ initialCategories, initialJobTypes, initialExperienceLevels }: JobListingsProps) {
  return (
    <FilterProvider>
      <JobListingsContent
        initialCategories={initialCategories}
        initialJobTypes={initialJobTypes}
        initialExperienceLevels={initialExperienceLevels}
      />
    </FilterProvider>
  )
}

// Inner component that uses the filter context
function JobListingsContent({ initialCategories, initialJobTypes, initialExperienceLevels }: JobListingsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { filters, updateFilter, clearFilters, activeFiltersCount } = useFilters()
  const { isLoading: authLoading } = useAuth()

  const [allJobs, setAllJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories] = useState<JobCategory[]>(initialCategories)
  const [jobTypes] = useState<JobType[]>(initialJobTypes)
  const [experienceLevels] = useState<ExperienceLevel[]>(initialExperienceLevels)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryCounts, setCategoryCounts] = useState<{ [category: string]: number }>({})

  // Show loading if categories are not loaded yet
  if (categories.length === 0) {
    return (
      <div className="container px-0 py-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    )
  }

  // Fetch all jobs once on mount and cache them
  useEffect(() => {
    if (!authLoading) {
      setLoading(true)
      let jobs: any[] = []
      
      // Try cache first
      if (typeof window !== "undefined") {
        const cacheRaw = localStorage.getItem(JOB_CACHE_KEY)
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw)
          if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL && Array.isArray(cache.jobs)) {
            jobs = cache.jobs
          }
        }
      }
      
      // If no cache, fetch from DB and update cache
      if (!jobs.length) {
        getJobsFromDB({})
          .then(({ jobs: fetchedJobs }) => {
            jobs = fetchedJobs
            if (typeof window !== "undefined") {
              localStorage.setItem(
                JOB_CACHE_KEY,
                JSON.stringify({ jobs: jobs, timestamp: Date.now() })
              )
            }
            setAllJobs(jobs)
            
            // Compute counts per category
            const counts: { [category: string]: number } = {}
            jobs.forEach((job) => {
              const cat = job.category || "uncategorized"
              counts[cat] = (counts[cat] || 0) + 1
            })
            setCategoryCounts(counts)
          })
          .catch((error) => {
            console.error("Error fetching jobs:", error)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        setAllJobs(jobs)
        
        // Compute counts per category
        const counts: { [category: string]: number } = {}
        jobs.forEach((job) => {
          const cat = job.category || "uncategorized"
          counts[cat] = (counts[cat] || 0) + 1
        })
        setCategoryCounts(counts)
        setLoading(false)
      }
    }
  }, [authLoading])

  // Apply sorting to filtered jobs
  const getSortedJobs = (jobsToSort: any[]) => {
    // For now, just return as is - you can add sorting logic here later
    return jobsToSort
  }

  // Apply filters in-memory to the cached jobs array (same logic as search page)
  const filteredJobs = getSortedJobs(allJobs.filter((job) => {
    // Category filter
    if (filters.category !== "all" && job.category !== filters.category) return false
    
    // Search term filter
    if (filters.searchTerm && !(
      job.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )) return false
    
    // Job type filter
    if (filters.jobTypes.length > 0 && job.job_type && !filters.jobTypes.includes(job.job_type)) return false
    
    // Experience level filter
    if (filters.experienceLevels.length > 0 && job.experience_level && !filters.experienceLevels.includes(job.experience_level)) return false
    
    // Salary range filter
    if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 50) {
      const jobMinSalary = job.minSalary || 0
      const jobMaxSalary = job.maxSalary || 0
      if (jobMinSalary < filters.salaryRange[0] || jobMaxSalary > filters.salaryRange[1]) return false
    }
    
    return true
  }))

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE)

  const handleClearAllFilters = () => {
    clearFilters()
    router.push("/careers", { scroll: false })
    setIsFilterModalOpen(false)
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (authLoading) {
    return <div className="py-16 text-center text-lg text-muted-foreground">Loading...</div>
  }

  return (
    <div className="container px-0 py-4">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
        {/* Left Sidebar - Hidden on mobile */}
        <FiltersSidebar
          categories={categories}
          jobTypes={jobTypes}
          experienceLevels={experienceLevels}
          categoryCounts={categoryCounts}
          totalJobs={allJobs.length}
          activeFiltersCount={activeFiltersCount}
          onClearAllFilters={handleClearAllFilters}
          showClearButton={true}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Job Listings Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center">
                <span className="text-primary font-bold">{filteredJobs.length}</span>
                <span className="ml-2">Jobs Available</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5">
                    Active Filters: {activeFiltersCount}
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Showing results based on your preferences</p>
            </div>
            <div className="flex gap-2 items-center mt-3 md:mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center h-9">
                    <Clock className="h-4 w-4 mr-1.5" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Clock className="h-4 w-4 mr-2" /> Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <DollarSign className="h-4 w-4 mr-2" /> Highest Salary
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Star className="h-4 w-4 mr-2" /> Most Relevant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter button only shown on mobile devices */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center lg:hidden h-9"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4 mr-1.5" /> Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 border-4 border-primary border-r-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Try adjusting your search filters or try a different search term.
              </p>
              <Button onClick={handleClearAllFilters}>Clear All Filters</Button>
            </div>
          )}

          {/* Regular Jobs */}
          {!loading && filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav className="mt-10 flex justify-center">
              <ul className="flex items-center space-x-1">
                <li>
                  <Button variant="outline" size="icon" disabled={currentPage === 1} className="h-9 w-9" onClick={() => handlePageChange(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page}>
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9 font-medium"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </li>
                ))}
                <li>
                  <Button variant="outline" size="icon" disabled={currentPage === totalPages} className="h-9 w-9" onClick={() => handlePageChange(currentPage + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Filters Modal for Mobile - Using shadcn Dialog */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="md:max-w-[425px] h-[90vh] max-h-screen overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" /> Filter Jobs
            </DialogTitle>
          </DialogHeader>

          {/* Clear Filters Button - Top */}
          {activeFiltersCount > 0 && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Categories Section */}
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Categories</h3>
              <CategoryFilter 
                categories={categories} 
                categoryCounts={categoryCounts}
                totalJobs={allJobs.length}
              />
            </div>

            <div className="border-t border-gray-200" />

            {/* Job Type Section */}
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Job Type</h3>
              <JobTypeFilter jobTypes={jobTypes} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Experience Level Section */}
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Experience Level</h3>
              <ExperienceLevelFilter experienceLevels={experienceLevels} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Salary Range Section */}
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Salary Range</h3>
              <div className="flex items-start mb-2">
                <Badge variant="secondary">
                  ₹{filters.salaryRange[0]}L - ₹{filters.salaryRange[1]}L
                </Badge>
              </div>
              <SalaryRangeFilter />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
