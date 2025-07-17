"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { useFilters } from "@/contexts/filter-context"

export default function SalaryRangeFilter() {
  const { filters, updateFilter } = useFilters()
  const [localRange, setLocalRange] = useState(filters.salaryRange)

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("salaryRange", localRange)
    }, 500) // Wait 500ms after user stops sliding

    return () => clearTimeout(timer)
  }, [localRange, updateFilter])

  const handleRangeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]]
    setLocalRange(newRange)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">₹{localRange[0]}L</span>
        <span className="text-sm font-medium">₹{localRange[1]}L</span>
      </div>

      <div className="px-2">
        <Slider
          value={localRange}
          max={50}
          min={0}
          step={1}
          onValueChange={handleRangeChange}
          className="w-full"
          minStepsBetweenThumbs={1}
        />
      </div>

      <div className="grid grid-cols-3 text-xs text-muted-foreground">
        <div>₹0L</div>
        <div className="text-center">₹25L</div>
        <div className="text-right">₹50L+</div>
      </div>
    </div>
  )
}
