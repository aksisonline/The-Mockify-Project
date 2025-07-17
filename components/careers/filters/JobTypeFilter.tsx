"use client"

import { useFilters } from "@/contexts/filter-context"
import type { JobType } from "@/types/job"

interface JobTypeFilterProps {
  jobTypes: JobType[]
}

export default function JobTypeFilter({ jobTypes }: JobTypeFilterProps) {
  const { filters, updateFilter } = useFilters()
  const selectedJobTypes = filters.jobTypes

  const handleJobTypeChange = (jobType: string) => {
    const newJobTypes = selectedJobTypes.includes(jobType)
      ? selectedJobTypes.filter((type) => type !== jobType)
      : [...selectedJobTypes, jobType]
    updateFilter("jobTypes", newJobTypes)
  }

  return (
    <div className="space-y-2">
      {jobTypes.map((jobType) => {
        const isSelected = selectedJobTypes.includes(jobType.id)
        return (
          <div key={jobType.id} className="flex items-center">
            <input
              type="checkbox"
              id={`job-type-${jobType.id}`}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isSelected}
              onChange={() => handleJobTypeChange(jobType.id)}
            />
            <label htmlFor={`job-type-${jobType.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
              {jobType.name}
            </label>
          </div>
        )
      })}
    </div>
  )
}
