"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Users, Briefcase, Clock, DollarSign, Eye, EyeOff, Building, CheckCircle, XCircle, RefreshCw, Search, Filter, Calendar, Mail, Phone } from "lucide-react"
import type { AdminJob, JobApplication, JobsStats } from "@/lib/admin-jobs-service"

export default function JobsAdminClient() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<JobsStats>({
    totalJobs: 0,
    activeJobs: 0,
    pendingApproval: 0,
    approvedJobs: 0,
    rejectedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "all",
    category: "all",
    jobType: "all"
  })

  // Form states
  const [showAddJob, setShowAddJob] = useState(false)
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    benefits: "",
    salary_range: "",
    job_type: "",
    experience_level: "",
    category: "",
    is_active: true,
    application_deadline: ""
  })

  // Approval states
  const [approvingJob, setApprovingJob] = useState<string | null>(null)
  const [rejectingJob, setRejectingJob] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedJobForRejection, setSelectedJobForRejection] = useState<AdminJob | null>(null)

  // Application management
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [filters])

  // Test function to check API connectivity
  const testAPI = async () => {
    try {
      const response = await fetch('/api/admin/jobs/test')
      const data = await response.json()
      // console.log('Test API response:', data)
      toast.success('API connectivity test passed')
    } catch (error) {
      console.error('Test API error:', error)
      toast.error('API connectivity test failed')
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Test API connectivity first
      await testAPI()
      
      // Fetch jobs with filters
      const jobsResponse = await fetch(`/api/admin/jobs?${new URLSearchParams({
        search: filters.search,
        approvalStatus: filters.approvalStatus,
        category: filters.category,
        jobType: filters.jobType
      })}`)
      
      // Fetch applications
      const applicationsResponse = await fetch('/api/jobs/applications?admin=true')
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/jobs/stats')
      
      // Check if responses are ok before parsing JSON
      if (!jobsResponse.ok) {
        const errorText = await jobsResponse.text()
        console.error('Jobs API error:', jobsResponse.status, errorText)
        throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`)
      }
      
      if (!applicationsResponse.ok) {
        const errorText = await applicationsResponse.text()
        console.error('Applications API error:', applicationsResponse.status, errorText)
        throw new Error(`Failed to fetch applications: ${applicationsResponse.status}`)
      }
      
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text()
        console.error('Stats API error:', statsResponse.status, errorText)
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`)
      }
      
      const [jobsData, applicationsData, statsData] = await Promise.all([
        jobsResponse.json(),
        applicationsResponse.json(),
        statsResponse.json()
      ])
      
      setJobs(jobsData.jobs || [])
      setApplications(applicationsData.applications || [])
      setStats(statsData.stats || stats)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch jobs data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveJob = async (jobId: string) => {
    try {
      setApprovingJob(jobId)
      
      const response = await fetch('/api/admin/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'approve' })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Job approved successfully')
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to approve job')
      }
    } catch (error) {
      console.error('Error approving job:', error)
      toast.error('Failed to approve job')
    } finally {
      setApprovingJob(null)
    }
  }

  const handleRejectJob = async (jobId: string, rejectionReason: string) => {
    try {
      setRejectingJob(jobId)
      
      const response = await fetch('/api/admin/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'reject', rejectionReason })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Job rejected successfully')
        setShowRejectDialog(false)
        setSelectedJobForRejection(null)
        setRejectionReason("")
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to reject job')
      }
    } catch (error) {
      console.error('Error rejecting job:', error)
      toast.error('Failed to reject job')
    } finally {
      setRejectingJob(null)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Job deleted successfully')
        fetchData()
      } else {
        throw new Error('Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  const handleApplicationStatusChange = async (applicationId: string, status: string) => {
    try {
      setUpdatingApplication(applicationId)
      
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        toast.success('Application status updated')
        fetchData()
      } else {
        throw new Error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Failed to update application status')
    } finally {
      setUpdatingApplication(null)
    }
  }

  const openRejectDialog = (job: AdminJob) => {
    setSelectedJobForRejection(job)
    setShowRejectDialog(true)
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-800">Reviewing</Badge>
      case 'interviewed':
        return <Badge className="bg-purple-100 text-purple-800">Interviewed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading jobs data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground">Manage job postings and applications</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={testAPI} variant="outline">
            Test API
          </Button>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedJobs} approved, {stats.rejectedJobs} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApplications} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications accepted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select
                value={filters.approvalStatus}
                onValueChange={(value) => setFilters(prev => ({ ...prev, approvalStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={filters.jobType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>
                Manage job postings and approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs found matching your filters.
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <Building className="h-4 w-4" />
                            <span>{job.location}</span>
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary_range}</span>
                            <Clock className="h-4 w-4" />
                            <span>{job.job_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getApprovalStatusBadge(job.approval_status)}
                          <div className="flex space-x-1">
                            {job.approval_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveJob(job.id)}
                                  disabled={approvingJob === job.id}
                                >
                                  {approvingJob === job.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectDialog(job)}
                                  disabled={rejectingJob === job.id}
                                >
                                  {rejectingJob === job.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this job? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>Posted by: {job.poster_profile?.full_name || 'Unknown'}</span>
                          <span>Posted: {formatDate(job.created_at)}</span>
                          {job.approved_at && (
                            <span>Approved: {formatDate(job.approved_at)}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{job.category}</Badge>
                          <Badge variant="outline">{job.experience_level}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Manage job applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications found.
                  </div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{application.job?.title || 'Unknown Job'}</h3>
                          <p className="text-sm text-muted-foreground">{application.job?.company || 'Unknown Company'}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span>Applicant: {application.applicant?.full_name || 'Unknown'}</span>
                            <Mail className="h-4 w-4" />
                            <span>{application.applicant?.email || 'No email'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getApplicationStatusBadge(application.status)}
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleApplicationStatusChange(application.id, value)}
                            disabled={updatingApplication === application.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="interviewed">Interviewed</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Applied: {formatDate(application.applied_at)}</span>
                        <span>ID: {application.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Job Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Job</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedJobForRejection?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedJobForRejection && handleRejectJob(selectedJobForRejection.id, rejectionReason)}
              disabled={!rejectionReason.trim() || rejectingJob === selectedJobForRejection?.id}
            >
              {rejectingJob === selectedJobForRejection?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 