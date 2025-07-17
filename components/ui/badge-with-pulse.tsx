"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface BadgeWithPulseProps {
  children: React.ReactNode
  className?: string
  pulseColor?: string
  pulseSize?: "sm" | "md" | "lg"
  pulsePosition?: "left" | "right"
}

export function BadgeWithPulse({
  children,
  className,
  pulseColor = "bg-blue-600 dark:bg-blue-400",
  pulseSize = "sm",
  pulsePosition = "left",
}: BadgeWithPulseProps) {
  // Size mapping
  const sizeMap = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  // Position mapping
  const marginMap = {
    left: "mr-2",
    right: "ml-2",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium",
        className,
      )}
    >
      {pulsePosition === "left" && (
        <span className={cn("flex rounded-full relative", sizeMap[pulseSize], pulseColor, marginMap[pulsePosition])}>
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: "currentColor" }}
          ></span>
          <span className={cn("relative inline-flex rounded-full h-full w-full", pulseColor)}></span>
        </span>
      )}

      {children}

      {pulsePosition === "right" && (
        <span className={cn("flex rounded-full relative", sizeMap[pulseSize], pulseColor, marginMap[pulsePosition])}>
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: "currentColor" }}
          ></span>
          <span className={cn("relative inline-flex rounded-full h-full w-full", pulseColor)}></span>
        </span>
      )}
    </div>
  )
}
