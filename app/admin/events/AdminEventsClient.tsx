"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import AddEventForm from "./AddEventForm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye,
  Plus,
  AlertTriangle,
  Mail,
  Edit
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  created_at: string;
  image_url?: string;
  requested_by?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface EventLog {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  events?: {
    title: string;
    description: string;
  };
}

export default function AdminEventsClient() {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Calculate registration insights
  const registrationStats = useMemo(() => {
    const totalRegistrations = eventLogs.length;
    const uniqueUsers = new Set(eventLogs.map(log => log.user_id)).size;
    const registrationsByEvent = eventLogs.reduce((acc, log) => {
      const eventId = log.event_id;
      acc[eventId] = (acc[eventId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topEvents = Object.entries(registrationsByEvent)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([eventId, count]) => {
        const event = allEvents.find(e => e.id === eventId);
        return {
          eventId,
          title: event?.title || 'Unknown Event',
          registrations: count
        };
      });

    const recentRegistrations = eventLogs
      .filter(log => new Date(log.registered_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .length;

    return {
      totalRegistrations,
      uniqueUsers,
      registrationsByEvent,
      topEvents,
      recentRegistrations
    };
  }, [eventLogs, allEvents]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      if (!Array.isArray(data)) throw new Error("Invalid data format");
      setAllEvents(data);
      setPendingEvents(data.filter((e: Event) => e.status === "pending"));
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/event-logs");
      const data = await res.json();
      setEventLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch event logs:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchEventLogs();
  }, [fetchEvents, fetchEventLogs]);

  const handleEventAdded = () => {
    fetchEvents();
    fetchEventLogs();
    setShowAddDialog(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        toast.success("Event deleted successfully");
        fetchEvents();
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleAction = async (eventId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || "Failed to update event status");
      
      toast.success(`Event ${status === "approved" ? "approved" : "rejected"} successfully`);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update event status");
    }
  };

  const handleToggleFeatured = async (eventId: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: isFeatured }),
      });
      
      if (!res.ok) throw new Error("Failed to update featured status");
      
      toast.success(`Event ${isFeatured ? "featured" : "unfeatured"} successfully`);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured status");
    }
  };

  const viewEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditDialog(true);
  };

  const handleUpdateEvent = async (formData: any) => {
    if (!editingEvent) return;
    
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success("Event updated successfully");
        setShowEditDialog(false);
        setEditingEvent(null);
        fetchEvents();
      } else {
        throw new Error("Failed to update event");
      }
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'conference': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'seminar': 'bg-purple-100 text-purple-800',
      'meetup': 'bg-orange-100 text-orange-800',
      'training': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const approvedEvents = allEvents.filter(event => event.status === 'approved');
  const totalEvents = allEvents.length;
  const featuredEvents = approvedEvents.filter(event => event.is_featured).length;

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage events, approve requests, and track activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/admin/events/notifications', '_blank')}>
            <Mail className="h-4 w-4 mr-2" />
            Event Notifications
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event for the platform.
                </DialogDescription>
              </DialogHeader>
              <AddEventForm onEventAdded={handleEventAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{featuredEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{registrationStats.totalRegistrations}</p>
                <p className="text-xs text-muted-foreground">{registrationStats.uniqueUsers} unique users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Registration Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Top Events by Registrations
            </CardTitle>
            <CardDescription>
              Events with the highest registration counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationStats.topEvents.length > 0 ? (
              <div className="space-y-4">
                {registrationStats.topEvents.map((event, index) => (
                  <div key={event.eventId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.registrations} registrations</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.registrations}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No registrations yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Recent Registration Activity
            </CardTitle>
            <CardDescription>
              Registration activity in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Recent Registrations</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{registrationStats.recentRegistrations}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{registrationStats.totalRegistrations}</p>
                  <p className="text-xs text-muted-foreground">Total Registrations</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{registrationStats.uniqueUsers}</p>
                  <p className="text-xs text-muted-foreground">Unique Users</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Events */}
      {pendingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Pending Event Requests
            </CardTitle>
            <CardDescription>
              Events waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <Card key={event.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          {event.image_url && (
                            <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=64&width=80&query=event";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{event.title}</h3>
                              <Badge className={getCategoryColor(event.category)}>
                                {event.category}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground mb-4">{event.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {event.requested_by && (
                          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Requested by: {event.requested_by.full_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleAction(event.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(event.id, "rejected")}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Events</CardTitle>
          <CardDescription>
            All approved events with management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading events...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={event.image_url || "/placeholder.svg?height=48&width=64&query=event"}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg?height=48&width=64&query=event";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(event.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(event.end_date).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {registrationStats.registrationsByEvent[event.id] || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.status)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={!!event.is_featured}
                          onCheckedChange={(checked) => handleToggleFeatured(event.id, checked)}
                          aria-label="Toggle featured"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewEventDetails(event)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Recent Event Registrations
          </CardTitle>
          <CardDescription>
            Latest event registration activity from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Time Ago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {log.profiles?.full_name?.charAt(0) || log.profiles?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">{log.profiles?.full_name || 'Unknown User'}</span>
                          <p className="text-xs text-muted-foreground">{log.profiles?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{log.events?.title || 'Unknown Event'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.registered_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(new Date(log.registered_at))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected event
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Hero Image */}
              {selectedEvent.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=192&width=400&query=event";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                  {getStatusBadge(selectedEvent.status)}
                  {selectedEvent.is_featured && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Star className="h-3 w-3 mr-1" />Featured
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {new Date(selectedEvent.start_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>End: {new Date(selectedEvent.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedEvent.created_at).toLocaleString()}
                    </div>
                    {selectedEvent.requested_by && (
                      <div>
                        <span className="font-medium">Requested by:</span> {selectedEvent.requested_by.full_name}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Registrations:</span> {registrationStats.registrationsByEvent[selectedEvent.id] || 0} users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details below.
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <AddEventForm 
              onEventAdded={handleUpdateEvent} 
              initialData={editingEvent}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 