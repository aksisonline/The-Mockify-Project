"use client"

import { useFilters } from "@/contexts/filter-context"
import type { ExperienceLevel } from "@/types/job"

interface ExperienceLevelFilterProps {
  experienceLevels: ExperienceLevel[]
}

export default function ExperienceLevelFilter({ experienceLevels }: ExperienceLevelFilterProps) {
  const { filters, updateFilter } = useFilters()
  const selectedExperienceLevels = filters.experienceLevels

  const handleExperienceLevelChange = (level: string) => {
    const newLevels = selectedExperienceLevels.includes(level)
      ? selectedExperienceLevels.filter((l) => l !== level)
      : [...selectedExperienceLevels, level]

    updateFilter("experienceLevels", newLevels)
  }

  return (
    <div className="space-y-2">
      {experienceLevels.map((level) => (
        <div key={level.id} className="flex items-center">
          <input
            type="checkbox"
            id={`experience-${level.id}`}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={selectedExperienceLevels.includes(level.id)}
            onChange={() => handleExperienceLevelChange(level.id)}
          />
          <label htmlFor={`experience-${level.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
            {level.name}
          </label>
        </div>
      ))}
    </div>
  )
}
