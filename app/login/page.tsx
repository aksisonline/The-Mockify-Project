"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"
import { updateProfileCompletion } from "@/lib/profile-service"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Move form components outside to prevent recreation on re-renders
const LoginForm = React.memo(({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isLoading, 
  handleSubmit, 
  handleSocialLogin 
}: {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  isLoading: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleSocialLogin: (provider: string) => void
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <Link href="/" className="inline-block">
          <Image src="/mockify-logo.png" alt="Mockify Logo" width={180} height={60} className="h-12 w-auto" />
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">Sign in to Mockify</h1>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handleSocialLogin("Facebook")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("Microsoft")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F25022" d="M11.4 24H0V12.6h11.4V24z"/>
            <path fill="#00A4EF" d="M24 24H12.6V12.6H24V24z"/>
            <path fill="#7FBA00" d="M11.4 11.4H0V0h11.4v11.4z"/>
            <path fill="#FFB900" d="M24 11.4H12.6V0H24v11.4z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("Google")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </button>
        <button
          onClick={() => handleSocialLogin("LinkedIn")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
      </div>

      <p className="text-center text-gray-500 mb-6">or use your email account:</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12"
              required
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-animation">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "SIGN IN"
          )}
        </Button>
      </form>
    </div>
  )
})

const SignUpForm = React.memo(({ 
  name, 
  setName, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isLoading, 
  handleSubmit, 
  handleSocialLogin 
}: {
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  isLoading: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleSocialLogin: (provider: string) => void
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <Link href="/" className="inline-block">
          <Image src="/mockify-logo.png" alt="Mockify Logo" width={180} height={60} className="h-12 w-auto" />
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">Create Account</h1>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handleSocialLogin("Facebook")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("Microsoft")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F25022" d="M11.4 24H0V12.6h11.4V24z"/>
            <path fill="#00A4EF" d="M24 24H12.6V12.6H24V24z"/>
            <path fill="#7FBA00" d="M11.4 11.4H0V0h11.4v11.4z"/>
            <path fill="#FFB900" d="M24 11.4H12.6V0H24v11.4z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("Google")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </button>
        <button
          onClick={() => handleSocialLogin("LinkedIn")}
          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors relative group"
          title="Coming soon"
          disabled
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Coming soon
          </span>
        </button>
      </div>

      <p className="text-center text-gray-500 mb-6">or use your email for registration:</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12"
              required
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12"
              required
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-animation">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "SIGN UP"
          )}
        </Button>
      </form>
    </div>
  )
})

// Welcome panel and Return panel components
const WelcomePanel = React.memo(({ handleModeSwitch }: { handleModeSwitch: (mode: boolean) => void }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
    <p className="text-center mb-8 max-w-xs">Enter your personal details and start journey with us</p>
    <Button
      onClick={() => handleModeSwitch(false)}
      className="rounded-full border-2 border-white bg-transparent hover:bg-black/20 text-white px-10 h-12"
    >
      SIGN UP
    </Button>
  </div>
))

const ReturnPanel = React.memo(({ handleModeSwitch }: { handleModeSwitch: (mode: boolean) => void }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
    <p className="text-center mb-8 max-w-xs">To keep connected with us please login with your personal info</p>
    <Button
      onClick={() => handleModeSwitch(true)}
      className="rounded-full border-2 border-white bg-transparent hover:bg-black/20 text-white px-10 h-12"
    >
      SIGN IN
    </Button>
  </div>
))

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn, signInWithMicrosoft, user, isLoading: authLoading } = useAuth() as any;
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/profile"
  const mode = searchParams.get("mode")

  // Ensure hydration is complete before rendering
  useEffect(() => {
    setIsHydrated(true)
    // Check for mode parameter and switch to sign up if needed
    if (mode === "signup") {
      handleModeSwitch(false)
    }
  }, [mode])

  // Redirect if already authenticated
  useEffect(() => {
    // console.log("🔍 [Login] Auth state check:", { 
    //   hasUser: !!user, 
    //   authLoading, 
    //   isLoading, 
    //   userEmail: user?.email 
    // })
    
    if (user && !authLoading && !isLoading) {
      // console.log("✅ [Login] User authenticated, redirecting to:", redirectTo)
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, redirectTo, isLoading])

  // Memoize handlers to prevent recreation on each render
  const handleModeSwitch = useCallback((mode: boolean) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsLogin(mode)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 400)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // console.log("🔍 [Login] Form submitted, attempting authentication...")

    try {
      if (isLogin) {
        // console.log("🔍 [Login] Attempting sign in with email/password...")
        const { error } = await signIn(email, password)
        if (error) {
          // console.log("❌ [Login] Sign in error:", error)
          toast.error(error.message)
          setIsLoading(false)
        } else {
          // console.log("✅ [Login] Sign in successful, waiting for auth state change...")
          // Successful login - let the auth state change handle redirection
          setIsLoading(false);
        }
      } else {
        // console.log("🔍 [Login] Attempting sign up...")
        const { error } = await signUp(email, password, { full_name: name })
        if (error) {
          // console.log("❌ [Login] Sign up error:", error)
          toast.error(error.message)
          setIsLoading(false)
        } else {
          // console.log("✅ [Login] Sign up successful, check email for confirmation")
          toast.success("Check your email for a confirmation link!")
          setIsLoading(false)
        }
      }
    } catch (error) {
      // console.log("❌ [Login] Unexpected error:", error)
      toast.error("An unexpected error occurred")
      setIsLoading(false)
    }
  }, [isLogin, email, password, name, signIn, signUp, router, redirectTo])

  const handleSocialLogin = useCallback(async (provider: string) => {
    setIsLoading(true)
    
    try {
      let result
      switch (provider) {
        case "Google":
          result = await signInWithGoogle()
          break
        case "Facebook":
          result = await signInWithFacebook()
          break
        case "LinkedIn":
          result = await signInWithLinkedIn()
          break
        case "Microsoft":
          result = await signInWithMicrosoft()
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }
      
      if (result.error) {
        toast.error(`Failed to sign in with ${provider}: ${result.error.message}`)
        setIsLoading(false)
      }
    } catch (error) {
      toast.error(`Error signing in with ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }, [signInWithGoogle, signInWithFacebook, signInWithLinkedIn, signInWithMicrosoft])

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/90 z-10 transition-all duration-500 ease-in-out">
        <div className="relative flex flex-col md:flex-row md:h-[600px]">
          {/* Mobile view */}
          {isMobile && (
            <div className="w-full p-8 transition-all duration-500 ease-in-out bg-white/95 dark:bg-gray-900/95">
              {/* Mobile mode toggle */}
              <div className="flex mb-6 border border-gray-200 dark:border-gray-700 rounded-full p-1">
                <button
                  onClick={() => handleModeSwitch(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                    isLogin
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleModeSwitch(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                    !isLogin
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {isLogin ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  handleSocialLogin={handleSocialLogin}
                />
              ) : (
                <SignUpForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  handleSocialLogin={handleSocialLogin}
                />
              )}
            </div>
          )}

          {/* Desktop view - Left Panel */}
          {!isMobile && (
            <div
              className={`w-1/2 p-12 transition-all duration-500 ease-in-out ${
                isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
              } ${isLogin ? "bg-white/95 dark:bg-gray-900/95" : "bg-blue-600 text-white"}`}
            >
              {isLogin ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  handleSocialLogin={handleSocialLogin}
                />
              ) : (
                <ReturnPanel handleModeSwitch={handleModeSwitch} />
              )}
            </div>
          )}

          {/* Desktop view - Right Panel */}
          {!isMobile && (
            <div
              className={`w-1/2 p-12 transition-all duration-500 ease-in-out ${
                isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
              } ${isLogin ? "bg-blue-600 text-white" : "bg-white/95 dark:bg-gray-900/95"}`}
            >
              {isLogin ? (
                <WelcomePanel handleModeSwitch={handleModeSwitch} />
              ) : (
                <SignUpForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  handleSocialLogin={handleSocialLogin}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
