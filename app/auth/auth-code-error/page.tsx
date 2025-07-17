"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <Image src="/mockify-logo.png" alt="Mockify Logo" width={180} height={60} className="h-12 w-auto" />
          </Link>
          
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Email Confirmation Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The email confirmation link is invalid or has expired.
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Please try signing up again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => window.location.href = "/login"}
            className="w-full h-12"
          >
            Go to Sign In
          </Button>
          
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 