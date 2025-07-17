'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-animation mb-4">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function VerificationHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleVerification = async () => {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const redirectTo = searchParams.get('redirect_to') || '/profile'

      if (token && type) {
        const supabase = createBrowserClient()
        
        try {
          // Verify the token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          })

          if (error) {
            console.error('Verification error:', error)
            router.push('/login?error=verification_failed')
            return
          }

          if (data.session) {
            // Set the session
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            })

            // Initialize user data via API route
            try {
              const response = await fetch('/api/auth/initialize-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: data.session.user.id,
                  email: data.session.user.email,
                  metadata: data.session.user.user_metadata
                }),
              })

              if (!response.ok) {
                console.error('User initialization failed:', await response.text())
              }
            } catch (initError) {
              console.error('User initialization error:', initError)
              // Continue with redirect even if initialization fails
              // The initialization will be retried on next login
            }
            
            // Redirect to the specified page
            router.push(redirectTo)
          }
        } catch (error) {
          console.error('Verification error:', error)
          router.push('/login?error=verification_failed')
        }
      } else {
        // If no verification token, redirect to dashboard or login
        router.push('/login')
      }
    }

    handleVerification()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-animation mb-4">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="text-gray-600">Verifying your account...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerificationHandler />
    </Suspense>
  )
}   
