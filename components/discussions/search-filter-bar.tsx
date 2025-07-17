"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface SearchFilterBarProps {
  searchQuery: string
  filter: string
  onSearchChange: (value: string) => void
  onFilterChange: (value: string) => void
  onSearch?: (query: string) => void
  onSortChange?: (sort: "newest" | "popular" | "activity") => void
  sortBy?: "newest" | "popular" | "activity"
}

export function SearchFilterBar({ 
  searchQuery, 
  filter, 
  onSearchChange, 
  onFilterChange,
  onSearch,
  onSortChange,
  sortBy 
}: SearchFilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search discussions..."
            className="pl-10 border-gray-200 focus:border-blue-400 rounded-lg bg-gray-50 h-10 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="border-gray-200 rounded-lg bg-gray-50 h-10 w-40">
              <SelectValue placeholder="Sort By" className="text-sm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
