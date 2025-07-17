"use client"

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  Users, 
  Filter, 
  Eye, 
  Settings, 
  Calendar,
  Building,
  MapPin,
  Search,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  // Direct fields from admin users page
  company?: string
  job_title?: string
  location?: string
  country?: string
  // Employment array (for backward compatibility)
  employment?: Array<{
    company_name?: string
    designation?: string
    location?: string
  }>
  profile_completion?: {
    completion_percentage: number
    basic_details: boolean
    employment: boolean
    certifications: boolean
    address: boolean
    social_links: boolean
  }
}

interface BulkEmailComposerProps {
  users: User[]
  onRefresh?: () => void
}

interface EmailFilters {
  adminFilter: string
  searchTerm: string
  company: string
  location: string
  profileCompletion: string
  dateRange: {
    from: string
    to: string
  }
}

export function BulkEmailComposer({ users, onRefresh }: BulkEmailComposerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('compose')
  const [isSending, setIsSending] = useState(false)
  
  // Email composition state
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [recipientType, setRecipientType] = useState<'all' | 'filtered' | 'selected'>('all')
  
  // Filtering state
  const [filters, setFilters] = useState<EmailFilters>({
    adminFilter: 'all',
    searchTerm: '',
    company: '',
    location: '',
    profileCompletion: 'all',
    dateRange: {
      from: '',
      to: ''
    }
  })
  
  // Selected users state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedUserSearch, setSelectedUserSearch] = useState('')
  
  // Preview state
  const [previewEmail, setPreviewEmail] = useState('')

  // Get filtered users based on current filters
  const getFilteredUsers = useCallback(() => {
    let filteredUsers = users

    if (recipientType === 'selected') {
      return users.filter(user => selectedUserIds.includes(user.id))
    }

    if (recipientType === 'filtered') {
      if (filters.adminFilter === 'admin') {
        filteredUsers = filteredUsers.filter(user => user.is_admin)
      } else if (filters.adminFilter === 'user') {
        filteredUsers = filteredUsers.filter(user => !user.is_admin)
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredUsers = filteredUsers.filter(user => 
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }

      if (filters.company) {
        filteredUsers = filteredUsers.filter(user => 
          user.company?.toLowerCase().includes(filters.company.toLowerCase()) ||
          user.employment?.some(e => e.company_name?.toLowerCase().includes(filters.company.toLowerCase()))
        )
      }

      if (filters.location) {
        filteredUsers = filteredUsers.filter(user => 
          user.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
          user.employment?.some(e => e.location?.toLowerCase().includes(filters.location.toLowerCase()))
        )
      }

      if (filters.profileCompletion) {
        if (filters.profileCompletion === 'completed') {
          filteredUsers = filteredUsers.filter(user => 
            user.profile_completion?.completion_percentage === 100
          )
        } else if (filters.profileCompletion === 'incomplete') {
          filteredUsers = filteredUsers.filter(user => 
            !user.profile_completion || user.profile_completion.completion_percentage < 100
          )
        }
      }

      if (filters.dateRange.from) {
        filteredUsers = filteredUsers.filter(user => 
          new Date(user.created_at) >= new Date(filters.dateRange.from)
        )
      }

      if (filters.dateRange.to) {
        filteredUsers = filteredUsers.filter(user => 
          new Date(user.created_at) <= new Date(filters.dateRange.to)
        )
      }
    }

    return filteredUsers
  }, [users, recipientType, filters, selectedUserIds])

  // Get users for selection (with search)
  const getSelectableUsers = useCallback(() => {
    if (!selectedUserSearch) return users

    const searchLower = selectedUserSearch.toLowerCase()
    return users.filter(user => 
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.company?.toLowerCase().includes(searchLower) ||
      user.job_title?.toLowerCase().includes(searchLower) ||
      user.location?.toLowerCase().includes(searchLower) ||
      user.employment?.some(e => e.company_name?.toLowerCase().includes(searchLower)) ||
      user.employment?.some(e => e.location?.toLowerCase().includes(searchLower))
    )
  }, [users, selectedUserSearch])

  const filteredUsers = getFilteredUsers()
  const selectableUsers = getSelectableUsers()

  // Handle user selection
  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (recipientType === 'selected') {
      setSelectedUserIds(checked ? selectableUsers.map(user => user.id) : [])
    } else {
      setSelectedUserIds(checked ? users.map(user => user.id) : [])
    }
  }

  // Generate email preview with sample data
  const generatePreview = () => {
    if (!htmlContent) {
      setPreviewEmail('')
      return
    }

    // Use first filtered user as sample data
    const sampleUser = filteredUsers[0]
    if (!sampleUser) {
      setPreviewEmail(htmlContent)
      return
    }

    let processedBody = htmlContent
    
    // Replace common variables
    const variables = {
      '{{name}}': sampleUser.full_name || 'User',
      '{{email}}': sampleUser.email,
      '{{company}}': sampleUser.company || sampleUser.employment?.find(e => e.company_name)?.company_name || 'N/A',
      '{{jobTitle}}': sampleUser.job_title || sampleUser.employment?.find(e => e.designation)?.designation || 'N/A',
      '{{location}}': sampleUser.location || sampleUser.employment?.find(e => e.location)?.location || 'N/A',
      '{{joinDate}}': new Date(sampleUser.created_at).toLocaleDateString(),
      '{{userId}}': sampleUser.id,
      '{{isAdmin}}': sampleUser.is_admin ? 'Yes' : 'No',
      '{{profileCompletion}}': sampleUser.profile_completion?.completion_percentage.toString() + '%'
    }

    Object.entries(variables).forEach(([key, value]) => {
      processedBody = processedBody.replace(new RegExp(key, 'g'), value)
    })

    const processedSubject = subject || 'No Subject'
    const currentYear = new Date().getFullYear()

    // Show the full template in preview so users can see exactly how it will look
    const preview = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${processedSubject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: block;
          margin: 0 auto 16px auto;
          max-width: 220px;
          height: 60px;
          object-fit: contain;
        }
        .content {
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
        }
        @media print {
          html, body {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box;
            background: #fff !important;
          }
          .header, .footer, .content {
            page-break-inside: avoid;
          }
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://api.mockify.vercel.app/uploads/mockify-logo.png" alt="Mockify Logo" class="logo" />
        <h1>${processedSubject}</h1>
      </div>

      <div class="content">
        ${processedBody}
      </div>

      <div class="footer">
        <p>© ${currentYear} Mockify. All rights reserved.</p>
      </div>
    </body>
    </html>`

    setPreviewEmail(preview)
  }

  // Send bulk email
  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast.error('Please enter an email subject')
      return
    }

    if (!htmlContent.trim()) {
      toast.error('Please enter email content')
      return
    }

    if (filteredUsers.length === 0) {
      toast.error('No users selected or found matching criteria')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/admin/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          htmlContent,
          recipientType,
          filters: recipientType === 'filtered' ? filters : 
                   recipientType === 'selected' ? { selectedUserIds } : {}
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Email sent successfully to ${result.recipientCount} users`)
        setIsOpen(false)
        // Reset form
        setSubject('')
        setHtmlContent('')
        setRecipientType('all')
        setFilters({
          adminFilter: 'all',
          searchTerm: '',
          company: '',
          location: '',
          profileCompletion: 'all',
          dateRange: { from: '', to: '' }
        })
        setSelectedUserIds([])
        setSelectedUserSearch('')
        onRefresh?.()
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending bulk email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Mail className="h-4 w-4 mr-2" />
          Bulk Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email Composer
          </DialogTitle>
          <DialogDescription>
            Send emails to multiple users with advanced filtering and personalization
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="recipients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recipients ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Recipient Type</Label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Users ({users.length})</option>
                  <option value="filtered">Filtered Users</option>
                  <option value="selected">Selected Users</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Email Content *</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={htmlContent}
                  onChange={setHtmlContent}
                  placeholder="Compose your email content here..."
                  className="min-h-[400px]"
                />
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Available Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <code className="bg-white px-2 py-1 rounded">{'{{name}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{email}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{company}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{jobTitle}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{location}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{joinDate}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{isAdmin}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{profileCompletion}}'}</code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="space-y-4">
            {recipientType === 'filtered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="admin-filter">User Type</Label>
                      <select
                        id="admin-filter"
                        value={filters.adminFilter}
                        onChange={(e) => setFilters(prev => ({ ...prev, adminFilter: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="all">All Users</option>
                        <option value="admin">Admins Only</option>
                        <option value="user">Regular Users</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="search-term">Search</Label>
                      <Input
                        id="search-term"
                        placeholder="Name or email..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-filter">Company</Label>
                      <Input
                        id="company-filter"
                        placeholder="Company name..."
                        value={filters.company}
                        onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-filter">Location</Label>
                      <Input
                        id="location-filter"
                        placeholder="Location..."
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-completion">Profile Completion</Label>
                      <select
                        id="profile-completion"
                        value={filters.profileCompletion}
                        onChange={(e) => setFilters(prev => ({ ...prev, profileCompletion: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="all">All Profiles</option>
                        <option value="completed">Completed Profiles</option>
                        <option value="incomplete">Incomplete Profiles</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date-from">Joined From</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, from: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to">Joined To</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, to: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {recipientType === 'selected' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Select Users ({selectedUserIds.length} selected)
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedUserIds.length === selectableUsers.length && selectableUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      Select All ({selectableUsers.length})
                    </Label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search users by name, email, company, or location..."
                        value={selectedUserSearch}
                        onChange={(e) => setSelectedUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Recipients Preview ({filteredUsers.length} users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-2">
                    {(recipientType === 'selected' ? selectableUsers : filteredUsers).slice(0, 50).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-3">
                          {recipientType === 'selected' && (
                            <Checkbox
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">{user.full_name || 'No Name'}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                            {user.employment?.find(e => e.company_name) && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {user.employment.find(e => e.company_name)?.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.is_admin && (
                            <Badge variant="default" className="text-xs">Admin</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {new Date(user.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(recipientType === 'selected' ? selectableUsers : filteredUsers).length > 50 && (
                      <div className="text-center text-sm text-muted-foreground p-2">
                        ... and {(recipientType === 'selected' ? selectableUsers : filteredUsers).length - 50} more users
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Preview with sample data from {filteredUsers[0]?.full_name || 'first user'} (template shown in preview, applied on backend)
                </p>
              </div>
              <Button onClick={generatePreview} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Refresh Preview
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Subject: {subject || 'No subject'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded p-4 bg-white min-h-[500px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: previewEmail || htmlContent || 'No content' }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Ready to Send
                </CardTitle>
                <CardDescription>
                  Review your email details before sending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Subject</Label>
                    <p className="text-sm text-muted-foreground">{subject || 'No subject'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Recipients</Label>
                    <p className="text-sm text-muted-foreground">
                      {filteredUsers.length} users ({recipientType})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This action will send emails to {filteredUsers.length} users. This cannot be undone.
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isSending || !subject || !htmlContent || filteredUsers.length === 0}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email to {filteredUsers.length} Users
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}