"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, MapPin, Filter, Clock, ArrowUpDown, Grid, List, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import JobCard from "@/components/careers/JobCard"
import { getJobsFromDB, getLocations, getCategories } from "@/lib/job-service-client"
import type { Job } from "@/types/job"
import ContentWrapper from "@/components/ContentWrapper"
import AppHeader from "@/components/ui/AppHeader"
import FiltersSidebar from "@/components/careers/FiltersSidebar"

const JOB_CACHE_KEY = "jobCache"
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const JOBS_PER_PAGE = 10

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get initial search values from URL
  const initialSearchTerm = searchParams.get("search") || ""
  const initialLocation = searchParams.get("location") || ""

  // State for search inputs
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [location, setLocation] = useState(initialLocation)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)

  // State for search results
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortOption, setSortOption] = useState<string>("relevance")
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryCounts, setCategoryCounts] = useState<{ [category: string]: number }>({})
  const [categories, setCategories] = useState<any[]>([])

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([])

  // Refs for handling click outside
  const locationInputRef = useRef<HTMLInputElement>(null)
  const locationSuggestionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchSuggestionsRef = useRef<HTMLDivElement>(null)

  // Ref to track if we've already fetched jobs to prevent infinite loops
  const hasInitializedRef = useRef(false)
  const currentSearchParamsRef = useRef("")

  // Debounce function to limit API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Debounced fetch functions
  const debouncedFetchLocations = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setLocationSuggestions([])
        return
      }

      try {
        // In a real app, this would be an API call
        const locations = await getLocations(query)
        setLocationSuggestions(locations)
      } catch (error) {
        console.error("Error fetching locations:", error)
        setLocationSuggestions([])
      }
    }, 300),
  ).current

  const debouncedFetchSearchSuggestions = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchSuggestions([])
        return
      }

      try {
        // Mock search suggestions based on common job titles
        // In a real app, this would be an API call
        const commonJobTitles = [
          "Software Engineer",
          "Product Manager",
          "Data Scientist",
          "UX Designer",
          "Marketing Manager",
        ]

        const filteredSuggestions = commonJobTitles
          .filter((title) => title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)

        setSearchSuggestions(filteredSuggestions)
      } catch (error) {
        console.error("Error fetching search suggestions:", error)
        setSearchSuggestions([])
      }
    }, 300),
  ).current

  // Handle input changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    debouncedFetchLocations(value)
    setShowLocationSuggestions(true)
  }

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedFetchSearchSuggestions(value)
    setShowSearchSuggestions(true)
  }

  // Handle suggestion selection
  const selectLocation = (suggestion: string) => {
    setLocation(suggestion)
    setShowLocationSuggestions(false)
  }

  const selectSearchTerm = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSearchSuggestions(false)
  }

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const params = new URLSearchParams()

    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    router.push(`/careers/search?${params.toString()}`)
  }

  // Filter handlers
  const handleJobTypeChange = (jobType: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(jobType) 
        ? prev.filter(type => type !== jobType)
        : [...prev, jobType]
    )
  }

  const handleExperienceLevelChange = (level: string) => {
    setSelectedExperienceLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedJobTypes([])
    setSelectedExperienceLevels([])
    setSearchTerm("")
    setLocation("")
    router.push("/careers/search")
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle location suggestions
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false)
      }

      // Handle search suggestions
      if (
        searchSuggestionsRef.current &&
        !searchSuggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Initialize search inputs from URL params
  useEffect(() => {
    // Only update the search inputs if they're different from the current state
    // to avoid unnecessary re-renders
    const urlSearchTerm = searchParams.get("search") || ""
    const urlLocation = searchParams.get("location") || ""

    if (searchTerm !== urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
    }

    if (location !== urlLocation) {
      setLocation(urlLocation)
    }
  }, [searchParams])

  // Fetch jobs and category counts on mount
  useEffect(() => {
    async function loadJobs() {
      setLoading(true)
      let allJobs: Job[] = []
      // Try cache first
      if (typeof window !== "undefined") {
        const cacheRaw = localStorage.getItem(JOB_CACHE_KEY)
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw)
          if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL && Array.isArray(cache.jobs)) {
            allJobs = cache.jobs
          }
        }
      }
      // If no cache, fetch from DB and update cache
      if (!allJobs.length) {
        const { jobs: fetchedJobs } = await getJobsFromDB({})
        allJobs = fetchedJobs
        if (typeof window !== "undefined") {
          localStorage.setItem(
            JOB_CACHE_KEY,
            JSON.stringify({ jobs: allJobs, timestamp: Date.now() })
          )
        }
      }
      // Compute counts per category
      const counts: { [category: string]: number } = {}
      allJobs.forEach((job) => {
        const cat = job.category || "uncategorized"
        counts[cat] = (counts[cat] || 0) + 1
      })
      setCategoryCounts(counts)
      setJobs(allJobs)
      setCategories(getCategories())
      setLoading(false)
    }
    loadJobs()
  }, [])

  // Handle sort change
  const handleSortChange = (option: string) => {
    setSortOption(option)
  }

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams, sortOption, selectedCategory, selectedJobTypes, selectedExperienceLevels])

  // Apply sorting to filtered jobs
  const getSortedJobs = (jobsToSort: Job[]) => {
    switch (sortOption) {
      case "recent":
        return [...jobsToSort].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      case "salary-high":
        return [...jobsToSort].sort((a, b) => (b.maxSalary || 0) - (a.maxSalary || 0))
      case "salary-low":
        return [...jobsToSort].sort((a, b) => (a.minSalary || 0) - (b.minSalary || 0))
      default: // relevance
        return jobsToSort
    }
  }

  // In the main render, apply all filters in-memory to the cached jobs array
  const filteredJobs = getSortedJobs(jobs.filter((job) => {
    // Category filter
    if (selectedCategory !== "all" && job.category !== selectedCategory) return false
    
    // Search term filter
    if (searchTerm && !(
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false
    
    // Location filter
    if (location && !(job.location?.toLowerCase().includes(location.toLowerCase()))) return false
    
    // Job type filter
    if (selectedJobTypes.length > 0 && job.job_type && !selectedJobTypes.includes(job.job_type)) return false
    
    // Experience level filter
    if (selectedExperienceLevels.length > 0 && job.experience_level && !selectedExperienceLevels.includes(job.experience_level)) return false
    
    return true
  }))
  
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE)

  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== "all" || selectedJobTypes.length > 0 || selectedExperienceLevels.length > 0 || searchTerm || location

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader title="Careers" subtitle="Find your next opportunity in  " />
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-white border-b sticky top-0 z-30 shadow-sm rounded-lg mb-6">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 min-w-0">
              {/* Job Title Search */}
              <div className="flex-1 relative min-w-0">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm">
                  <div className="pl-3 flex items-center flex-shrink-0">
                    <Search className="h-5 w-5 text-blue-500" />
                  </div>
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Job title or keywords"
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1 min-w-0"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    onFocus={() => searchTerm.length >= 2 && setShowSearchSuggestions(true)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="pr-3 flex items-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <span className="sr-only">Clear search</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Suggestions */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div
                    ref={searchSuggestionsRef}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
                        onClick={() => selectSearchTerm(suggestion)}
                      >
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Search */}
              <div className="flex-1 relative min-w-0">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm">
                  <div className="pl-3 flex items-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <Input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Location"
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1 min-w-0"
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => location.length >= 2 && setShowLocationSuggestions(true)}
                  />
                  {location && (
                    <button
                      type="button"
                      className="pr-3 flex items-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                      onClick={() => setLocation("")}
                    >
                      <span className="sr-only">Clear location</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Location Suggestions */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={locationSuggestionsRef}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
                        onClick={() => selectLocation(suggestion)}
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
              >
                <Search className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="sm:hidden flex items-center flex-shrink-0">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Jobs</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {/* Clear Filters Button - Top */}
                    {hasActiveFilters && (
                      <div className="mb-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={clearAllFilters}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}

                    {/* Mobile filters content */}
                    <div className="space-y-6">
                      {/* Categories Filter */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 mb-3">Categories</h3>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="mobile-category-all"
                              name="mobile-category"
                              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedCategory === "all"}
                              onChange={() => setSelectedCategory("all")}
                            />
                            <label htmlFor="mobile-category-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                              All Categories
                            </label>
                          </div>
                          {categories.filter(cat => cat.id !== "all").map((cat) => (
                            <div key={cat.id} className="flex items-center">
                              <input
                                type="radio"
                                id={`mobile-category-${cat.id}`}
                                name="mobile-category"
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedCategory === cat.id}
                                onChange={() => setSelectedCategory(cat.id)}
                              />
                              <label htmlFor={`mobile-category-${cat.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                {cat.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Job Type Filter */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 mb-3">Job Type</h3>
                        <div className="space-y-2">
                          {["full-time", "part-time", "contract", "remote", "internship"].map((type) => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-type-${type}`}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedJobTypes.includes(type)}
                                onChange={() => handleJobTypeChange(type)}
                              />
                              <label htmlFor={`mobile-type-${type}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                {type === "full-time" ? "Full-time" : type === "part-time" ? "Part-time" : type.charAt(0).toUpperCase() + type.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Level Filter */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 mb-3">Experience Level</h3>
                        <div className="space-y-2">
                          {["entry-level", "mid-level", "senior-level", "executive"].map((level) => (
                            <div key={level} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-level-${level}`}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedExperienceLevels.includes(level)}
                                onChange={() => handleExperienceLevelChange(level)}
                              />
                              <label htmlFor={`mobile-level-${level}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                {level === "entry-level" ? "Entry Level" : level === "mid-level" ? "Mid Level" : level === "senior-level" ? "Senior Level" : level.charAt(0).toUpperCase() + level.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Sidebar Filters - Hidden on Mobile */}
          <FiltersSidebar
            categories={categories}
            jobTypes={[
              { id: "full-time", name: "Full-time", icon: "bi-clock-fill" },
              { id: "part-time", name: "Part-time", icon: "bi-clock" },
              { id: "contract", name: "Contract", icon: "bi-file-earmark-text" },
              { id: "remote", name: "Remote", icon: "bi-house-door" },
              { id: "internship", name: "Internship", icon: "bi-mortarboard" }
            ]}
            experienceLevels={[
              { id: "entry-level", name: "Entry Level", icon: "bi-person" },
              { id: "mid-level", name: "Mid Level", icon: "bi-person-check" },
              { id: "senior-level", name: "Senior Level", icon: "bi-person-fill" },
              { id: "executive", name: "Executive", icon: "bi-person-badge" }
            ]}
            categoryCounts={categoryCounts}
            totalJobs={jobs.length}
            activeFiltersCount={hasActiveFilters ? 1 : 0}
            onClearAllFilters={clearAllFilters}
            showClearButton={false}
            // Search page specific props
            selectedCategory={selectedCategory}
            selectedJobTypes={selectedJobTypes}
            selectedExperienceLevels={selectedExperienceLevels}
            onCategoryChange={setSelectedCategory}
            onJobTypeChange={handleJobTypeChange}
            onExperienceLevelChange={handleExperienceLevelChange}
            useContext={false}
          />

          {/* Search Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold">
                    {loading ? (
                      <Skeleton className="h-7 w-48" />
                    ) : (
                      <>
                        {filteredJobs.length} Jobs Found
                        {(searchParams.get("search") || searchParams.get("location")) && (
                          <span className="text-gray-500 font-normal ml-2 text-base">
                            for{" "}
                            {searchParams.get("search") && (
                              <Badge variant="outline" className="mr-1">
                                {searchParams.get("search")}
                              </Badge>
                            )}
                            {searchParams.get("location") && (
                              <Badge variant="outline">in {searchParams.get("location")}</Badge>
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </h1>
                  {!loading && (
                    <p className="text-sm text-gray-500 mt-1">
                      Showing results{" "}
                      {filteredJobs.length > 0 ? `1-${Math.min(filteredJobs.length, 10)} of ${filteredJobs.length}` : "0-0 of 0"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSortChange("relevance")}>Most Relevant</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange("recent")}>
                        <Clock className="h-4 w-4 mr-2" /> Most Recent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange("salary-high")}>
                        Salary (High to Low)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange("salary-low")}>
                        Salary (Low to High)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex border border-gray-200 rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col gap-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        handleSearch()
                      }}
                    >
                      Clear Search Term
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocation("")
                        handleSearch()
                      }}
                    >
                      Clear Location
                    </Button>
                    <Button
                      onClick={clearAllFilters}
                    >
                      View All Jobs
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* No Jobs Available */}
            {!loading && jobs.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No jobs available</h2>
                  <p className="text-gray-500 mb-6">
                    There are currently no jobs posted. Please check back later.
                  </p>
                </div>
              </div>
            )}

            {/* Results List */}
            {!loading && filteredJobs.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredJobs.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <span className="sr-only">Previous page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    className="h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <span className="sr-only">Next page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
