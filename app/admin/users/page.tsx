"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, User, Mail, Phone, Calendar, Crown, Eye, Filter, CheckCircle, Circle } from "lucide-react"
import { BulkEmailComposer } from "@/components/admin/bulk-email-composer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  phone_code?: string
  phone_number?: string
  phone?: string
  is_admin: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  avc_id?: string
  has_business_card?: boolean
  dob?: string
  gender?: string
  last_login?: string
  // Public profile data
  company?: string
  job_title?: string
  location?: string
  country?: string
  total_points?: number
  certifications?: string[]
  social_links?: Record<string, string>
  // Profile completion data
  profile_completion?: {
    completion_percentage: number
    basic_details: boolean
    employment: boolean
    certifications: boolean
    address: boolean
    social_links: boolean
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAdmin, setFilterAdmin] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [profileCompletionFilter, setProfileCompletionFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, filterAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?search=${searchTerm}`)
      const data = await response.json()
      
      if (response.ok) {
        let filteredUsers = data.users || []
        
        // Apply admin filter
        if (filterAdmin === "admin") {
          filteredUsers = filteredUsers.filter((user: User) => user.is_admin)
        } else if (filterAdmin === "user") {
          filteredUsers = filteredUsers.filter((user: User) => !user.is_admin)
        }
        
        setUsers(filteredUsers)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const getStatusBadge = (user: User) => {
    if (user.is_admin) {
      return <Badge variant="default" className="bg-purple-600"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    return <Badge variant="secondary">User</Badge>
  }

  const getBusinessCardBadge = (user: User) => {
    if (user.has_business_card) {
      return <Badge variant="outline" className="text-green-600 border-green-600">Business Card</Badge>
    }
    return <Badge variant="outline" className="text-gray-500">No Business Card</Badge>
  }

  const getProfileCompletionBadge = (user: User) => {
    if (!user.profile_completion) {
      return <Badge variant="outline" className="text-gray-500">No Data</Badge>
    }
    
    const percentage = user.profile_completion.completion_percentage
    if (percentage === 100) {
      return <Badge variant="outline" className="text-green-600 border-green-600">{percentage}%</Badge>
    } else if (percentage >= 60) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">{percentage}%</Badge>
    } else {
      return <Badge variant="outline" className="text-red-600 border-red-600">{percentage}%</Badge>
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.avc_id?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by profile completion
    let matchesCompletion = true
    if (profileCompletionFilter === "incomplete") {
      // Check if user has incomplete profile using profile completion data
      matchesCompletion = !user.profile_completion || user.profile_completion.completion_percentage < 100
    } else if (profileCompletionFilter === "complete") {
      // Check if user has complete profile using profile completion data
      matchesCompletion = user.profile_completion?.completion_percentage === 100
    }

    return matchesSearch && matchesCompletion
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all registered users and their profiles</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <BulkEmailComposer users={users} onRefresh={fetchUsers} />
          <div className="text-center sm:text-right">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or AVC ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">User Type</label>
              <select
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Profile Status</label>
              <Select value={profileCompletionFilter} onValueChange={setProfileCompletionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="complete">Complete Profiles</SelectItem>
                  <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Complete list of registered users with their profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                          {(user.full_name || user.email || "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.avc_id && (
                          <div className="text-xs text-muted-foreground">ID: {user.avc_id}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(user)}
                      {getProfileCompletionBadge(user)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Contact</div>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Professional</div>
                      {user.company && <div className="truncate">{user.company}</div>}
                      {user.job_title && <div className="text-muted-foreground truncate">{user.job_title}</div>}
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Points</div>
                      <div>{user.total_points !== undefined ? user.total_points : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Joined</div>
                      <div className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    {getBusinessCardBadge(user)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewUserDetails(user)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete profile information for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-16 w-16 self-center sm:self-start">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                    {(selectedUser.full_name || selectedUser.email || "U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || 'No Name'}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    {getStatusBadge(selectedUser)}
                    {getBusinessCardBadge(selectedUser)}
                    {getProfileCompletionBadge(selectedUser)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="break-all">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedUser.location}{selectedUser.country && `, ${selectedUser.country}`}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Professional Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedUser.company && (
                      <div>
                        <span className="font-medium">Company:</span> {selectedUser.company}
                      </div>
                    )}
                    {selectedUser.job_title && (
                      <div>
                        <span className="font-medium">Job Title:</span> {selectedUser.job_title}
                      </div>
                    )}
                    {selectedUser.avc_id && (
                      <div>
                        <span className="font-medium">AVC ID:</span> {selectedUser.avc_id}
                      </div>
                    )}
                    {selectedUser.total_points !== undefined && (
                      <div>
                        <span className="font-medium">Total Points:</span> {selectedUser.total_points}
                      </div>
                    )}
                    {selectedUser.profile_completion && (
                      <div>
                        <span className="font-medium">Profile Completion:</span> {selectedUser.profile_completion.completion_percentage}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {selectedUser.certifications && selectedUser.certifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {selectedUser.social_links && Object.keys(selectedUser.social_links).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Social Links</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedUser.social_links).map(([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="font-medium capitalize">{platform}:</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">User ID:</span> <span className="break-all">{selectedUser.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedUser.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(selectedUser.updated_at).toLocaleString()}
                    </div>
                    {selectedUser.last_login && (
                      <div>
                        <span className="font-medium">Last Login:</span> {new Date(selectedUser.last_login).toLocaleString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Profile Public:</span> {selectedUser.is_public ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion Details */}
              {selectedUser.profile_completion && (
                <div>
                  <h4 className="font-medium mb-2">Profile Completion Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedUser.profile_completion.basic_details ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span>Basic Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.profile_completion.employment ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span>Employment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.profile_completion.certifications ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span>Certifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.profile_completion.address ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span>Address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.profile_completion.social_links ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span>Social Links</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 