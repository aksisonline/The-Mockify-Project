"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Handle auth errors globally
    const handleAuthError = (event: any) => {
      if (event.detail?.error?.message?.includes('unauthorized') ||
          event.detail?.error?.message?.includes('not authenticated') ||
          event.detail?.error?.message?.includes('401')) {
        
        console.log("�� [AuthErrorBoundary] Global auth error detected, redirecting to login")
        toast.error("Session expired. Please sign in again.")
        router.push('/login')
      }
    }

    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [router])

  // Don't render children until auth is initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
} 