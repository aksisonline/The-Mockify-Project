'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserPointsByCategory, getAllCategoriesWithUserPoints, awardCategoryPoints, spendCategoryPoints } from '@/lib/points-category-service'
import { useAuth } from '@/contexts/auth-context'
import type { UserPointsByCategory } from '@/types/supabase'
import { useProfile } from "@/hooks/use-profile"

interface UseCategoryPointsResult {
  pointsByCategory: UserPointsByCategory[]
  totalPoints: number
  isLoading: boolean
  error: string | null
  refreshPoints: () => Promise<void>
  awardPoints: (categoryName: string, amount: number, reason?: string) => Promise<boolean>
  spendPoints: (categoryName: string, amount: number, reason?: string) => Promise<boolean>
}

export function useCategoryPoints() {
  const { profile, isLoading, error, fetchProfile } = useProfile()
  const pointsByCategory = profile?.pointsByCategory || []
  const totalPoints =
    profile?.points?.total_points || 0

  return {
    pointsByCategory,
    totalPoints,
    isLoading,
    error,
    refreshPoints: fetchProfile,
  }
}

// Hook for getting points for a specific category
export function useCategorySpecificPoints(categoryName: string) {
  const { pointsByCategory, isLoading, error, refreshPoints } = useCategoryPoints()
  
  const categoryPoints = pointsByCategory.find((category: { category_name: string }) => category.category_name === categoryName)
  


  return {
    categoryPoints,
    points: categoryPoints?.net_points || 0,
    totalEarned: categoryPoints?.total_earned || 0,
    totalSpent: categoryPoints?.total_spent || 0,
    transactionCount: categoryPoints?.transaction_count || 0,
    lastTransactionDate: categoryPoints?.last_transaction_date,
    isLoading,
    error,
    refreshPoints
  }
}
