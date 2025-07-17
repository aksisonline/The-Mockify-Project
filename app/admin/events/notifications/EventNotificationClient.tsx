"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Users, Calendar, MapPin, Mail, Send, Search, Clock } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  category: string
  location: string
  start_date: string
  end_date: string
  status: "pending" | "approved" | "rejected"
  is_featured: boolean
  image_url?: string
}

interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  profiles?: {
    full_name: string
    email: string
    avatar_url?: string
  }
  events?: {
    title: string
    description: string
  }
}

interface EventRegistrations {
  event: Event
  registrations: EventRegistration[]
  stats: {
    total: number
    recent: number
  }
}

export default function EventNotificationClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistrations[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    recentRegistrations: 0
  })

  // Notification states
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [notificationData, setNotificationData] = useState({
    subject: "",
    message: "",
    eventId: "",
    registrationIds: [] as string[]
  })
  const [sendingNotification, setSendingNotification] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Group registrations by event
    const grouped = events.map(event => {
      const eventRegistrations = registrations.filter(r => r.event_id === event.id)
      const stats = {
        total: eventRegistrations.length,
        recent: eventRegistrations.filter(r => {
          const registrationDate = new Date(r.registered_at)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return registrationDate > weekAgo
        }).length
      }
      return { event, registrations: eventRegistrations, stats }
    }).filter(group => group.registrations.length > 0)

    setEventRegistrations(grouped)
  }, [events, registrations])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch events
      const eventsResponse = await fetch('/api/admin/events')
      const eventsData = await eventsResponse.json()
      
      // Fetch event logs (registrations)
      const registrationsResponse = await fetch('/api/admin/event-logs')
      const registrationsData = await registrationsResponse.json()
      
      if (eventsResponse.ok) {
        setEvents(Array.isArray(eventsData) ? eventsData : [])
      } else {
        console.error('Failed to fetch events:', eventsData)
        toast.error('Failed to fetch events')
      }
      
      if (registrationsResponse.ok) {
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : [])
      } else {
        console.error('Failed to fetch registrations:', registrationsData)
        toast.error('Failed to fetch event registrations')
      }
      
      // Calculate stats
      const events = Array.isArray(eventsData) ? eventsData : []
      const registrations = Array.isArray(registrationsData) ? registrationsData : []
      
      const activeEvents = events.filter((e: Event) => e.status === 'approved').length || 0
      const recentRegistrations = registrations.filter((r: EventRegistration) => {
        const registrationDate = new Date(r.registered_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return registrationDate > weekAgo
      }).length || 0
      
      setStats({
        totalEvents: events.length || 0,
        activeEvents,
        totalRegistrations: registrations.length || 0,
        recentRegistrations
      })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch event data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (registrationIds: string[]) => {
    if (selectedRegistrations.size === registrationIds.length) {
      setSelectedRegistrations(new Set())
    } else {
      setSelectedRegistrations(new Set(registrationIds))
    }
  }

  const handleSelectRegistration = (registrationId: string) => {
    const newSelected = new Set(selectedRegistrations)
    if (newSelected.has(registrationId)) {
      newSelected.delete(registrationId)
    } else {
      newSelected.add(registrationId)
    }
    setSelectedRegistrations(newSelected)
  }

  const handleSendNotification = async () => {
    if (!notificationData.subject || !notificationData.message || notificationData.registrationIds.length === 0) {
      toast.error('Please fill in all notification fields and select recipients')
      return
    }

    try {
      setSendingNotification(true)
      const response = await fetch('/api/events/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      if (response.ok) {
        toast.success(`Notification sent to ${notificationData.registrationIds.length} users`)
        setShowNotificationDialog(false)
        setNotificationData({ subject: "", message: "", eventId: "", registrationIds: [] })
        setSelectedRegistrations(new Set())
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setSendingNotification(false)
    }
  }

  const openNotificationDialog = (eventId?: string, registrationIds?: string[]) => {
    setNotificationData({
      subject: "",
      message: "",
      eventId: eventId || "",
      registrationIds: registrationIds || Array.from(selectedRegistrations)
    })
    setShowNotificationDialog(true)
  }

  const getFilteredEventRegistrations = () => {
    return eventRegistrations.filter(group => {
      // Filter by event
      if (selectedEvent !== "all" && group.event.id !== selectedEvent) {
        return false
      }

      // Filter registrations by search
      const filteredRegistrations = group.registrations.filter(registration => {
        const matchesSearch = registration.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             registration.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })

      return filteredRegistrations.length > 0
    }).map(group => ({
      ...group,
      registrations: group.registrations.filter(registration => {
        const matchesSearch = registration.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             registration.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
    }))
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

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const filteredGroups = getFilteredEventRegistrations()

  return (
    <div className="container py-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations">Registrations by Event</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRegistrations.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openNotificationDialog()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Notification ({selectedRegistrations.size})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registrations by Event */}
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No registrations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || selectedEvent !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "No event registrations have been made yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <Card key={group.event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {group.event.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {group.event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(group.event.start_date)}
                          </span>
                          <Badge variant="outline">{group.stats.total} registrations</Badge>
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => openNotificationDialog(group.event.id, group.registrations.map(r => r.id))}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Notify All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={group.registrations.every(r => selectedRegistrations.has(r.id))}
                            onCheckedChange={() => handleSelectAll(group.registrations.map(r => r.id))}
                          />
                          <span className="text-sm font-medium">Select All</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {group.registrations.length} participants
                        </span>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Participant</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.registrations.map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRegistrations.has(registration.id)}
                                  onCheckedChange={() => handleSelectRegistration(registration.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={registration.profiles?.avatar_url} />
                                    <AvatarFallback>
                                      {registration.profiles?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{registration.profiles?.full_name || 'Unknown User'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">{registration.profiles?.email}</span>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{formatDate(registration.registered_at)}</div>
                                  <div className="text-muted-foreground">
                                    {getTimeAgo(new Date(registration.registered_at))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openNotificationDialog(group.event.id, [registration.id])}
                                  className="gap-2"
                                >
                                  <Mail className="h-4 w-4" />
                                  Notify
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Event Notification</DialogTitle>
            <DialogDescription>
              Send a notification to {notificationData.registrationIds.length} selected participants
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter notification subject..."
                value={notificationData.subject}
                onChange={(e) => setNotificationData({ ...notificationData, subject: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message..."
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={sendingNotification}>
              {sendingNotification ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 