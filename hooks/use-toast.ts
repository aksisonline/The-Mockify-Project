"use client"

import { toast as sonnerToast } from "sonner"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  return {
    toast: ({ title, description, variant, action }: ToastProps) => {
      if (variant === "destructive") {
        return sonnerToast.error(title || "Error", {
          description,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
      }
      
      return sonnerToast(title || "Success", {
        description,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    },
    dismiss: () => {}, // Sonner handles dismissal automatically
  }
}

// Direct toast function for backward compatibility
export const toast = ({ title, description, variant, action }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title || "Error", {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  }
  
  return sonnerToast(title || "Success", {
    description,
    action: action ? {
      label: action.label,
      onClick: action.onClick
    } : undefined
  })
}
