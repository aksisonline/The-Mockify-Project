"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function AuthTestPage() {
  const { user, session, isLoading } = useAuth()
  const [apiCallCount, setApiCallCount] = useState(0)
  const [callDetails, setCallDetails] = useState<Array<{url: string, stack: string, timestamp: string}>>([])

  useEffect(() => {
    // Monitor API calls to set-session with detailed stack traces
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      const url = args[0] as string
      if (url.includes('/api/auth/set-session')) {
        const stack = new Error().stack || 'No stack trace available'
        const timestamp = new Date().toISOString()
        
        setApiCallCount(prev => prev + 1)
        setCallDetails(prev => [...prev, { url, stack, timestamp }])
        
        console.log(`🚨 Auth API call #${apiCallCount + 1}:`, url)
        console.log('📋 Stack trace:', stack)
        console.log('⏰ Timestamp:', timestamp)
        console.log('🔍 Arguments:', args)
      }
      return originalFetch.apply(this, args)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [apiCallCount])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page - Enhanced Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Auth State:</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'None'}</p>
          <p>Session: {session ? 'Active' : 'None'}</p>
        </div>

        <div className="p-4 bg-red-100 rounded">
          <h2 className="font-semibold text-red-800">API Call Monitor:</h2>
          <p className="text-red-800">Set-session API calls: {apiCallCount}</p>
          {apiCallCount > 10 && (
            <p className="text-red-600 font-semibold">⚠️ Too many API calls detected!</p>
          )}
        </div>

        {callDetails.length > 0 && (
          <div className="p-4 bg-yellow-100 rounded">
            <h2 className="font-semibold text-yellow-800">Call Details:</h2>
            {callDetails.map((detail, index) => (
              <div key={index} className="mt-2 p-2 bg-white rounded border">
                <p className="text-sm font-semibold">Call #{index + 1} at {detail.timestamp}</p>
                <p className="text-xs text-gray-600">URL: {detail.url}</p>
                <details className="mt-1">
                  <summary className="text-xs cursor-pointer text-blue-600">Show Stack Trace</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-32">
                    {detail.stack}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold">Instructions:</h2>
          <p>1. Navigate to the login page</p>
          <p>2. Try to login</p>
          <p>3. Check the call details above to see where the requests are coming from</p>
          <p>4. Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
} 