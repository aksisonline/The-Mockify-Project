"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronLeft, ChevronRight, MapPin, Briefcase, Mail, Award, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublicProfiles, PublicProfile } from "@/lib/directory-service"
import ContentWrapper from "@/components/ContentWrapper"
import AppHeader from "@/components/ui/AppHeader"

// Function to get initials from name
const getInitials = (name: string) => {
  if (!name) return "??"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Function to get random color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ]

  const index = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length || 0
  return colors[index]
}

// Function to get certificate color
const getCertificateColor = (cert: string) => {
  switch (cert) {
    case "CTS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    case "CTS-I":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
    case "CTS-D":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
    case "ANP":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
  }
}

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [activeContactId, setActiveContactId] = useState<string | null>(null)
  const popoverRefs = useRef<(HTMLDivElement | null)[]>([])

  // Directory data state
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [totalProfiles, setTotalProfiles] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch directory data from public_profiles view
  useEffect(() => {
    setLoading(true)
    setError(null)
    getPublicProfiles(debouncedSearchTerm, selectedFilter, currentPage, itemsPerPage)
      .then(({ data, count }) => {
        setProfiles(data)
        setTotalProfiles(count)
        setTotalPages(Math.ceil(count / itemsPerPage))
      })
      .catch((err) => {
        setError("Failed to load directory. Please try again.")
        setProfiles([])
        setTotalProfiles(0)
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [debouncedSearchTerm, selectedFilter, currentPage])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeContactId !== null) {
        const activePopover = popoverRefs.current.find((ref) => ref?.dataset.id === activeContactId)
        const target = event.target as Node

        if (activePopover && !activePopover.contains(target)) {
          // Check if the click was on the contact button (which has its own handler)
          const contactButton = document.getElementById(`contact-btn-${activeContactId}`)
          if (!contactButton?.contains(target)) {
            setActiveContactId(null)
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeContactId])

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Initialize popover refs
  useEffect(() => {
    popoverRefs.current = popoverRefs.current.slice(0, profiles.length)
  }, [profiles.length])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader title="Directory" subtitle="Find professionals and companies" />
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name, role, company..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 ml-1 text-sm text-gray-500 dark:text-gray-400">
          {loading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <>
              Showing {totalProfiles > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, totalProfiles)} of {totalProfiles} professionals
            </>
          )}
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-full mt-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setSelectedFilter("all")
                setCurrentPage(1)
              }}
            >
              Clear filters and try again
            </Button>
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {profiles.map((person: PublicProfile) => (
              <Card
                key={person.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6 relative flex flex-col h-full">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 rounded-full">
                      {person.avatar_url ? (
                        <AvatarImage src={person.avatar_url || "/placeholder.svg"} alt={person.full_name || ""} />
                      ) : (
                        <AvatarFallback className={`${getAvatarColor(person.full_name || "")}`}>
                          {getInitials(person.full_name || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {person.full_name || "Anonymous User"}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {person.designation || "  Professional"}
                      </p>
                      {/* {typeof person.total_points === 'number' && (
                        <span className="inline-block bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full px-3 py-1 text-xs font-semibold mb-1 mt-1">
                          Points: {person.total_points}
                        </span>
                      )} */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Briefcase size={14} className="mr-1" />
                        <span className="truncate">{person.company_name || "Not specified"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">
                          {person.city && person.country
                            ? `${person.city}, ${person.country}`
                            : person.city || person.country || "Location not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-1 flex flex-col justify-end">
                    <div className="flex items-center mb-3">
                      <Award size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certifications</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {person.certifications && person.certifications.length > 0 ? (
                        person.certifications.map((cert: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`${getCertificateColor(cert)} border font-medium`}
                          >
                            {cert}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">No certifications</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 relative">
                      <Button
                        id={`contact-btn-${person.id}`}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setActiveContactId(activeContactId === person.id ? null : person.id)}
                      >
                        <Mail size={14} className="mr-1" />
                        Contact
                      </Button>

                      {activeContactId === person.id && (
                        <div
                          ref={(el) => {
                            if (el) el.dataset.id = person.id
                            popoverRefs.current[profiles.indexOf(person)] = el
                          }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 animate-fadeIn"
                        >
                          <div className="flex gap-2 p-1">
                            {person.social_links && person.social_links.linkedin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                                onClick={() => window.open(person.social_links?.linkedin, "_blank")}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="text-blue-600 dark:text-blue-400"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              </Button>
                            )}
                            {person.social_links && person.social_links.twitter && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/20 hover:bg-sky-200 dark:hover:bg-sky-800/30"
                                onClick={() => window.open(person.social_links?.twitter, "_blank")}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="text-sky-500 dark:text-sky-400"
                                >
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </Button>
                            )}
                            {person.social_links && person.social_links.facebook && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                                onClick={() => window.open(person.social_links?.facebook, "_blank")}
                              >
                                <Facebook size={16} className="text-blue-600 dark:text-blue-400" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No professionals found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setSelectedFilter("all")
                setCurrentPage(1)
              }}
            >
              Clear filters and try again
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
