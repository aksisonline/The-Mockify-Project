"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getPopularSearches } from "@/lib/job-service-client"

export default function HeroSection() {
  const router = useRouter()
  const popularSearches = getPopularSearches()
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce function to limit API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Debounced fetch function
  const debouncedFetch = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setLocationSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/locations?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        setLocationSuggestions(data)
      } catch (error) {
        console.error("Error fetching locations:", error)
        setLocationSuggestions([])
      }
    }, 300),
  ).current

  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    debouncedFetch(value)
    setShowLocationSuggestions(true)
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    if (searchTerm) {
      params.append("search", searchTerm)
    }

    if (location) {
      params.append("location", location)
    }

    router.push(`/careers/search?${params.toString()}`)
  }

  const selectLocation = (suggestion: string) => {
    setLocation(suggestion)
    setShowLocationSuggestions(false)
  }

  return (
    <section className=" border-b ">
      <div className="container p-0">
        <div className="">
          {/* <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-gray-900">
              Find Your Dream Job Today
            </h1>
            <p className="text-base md:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover thousands of job opportunities with all the information you need. Browse through our job listings
              to find the perfect match for your career goals.
            </p>
          </div> */}

          {/* Search Form - Redesigned */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-8 rounded-xl shadow-lg border border-blue-100 mb-4 relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
            </div>

            <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 relative z-10">
              Find Your Perfect Role
            </h3>

            <form onSubmit={handleSearch} className="relative z-10">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm overflow-hidden">
                    <div className="pl-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-5 w-5 text-blue-500"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <Input
                      type="text"
                      placeholder="Job title or keywords"
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTerm("")}
                      >
                        <span className="sr-only">Clear search</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm overflow-hidden">
                    <div className="pl-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-5 w-5 text-blue-500"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <Input
                      ref={locationInputRef}
                      type="text"
                      placeholder="Location"
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-1"
                      value={location}
                      onChange={handleLocationChange}
                      onFocus={() => location.length >= 2 && setShowLocationSuggestions(true)}
                    />
                    {location && (
                      <button
                        type="button"
                        className="pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setLocation("")}
                      >
                        <span className="sr-only">Clear location</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                    >
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
                          onClick={() => selectLocation(suggestion)}
                        >
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5 mr-2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Find Jobs
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Popular:</span>
                {[
                  { type: "keyword", value: "  Engineer", label: "  Engineer" },
                  { type: "keyword", value: "Designer", label: "Designer" },
                  { type: "jobType", value: "Full-time", label: "Full-time" },
                  { type: "location", value: "Remote", label: "Remote" },
                  { type: "location", value: "Hyderabad", label: "Hyderabad" },
                ].map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      // Reset all parameters first
                      setSearchTerm("")
                      setLocation("")

                      // Set only the specific parameter based on type
                      if (item.type === "keyword") {
                        setSearchTerm(item.value)
                      } else if (item.type === "location") {
                        setLocation(item.value)
                      } else if (item.type === "jobType") {
                        // In a real implementation, this would set a job type filter
                        // For now, we'll just use the search term
                        setSearchTerm(item.value)
                      }
                    }}
                    className={`text-sm bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-3 py-1 rounded-full border border-gray-200 transition-colors flex items-center gap-1`}
                  >
                    {item.type === "keyword" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3 w-3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    )}
                    {item.type === "location" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3 w-3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                    {item.type === "jobType" && (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {item.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
