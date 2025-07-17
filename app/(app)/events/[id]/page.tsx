"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ContentWrapper from "@/components/ContentWrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Share2, ArrowLeft, ExternalLink, AlertCircle, User, Users } from "lucide-react"
import Link from "next/link"
import { fetchEventById, fetchEvents, Event } from "@/lib/eventsApi"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/components/ui/use-mobile"
import { toast } from "sonner"

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

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applyingEventId, setApplyingEventId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchEvents()
  }, [eventId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/events", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || errorJson.details || `HTTP ${response.status}`)
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received")
      }
      setAllEvents(data)
      const foundEvent = data.find((e: Event) => e.id === eventId)
      setEvent(foundEvent || null)
      if (foundEvent) {
        // Related events: same category, not this event
        setRelatedEvents(data.filter((e: Event) => e.category === foundEvent.category && e.id !== foundEvent.id).slice(0, 3))
      } else {
        setRelatedEvents([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
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

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || "Event",
          text: event?.description || "Check out this event!",
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
      // fallback: select and copy
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
      <div className="min-h-screen bg-white">
        <ContentWrapper>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 relative mb-8">
                <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Event Details...</h2>
              <p className="text-gray-600 text-lg">Retrieving information</p>
            </div>
          </div>
        </ContentWrapper>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <ContentWrapper>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 flex items-center justify-center bg-red-100 rounded-full mb-8">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Not Found</h1>

              <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <strong>Error:</strong> {error || "The requested event could not be found."}
                </div>
              </div>

              <Button onClick={() => router.push("/events")} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </div>
          </div>
        </ContentWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <ContentWrapper>
        {/* Back button */}
        <div className="max-w-7xl mx-auto pt-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/events")}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>

        {/* Event Header */}
        <div className="relative w-full bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white overflow-hidden rounded-3xl mb-12">
          {/* Use the actual event image as background if available */}
          {event.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${event.image_url})` }}
            ></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <Badge
                  className={`bg-gradient-to-r ${
                    categoryColors[event.category] || "from-gray-600 to-gray-800"
                  } text-white border-0 mb-4 px-3 py-1`}
                >
                  <div className="flex items-center gap-1">
                    <span>{categoryIcons[event.category]}</span>
                    {event.category}
                  </div>
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{event.title}</h1>

                <p className="text-xl text-blue-100 mb-8 leading-relaxed">{event.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <Calendar className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-blue-200">Date</p>
                      <p className="font-medium">{formatDate(event.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <MapPin className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-blue-200">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <Clock className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-blue-200">Duration</p>
                      <p className="font-medium">
                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <Users className="h-5 w-5 text-blue-300" />
                    <div>
                      <p className="text-sm text-blue-200">Capacity</p>
                      <p className="font-medium">Limited Seats</p>
                    </div>
                  </div> */}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => handleApply(event)}
                    disabled={applyingEventId === event.id}
                    className="bg-white text-blue-800 hover:bg-blue-50"
                  >
                    {applyingEventId === event.id ? (
                      "Registering..."
                    ) : (
                      <span className="flex items-center gap-2">
                        Register Now
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white bg-white/10 border-white hover:bg-blue-500 hover:text-white "
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                </div>
              </div>

              <div className="md:w-1/3 flex items-center justify-center">
                <img
                  src={event.image_url || "/placeholder.svg?height=400&width=400&query=event"}
                  alt={event.title}
                  className="rounded-xl shadow-2xl max-h-80 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=400&width=400&query=event";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500 rounded-full opacity-20"></div>
          <div className="absolute top-12 right-12 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">About This Event</h2>

                  <div className="prose max-w-none text-gray-700">
                    {event.content ? (
                      <div dangerouslySetInnerHTML={{ __html: event.content }} />
                    ) : (
                      <p>{event.description}</p>
                    )}

                    {/* Sample content if event.content is empty */}
                    {!event.content && (
                      <>
                        <p>
                          Join us for this exciting {event.category.toLowerCase()} where you'll have the opportunity to
                          learn from industry experts and network with peers.
                        </p>

                        <h3>What You'll Learn</h3>
                        <ul>
                          <li>Latest trends and best practices in the field</li>
                          <li>Hands-on experience with cutting-edge technologies</li>
                          <li>Networking opportunities with industry leaders</li>
                          <li>Practical skills you can apply immediately</li>
                        </ul>

                        <h3>Who Should Attend</h3>
                        <p>
                          This event is perfect for professionals looking to advance their careers, students interested
                          in the field, and anyone passionate about learning and growth.
                        </p>

                        <h3>Schedule</h3>
                        <p>
                          The event will begin at 9:00 AM and conclude at 5:00 PM. A detailed schedule will be provided
                          to registered attendees.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Organizer Information */}
              {/* <Card className="bg-white border-0 shadow-sm overflow-hidden mt-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Organizer</h2>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Mockify Organization</h3>
                      <p className="text-gray-600">Leading provider of professional development events</p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        View Organizer Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Sidebar */}
            <div>
              {/* Event Details Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden mb-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Event Details</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Date and Time</p>
                        <p className="text-gray-600">{formatDate(event.start_date)}</p>
                        <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-blue-600"
                          onClick={() => window.open(`https://www.google.com/maps/search/${event.location.replace(/\s+/g, '+')}`, '_blank')}
                        >
                          View on map
                        </Button>
                      </div>
                    </div>

                    {/* <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-gray-600">Limited to 100 attendees</p>
                      </div>
                    </div> */}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleApply(event)}
                      disabled={applyingEventId === event.id}
                    >
                      {applyingEventId === event.id ? "Registering..." : "Register Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Related Events</h3>

                    <div className="space-y-4">
                      {relatedEvents.map((relatedEvent) => (
                        <Link href={`/events/${relatedEvent.id}`} key={relatedEvent.id} className="block group">
                          <div className="flex gap-3">
                            <img
                              src={relatedEvent.image_url || "/placeholder.svg?height=80&width=80&query=event"}
                              alt={relatedEvent.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {relatedEvent.title}
                              </h4>
                              <p className="text-sm text-gray-600">{formatDate(relatedEvent.start_date)}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" className="w-full" onClick={() => router.push("/events")}>
                        View All Events
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ContentWrapper>
    </div>
  )
}
