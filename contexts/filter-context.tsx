"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { FilterState } from "@/types/job"

interface FilterContextType {
  filters: FilterState
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  applyFilters: () => void
  activeFiltersCount: number
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "all",
    jobTypes: searchParams.get("jobType")?.split(",").filter(Boolean) || [],
    experienceLevels: searchParams.get("experienceLevel")?.split(",").filter(Boolean) || [],
    salaryRange: [Number(searchParams.get("minSalary")) || 0, Number(searchParams.get("maxSalary")) || 50],
    searchTerm: searchParams.get("search") || "",
  })

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "category" && value !== "all") return count + 1
    if (Array.isArray(value) && value.length > 0) return count + 1
    if (key === "salaryRange" && (value[0] > 0 || value[1] < 50)) return count + 1
    if (key === "searchTerm" && value !== "") return count + 1
    return count
  }, 0)

  // Update a specific filter
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "all",
      jobTypes: [],
      experienceLevels: [],
      salaryRange: [0, 50],
      searchTerm: "",
    })
  }

  // Apply filters (this would be used to trigger navigation in the parent component)
  const applyFilters = () => {
    // This is a placeholder - the actual navigation will be handled by the component using this context
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        clearFilters,
        applyFilters,
        activeFiltersCount,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}
