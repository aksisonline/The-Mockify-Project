"use client"

import * as LucideIcons from "lucide-react"
import { HelpCircle } from "lucide-react"
import React from "react"

interface DynamicIconProps {
  iconName?: string
  iconColor?: string
  size?: number
}

export default function DynamicIcon({ iconName, iconColor = "currentColor", size = 32 }: DynamicIconProps) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<object>>
  const IconComponent = iconName && icons[pascalCase(iconName)] ? icons[pascalCase(iconName)] : HelpCircle
  return <IconComponent color={iconColor} size={size} />
}

function pascalCase(str?: string) {
  if (!str) return ""
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")
}
