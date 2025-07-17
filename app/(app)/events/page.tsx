"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, AlertCircle, RefreshCw, ArrowRight, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import ContentWrapper from "@/components/ContentWrapper"
import Link from "next/link"
import { motion } from "framer-motion"
import AppHeader from "@/components/ui/AppHeader"
import { toast } from "sonner"
import { Content } from "next/font/google"

interface Event {
  id: string
  title: string
  description: string
  content: string
  image_url: string
  start_date: string
  end_date: string
  location: string
  category: string
  registration_url: string
  is_featured: boolean
}

const categoryColors: Record<string, string> = {
  Conference: "from-blue-600 to-blue-800",
  Workshop: "from-green-500 to-green-700",
  Masterclass: "from-purple-500 to-purple-700",
  Bootcamp: "from-orange-500 to-orange-700",
  Certification: "from-red-500 to-red-700",
  Festival: "from-pink-500 to-pink-700",
  Seminar: "from-indigo-500 to-indigo-700",
}

const categoryIcons: Record<string, string> = {
  Conference: "🎤",
  Workshop: "🛠️",
  Masterclass: "🎓",
  Bootcamp: "💻",
  Certification: "📜",
  Festival: "🎭",
  Seminar: "📚",
}

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()
  const [applyingEventId, setApplyingEventId] = useState<string | null>(null)

  const categories = [
    "all",
    "Conference",
    "Workshop",
    "Masterclass",
    "Bootcamp",
    "Certification",
    "Festival",
    "Seminar",
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedCategory === "all") {
      setEvents(allEvents)
    } else {
      setEvents(allEvents.filter((event) => event.category === selectedCategory))
    }
  }, [selectedCategory, allEvents])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = selectedCategory === "all" ? "/api/events" : `/api/events?category=${selectedCategory}`


      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })


      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)

        // Try to parse as JSON first
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || errorJson.details || `HTTP ${response.status}`)
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      const data = await response.json()


      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data)
        throw new Error("Invalid data format received")
      }

      setAllEvents(data)
      setEvents(data)
    } catch (err) {
      console.error("Error fetching events:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error(`Failed to load events: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Date TBD"
    }
  }

  const featuredEvents = events.filter((event) => event.is_featured)

  const handleApply = async (event: Event) => {
    setApplyingEventId(event.id)
    try {
      const res = await fetch("/api/events/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || "Failed to register for event.")
        setApplyingEventId(null)
        return
      }
      
      // Ensure the registration URL has a proper protocol
      let registrationUrl = event.registration_url
      if (registrationUrl && !registrationUrl.startsWith('http://') && !registrationUrl.startsWith('https://')) {
        registrationUrl = `https://${registrationUrl}`
      }
      
      // Open registration_url in a new tab/window
      if (registrationUrl) {
        window.open(registrationUrl, '_blank', 'noopener,noreferrer')
        
        if (data.alreadyRegistered) {
          toast.info("You are already registered for this event! Opening event link...")
        } else {
          toast.success("Registration successful! Opening event link...")
        }
      } else {
        if (data.alreadyRegistered) {
          toast.info("You are already registered for this event, but no registration link is available.")
        } else {
          toast.error("Registration successful, but no registration link is available for this event.")
        }
      }
    } catch (err) {
      toast.error("Failed to register for event.")
      setApplyingEventId(null)
    } finally {
      setApplyingEventId(null)
    }
  }

  const handleEventClick = (event: Event) => {
    if (typeof window !== "undefined") {
      window.history.pushState({ event }, '', `/events/${event.id}`)
    }
    router.push(`/events/${event.id}`)
  }

  const handleShare = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/events/${event.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: url,
        })
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        await copyToClipboard(url)
      }
    } else {
      // Fallback to clipboard copy
      await copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Event link copied to clipboard!")
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        toast.success("Event link copied to clipboard!")
      } catch (fallbackErr) {
        toast.error("Failed to copy link")
      }
      document.body.removeChild(textArea)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-8">
        <ContentWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 relative mb-8">
                <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Events...</h2>
              <p className="text-gray-600 text-lg">Connecting to database and fetching events</p>
            </div>
          </div>
        </ContentWrapper>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-8">
        <ContentWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 flex items-center justify-center bg-red-100 rounded-full mb-8">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Unable to Load Events</h1>

              <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <strong>Error:</strong> {error}
                </div>
              </div>

              {debugInfo && (
                <div className="mb-8 max-w-2xl mx-auto w-full">
                  <details className="bg-gray-50 p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium">Debug Information</summary>
                    <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                  </details>
                </div>
              )}

              <Button onClick={() => {
                toast.info("Reloading events...")
                fetchEvents()
              }} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </ContentWrapper>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <ContentWrapper>
      <AppHeader title="Events" subtitle="Discover and join upcoming   events" />
      
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white overflow-hidden rounded-3xl mb-12">
        {/* Use a dynamic background image if available, otherwise use gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Discover Extraordinary Events</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              Connect with industry experts, enhance your skills, and expand your network through our exclusive events
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50">
                Browse All Events
              </Button>
              <Button size="lg" variant="outline" className="text-blue-800 border-white hover:bg-blue-800 hover:text-white" onClick={() => router.push('/events/post-event')}>
                Submit Your Event
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-16 -right-16 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-blue-500 rounded-full opacity-20"></div>
        <div className="absolute top-12 right-12 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-indigo-500 rounded-full opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats and filters row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
            <p className="text-gray-600">
              Showing {events.length} of {allEvents.length} events
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 sm:h-8 bg-yellow-400 rounded-full mr-2"></span>
                Featured Events
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {featuredEvents.slice(0, 2).map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl bg-white"
                >
                  <div onClick={() => handleEventClick(event)} className="block w-full text-left cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                    <img
                      src={event.image_url || "/placeholder.svg?height=400&width=600&query=event"}
                      alt={event.title}
                      className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=400&width=600&query=event";
                      }}
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 px-3 py-1">
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
                      <Badge
                        className={`bg-gradient-to-r ${
                          categoryColors[event.category] || "from-gray-600 to-gray-800"
                        } text-white border-0 mb-3 px-3 py-1`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{categoryIcons[event.category]}</span>
                          {event.category}
                        </div>
                      </Badge>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-200 mb-4 line-clamp-2 text-sm sm:text-base">{event.description}</p>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-4 text-gray-300 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.start_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(event)
                          }}
                          className="bg-white text-blue-800 hover:bg-gray-100 text-xs sm:text-sm"
                          disabled={applyingEventId === event.id}
                          size="sm"
                        >
                          {applyingEventId === event.id ? (
                            "Registering..."
                          ) : (
                            <span className="flex items-center gap-1 sm:gap-2">
                              Register
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-transparent border-white text-white hover:bg-white/20 text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          size="sm"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        
        <div className="flex flex-wrap gap-4 my-4 mb-8">
              <Button size="lg" variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white" onClick={() => router.push('/events/post-event')}>
                Submit Your Event
              </Button>
        </div>

        {/* Category Tabs */}
        <section className="">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <span className="inline-block w-1.5 h-6 sm:h-8 bg-blue-600 rounded-full mr-2"></span>
              Browse Events
            </h2>
          </div>

          <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full">
            <TabsContent value={selectedCategory} className="mt-0">
              {events.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {selectedCategory === "all"
                      ? "There are no events currently scheduled."
                      : `There are no ${selectedCategory} events currently scheduled.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {events.map((event) => (
                    <motion.div key={event.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-gray-200 bg-white">
                        <div onClick={() => handleEventClick(event)} className="block w-full text-left cursor-pointer">
                          <div className="relative overflow-hidden">
                            <img
                              src={event.image_url || "/placeholder.svg?height=300&width=400&query=event"}
                              alt={event.title}
                              className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg?height=300&width=400&query=event";
                              }}
                            />
                            <div className="absolute top-4 left-4">
                              <Badge
                                className={`bg-gradient-to-r ${
                                  categoryColors[event.category] || "from-gray-600 to-gray-800"
                                } text-white border-0 px-3 py-1`}
                              >
                                <div className="flex items-center gap-1">
                                  <span>{categoryIcons[event.category]}</span>
                                  {event.category}
                                </div>
                              </Badge>
                            </div>
                            {event.is_featured && (
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 px-3 py-1">
                                  Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <CardHeader className="pb-2">
                          <div onClick={() => handleEventClick(event)} className="block w-full text-left cursor-pointer">
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </CardTitle>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-4 flex-grow">
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{event.description}</p>
                          <div className="flex flex-col gap-2 text-gray-500 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              {formatDate(event.start_date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              {event.location}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-0 flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(event)
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                            disabled={applyingEventId === event.id}
                            size="sm"
                          >
                            {applyingEventId === event.id ? "Registering..." : (
                              <span className="flex items-center gap-1 sm:gap-2">
                                Register
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                              </span>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-200 text-xs sm:text-sm" 
                            onClick={(e) => handleShare(event, e)}
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Share
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
      </ContentWrapper>
    </div>
  )
}
