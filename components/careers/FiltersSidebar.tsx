"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import CategoryFilter from "./filters/CategoryFilter"
import JobTypeFilter from "./filters/JobTypeFilter"
import ExperienceLevelFilter from "./filters/ExperienceLevelFilter"
import SalaryRangeFilter from "./filters/SalaryRangeFilter"
import type { JobCategory, JobType, ExperienceLevel } from "@/types/job"

interface FiltersSidebarProps {
  categories: JobCategory[]
  jobTypes: JobType[]
  experienceLevels: ExperienceLevel[]
  categoryCounts?: { [category: string]: number }
  totalJobs?: number
  activeFiltersCount?: number
  onClearAllFilters?: () => void
  showClearButton?: boolean
  // For search page compatibility (when not using filter context)
  selectedCategory?: string
  selectedJobTypes?: string[]
  selectedExperienceLevels?: string[]
  onCategoryChange?: (category: string) => void
  onJobTypeChange?: (jobType: string) => void
  onExperienceLevelChange?: (level: string) => void
  useContext?: boolean
}

export default function FiltersSidebar({
  categories,
  jobTypes,
  experienceLevels,
  categoryCounts = {},
  totalJobs = 0,
  activeFiltersCount = 0,
  onClearAllFilters,
  showClearButton = true,
  // Search page props
  selectedCategory,
  selectedJobTypes = [],
  selectedExperienceLevels = [],
  onCategoryChange,
  onJobTypeChange,
  onExperienceLevelChange,
  useContext = true
}: FiltersSidebarProps) {
  // If not using context, render custom filter components
  if (!useContext) {
    return (
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-24">
          {/* Clear Filters Button - Top */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              {showClearButton && activeFiltersCount > 0 && onClearAllFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAllFilters}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-sm text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === "all" 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => onCategoryChange?.("all")}
              >
                <span className="truncate">All Categories</span>
                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium flex-shrink-0 ${
                  selectedCategory === "all" 
                    ? "bg-blue-100 text-blue-600" 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {totalJobs}
                </span>
              </button>
              {categories.filter(cat => cat.id !== "all").map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === cat.id 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => onCategoryChange?.(cat.id)}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium flex-shrink-0 ${
                    selectedCategory === cat.id 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Type Filter */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-sm text-gray-900 mb-3">Job Type</h3>
            <div className="space-y-2">
              {["full-time", "part-time", "contract", "remote", "internship"].map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sidebar-type-${type}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedJobTypes.includes(type)}
                    onChange={() => onJobTypeChange?.(type)}
                  />
                  <label htmlFor={`sidebar-type-${type}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                    {type === "full-time" ? "Full-time" : type === "part-time" ? "Part-time" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level Filter */}
          <div className="p-4">
            <h3 className="font-medium text-sm text-gray-900 mb-3">Experience Level</h3>
            <div className="space-y-2">
              {["entry-level", "mid-level", "senior-level", "executive"].map((level) => (
                <div key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sidebar-level-${level}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedExperienceLevels.includes(level)}
                    onChange={() => onExperienceLevelChange?.(level)}
                  />
                  <label htmlFor={`sidebar-level-${level}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                    {level === "entry-level" ? "Entry Level" : level === "mid-level" ? "Mid Level" : level === "senior-level" ? "Senior Level" : level.charAt(0).toUpperCase() + level.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Context-based version (for main careers page)
  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-24">
        {/* Clear Filters Button - Top */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
            {showClearButton && activeFiltersCount > 0 && onClearAllFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filter Sections */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Categories</h3>
          <CategoryFilter 
            categories={categories} 
            categoryCounts={categoryCounts}
            totalJobs={totalJobs}
          />
        </div>

        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Job Type</h3>
          <JobTypeFilter jobTypes={jobTypes} />
        </div>

        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Experience Level</h3>
          <ExperienceLevelFilter experienceLevels={experienceLevels} />
        </div>

        <div className="p-4">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Salary Range</h3>
          <SalaryRangeFilter />
        </div>
      </div>
    </div>
  )
} 