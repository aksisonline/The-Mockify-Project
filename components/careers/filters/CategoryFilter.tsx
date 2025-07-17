"use client"

import { Button } from "@/components/ui/button"
import { useFilters } from "@/contexts/filter-context"
import type { JobCategory } from "@/types/job"

interface CategoryFilterProps {
  categories: JobCategory[]
  categoryCounts?: { [category: string]: number }
  totalJobs?: number
}

export default function CategoryFilter({ categories, categoryCounts = {}, totalJobs = 0 }: CategoryFilterProps) {
  const { filters, updateFilter } = useFilters()
  const selectedCategory = filters.category

  const handleCategoryChange = (category: string) => {
    updateFilter("category", category)
  }

  return (
    <div className="space-y-1">
      <button
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
          selectedCategory === "all" 
            ? "bg-blue-50 text-blue-700 border border-blue-200" 
            : "text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => handleCategoryChange("all")}
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
          onClick={() => handleCategoryChange(cat.id)}
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
  )
}
