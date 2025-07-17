import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Plus, Mail, Trash2, Building, Calendar, Edit, RefreshCw } from "lucide-react"
import Link from "next/link"
import PostJobDialog from "@/components/careers/PostJob"
import { useState as useLocalState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { notificationService } from "@/lib/notification-service-client"
import { toast } from "sonner"
import { validateProfileForPosting } from "@/lib/profile-validation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-500" },
  { value: "interviewed", label: "Interviewed", color: "bg-purple-500" },
  { value: "accepted", label: "Accepted", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" }
]

export default function UnifiedJobManagementCard() {
  const { user, isLoading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [showPostJob, setShowPostJob] = useState(false)
  const [applicantProfiles, setApplicantProfiles] = useState<Record<string, any>>({})
  const [copiedEmail, setCopiedEmail] = useLocalState<Record<string, boolean>>({})
  const [updating, setUpdating] = useState<string | null>(null)
  const [showEditJob, setShowEditJob] = useState(false)
  const [editingJob, setEditingJob] = useState<any>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    fetchJobs()
  }, [user?.id])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs/my-jobs?includeInactive=true')
      const result = await response.json()
      
      if (response.ok) {
        const jobsWithApprovalStatus = result.jobs.map((job: any) => ({
          ...job,
          // approval_status, approved_by, approved_at, and rejection_reason are now top-level fields from the API
        }))
        setJobs(jobsWithApprovalStatus)
        if (result.jobs && result.jobs.length > 0) {
          const jobIds = result.jobs.map((j: any) => j.id)
          
          const appsResponse = await fetch(`/api/jobs/applications?jobIds=${jobIds.join(',')}`)
          const appsResult = await appsResponse.json()
          
          if (appsResponse.ok) {
            setApplications(appsResult.applications || [])
            
            const uniqueApplicantIds = Array.from(new Set(appsResult.applications.map((app: any) => app.applicant_id)))
            
            if (uniqueApplicantIds.length > 0) {
              const profilesResponse = await fetch(`/api/profiles/public?userIds=${uniqueApplicantIds.join(',')}`)
              const profilesResult = await profilesResponse.json()
              
              if (profilesResponse.ok) {
                setApplicantProfiles(profilesResult.profiles || {})
              }
            }
          }
        }
      } else {
        setError(result.error || "Failed to fetch jobs")
        setJobs([])
        setApplications([])
        setApplicantProfiles({})
      }
    } catch (e) {
      console.error("Error fetching jobs and applications:", e)
      setError("An error occurred while fetching your jobs")
      setJobs([])
      setApplications([])
      setApplicantProfiles({})
    } finally {
      setLoading(false)
    }
  }

  const handleJobPosted = () => {
    setShowPostJob(false)
    // Add a small delay to ensure the job is created in the database
    setTimeout(() => {
      fetchJobs()
    }, 1000)
  }

  const handleRefreshJobs = () => {
    fetchJobs()
  }

  const handlePostJobClick = async () => {
    if (!user?.id) {
      toast.error("Please log in to post a job")
      return
    }

    const isProfileValid = await validateProfileForPosting(user.id)
    if (isProfileValid) {
      setShowPostJob(true)
    }
  }

  const updateJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update job status")
      }

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, is_active: isActive } : job
      ))
      toast.success(`Job ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Error updating job status:", error)
      toast.error("Failed to update job status")
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete job")
      }

      setJobs(jobs.filter(job => job.id !== jobId))
      setApplications(applications.filter(app => app.job_id !== jobId))
      toast.success("Job deleted successfully")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job")
    }
  }

  const handleApplicationStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId)
    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to update status")
      }

      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )

      // Send notification to applicant
      const application = applications.find(app => app.id === applicationId)
      const job = jobs.find(j => j.id === application?.job_id)
      const profile = applicantProfiles[application?.applicant_id]

      if (application && job && profile) {
        const statusMessages = {
          pending: "Your application is under review",
          reviewing: "Your application is being reviewed",
          interviewed: "You have been selected for an interview",
          accepted: "Congratulations! Your application has been accepted",
          rejected: "We regret to inform you that your application was not selected"
        }

        const statusTitles = {
          pending: "Application Under Review",
          reviewing: "Application Being Reviewed", 
          interviewed: "Interview Invitation",
          accepted: "Application Accepted",
          rejected: "Application Update"
        }

        await notificationService.createNotification({
          userId: application.applicant_id,
          title: `${statusTitles[newStatus as keyof typeof statusTitles]} - ${job.title}`,
          message: `${statusMessages[newStatus as keyof typeof statusMessages]} for the position of ${job.title} at ${job.company}.`,
          type: "job_status_update",
          priority: "normal",
          referenceId: job.id,
          referenceType: "job_application"
        })
      }

      toast.success("Application status updated successfully")
    } catch (error: any) {
      console.error("Error updating application status:", error)
      toast.error(error.message || "Failed to update application status")
    } finally {
      setUpdating(null)
    }
  }

  const getApplicationsForJob = (jobId: string) =>
    applications.filter((app) => app.job_id === jobId)

  const getPendingApplicationsForJob = (jobId: string) =>
    applications.filter((app) => app.job_id === jobId && app.status === "pending")

  const getStatusBadgeColor = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find(s => s.value === status)
    return statusConfig?.color || "bg-gray-500"
  }

  const copyEmail = async (email: string, applicantId: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(prev => ({ ...prev, [applicantId]: true }))
      setTimeout(() => {
        setCopiedEmail(prev => ({ ...prev, [applicantId]: false }))
      }, 1500)
      toast.success("Email copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy email")
    }
  }

  const handleEditJob = (job: any) => {
    setEditingJob(job)
    setShowEditJob(true)
  }

  const handleJobEdited = () => {
    setShowEditJob(false)
    setEditingJob(null)
    fetchJobs()
  }

  if (loading) {
    return (
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Job Management</CardTitle>
        <CardDescription>
          {jobs.length === 0
            ? "You haven't posted any jobs yet."
            : `You have posted ${jobs.length} job${jobs.length !== 1 ? "s" : ""}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Post a job to start receiving applications from candidates.</p>
            <Button onClick={handlePostJobClick}>
              <Plus className="mr-2 h-4 w-4" /> Post a Job
            </Button>
            <PostJobDialog open={showPostJob} onClose={handleJobPosted} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end mb-2 gap-2">
              <Button onClick={handleRefreshJobs} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button onClick={handlePostJobClick} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Post New Job
              </Button>
              <PostJobDialog open={showPostJob} onClose={handleJobPosted} />
            </div>
            
            {jobs.map((job) => {
              const jobApps = getApplicationsForJob(job.id)
              const isExpanded = expandedJobId === job.id
              
              return (
                <div key={job.id} className="border rounded-lg p-4 bg-gray-50">
                  {/* Job Header with Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt="Logo" className="h-10 w-10 rounded-full object-contain border bg-white" />
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg border">
                          {job.company?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-lg flex items-center gap-2">
                          {job.title}
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {/* Show approval status */}
                          {job.approval_status === 'pending' && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Pending Approval
                            </Badge>
                          )}
                          {job.approval_status === 'rejected' && (
                            <Badge variant="destructive">
                              Rejected
                            </Badge>
                          )}
                          {job.approval_status === 'approved' && (
                            <Badge variant="default" className="bg-green-600">
                              Approved
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{job.company}</div>
                        <div className="text-xs text-gray-500">{
                          (() => {
                            let min = job.minSalary;
                            let max = job.maxSalary;
                            if ((min === undefined || max === undefined) && job.salary_range) {
                              try {
                                const parsed = JSON.parse(job.salary_range);
                                min = parsed.minSalary;
                                max = parsed.maxSalary;
                              } catch {}
                            }
                            const showMin = min !== undefined && min !== null;
                            const showMax = max !== undefined && max !== null;
                            if (!showMin && !showMax) return "₹N/A";
                            if (!showMin) return `₹N/A - ₹${max}L`;
                            if (!showMax) return `₹${min}L - ₹N/A`;
                            return `₹${min}L - ₹${max}L`;
                          })()
                        }</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {getPendingApplicationsForJob(job.id).length} pending, {jobApps.length} total application{jobApps.length !== 1 ? "s" : ""}
                        </div>
                        {/* Show rejection reason if job was rejected */}
                        {job.approval_status === 'rejected' && job.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Rejection reason: {job.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Job Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Active</span>
                        <Switch
                          checked={job.is_active}
                          onCheckedChange={(checked) => updateJobStatus(job.id, checked)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            Hide Applicants <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Applicants <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Job</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{job.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteJob(job.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  {/* Applications Table */}
                  {isExpanded && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Applications for {job.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {jobApps.length} application{jobApps.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {jobApps.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Applicant</TableHead>
                              <TableHead>Applied</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Update Status</TableHead>
                              <TableHead>Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobApps.map((application) => {
                              const profile = applicantProfiles[application.applicant_id]
                              const isCopied = copiedEmail[application.applicant_id]
                              
                              return (
                                <TableRow key={application.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {profile?.avatar_url ? (
                                        <img 
                                          src={profile.avatar_url} 
                                          alt={profile.full_name || "Avatar"} 
                                          className="h-8 w-8 rounded-full object-cover border" 
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-sm border">
                                          {profile?.full_name ? profile.full_name[0] : "?"}
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium">
                                          {profile ? (
                                            <Link 
                                              href={`/${application.applicant_id}`}
                                              className="hover:text-blue-600 hover:underline transition-colors"
                                            >
                                              {profile.full_name}
                                            </Link>
                                          ) : (
                                            <span className="text-gray-400">Loading...</span>
                                          )}
                                        </div>
                                        {profile?.email && (
                                          <div className="text-sm text-muted-foreground">
                                            {profile.email}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={getStatusBadgeColor(application.status)}>
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={application.status}
                                      onValueChange={(value) => handleApplicationStatusChange(application.id, value)}
                                      disabled={updating === application.id}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {APPLICATION_STATUSES.map((status) => (
                                          <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    {profile?.email && (
                                      <TooltipProvider>
                                        <Tooltip open={isCopied} onOpenChange={() => {}}>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => copyEmail(profile.email, application.applicant_id)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Mail className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {isCopied ? "Copied!" : "Copy Email"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No applications received yet for this job.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <PostJobDialog open={showEditJob} onClose={handleJobEdited} editingJob={editingJob} />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 