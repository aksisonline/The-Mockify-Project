import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Plus, Copy, Mail, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import PostJobDialog from "@/components/careers/PostJob"
import { useState as useLocalState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { notificationService } from "@/lib/notification-service-client"
import { toast } from "sonner"
import { validateProfileForPosting } from "@/lib/profile-validation"
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

// Utility to call the edge function
async function sendApplicantStatusEmail({ to, subject, html, text }: { to: string, subject: string, html?: string, text?: string }) {
  await fetch("/functions/v1/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html, text })
  })
}

export default function JobManagementCard() {
  const { user, isLoading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [showPostJob, setShowPostJob] = useState(false)
  const [applicantProfiles, setApplicantProfiles] = useState<Record<string, any>>({})
  const [copiedEmail, setCopiedEmail] = useLocalState<Record<string, boolean>>({})
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    fetchJobsAndApplications()
  }, [user?.id])

  const fetchJobsAndApplications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!user?.id) {
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/jobs/my-jobs?includeInactive=true')
      const result = await response.json()
      
      if (response.ok) {
        setJobs(result.jobs || [])
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

  const handleJobDialogClose = () => {
    setShowPostJob(false)
    // Don't immediately refetch - let the user see the current state
    // Only refetch if we need to refresh the data
  }

  const handleJobPosted = () => {
    setShowPostJob(false)
    // Refetch data after successful job posting
    fetchJobsAndApplications()
  }

  const handleRetry = () => {
    setError(null)
    fetchJobsAndApplications()
  }

  const handleForceRefresh = () => {
    console.log("Force refresh clicked")
    setLoading(false)
    setError(null)
    setJobs([])
    setApplications([])
    setApplicantProfiles({})
    // Force a fresh start
    setTimeout(() => {
      if (user?.id) {
        fetchJobsAndApplications()
      }
    }, 100)
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      const data = await response.json()

      if (!data.success) {
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

      if (!data.success) {
        throw new Error(data.error || "Failed to delete job")
      }

      setJobs(jobs.filter(job => job.id !== jobId))
      toast.success("Job deleted successfully")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job")
    }
  }

  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Job Postings</CardTitle>
          <CardDescription>Error loading your jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <div className="space-x-2">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleForceRefresh} variant="secondary">
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show loading state only when actually loading
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Job Postings</CardTitle>
          <CardDescription>Loading your jobs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
            <div className="text-center pt-4">
              <Button 
                onClick={handleForceRefresh} 
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Fallback: Show basic structure even if there are issues
  if (!user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Job Postings</CardTitle>
          <CardDescription>Please log in to manage your jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You need to be logged in to view your job postings.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getApplicationsForJob = (jobId: string) =>
    applications.filter((app) => app.job_id === jobId)

  const getPendingApplicationsForJob = (jobId: string) =>
    applications.filter((app) => app.job_id === jobId && app.status === "pending")

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'accepted': return 'default'
      case 'rejected': return 'destructive'
      case 'reviewing': return 'outline'
      case 'interviewed': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 text-gray-700'
      case 'accepted': return 'bg-green-200 text-green-700'
      case 'rejected': return 'bg-red-200 text-red-700'
      case 'reviewing': return 'bg-blue-200 text-blue-700'
      case 'interviewed': return 'bg-purple-200 text-purple-700'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Job Postings</CardTitle>
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
          <div className="space-y-4">
            <div className="flex justify-end mb-2">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 mb-2">
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
                        </div>
                        <div className="text-xs text-gray-500">{job.company}</div>
                        <div className="text-xs text-gray-500">{
                          (() => {
                            let min = job.minSalary;
                            let max = job.maxSalary;
                            // Fallback: parse salary_range if min/max are undefined
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
                          {getPendingApplicationsForJob(job.id).length} pending, {getApplicationsForJob(job.id).length} total application{getApplicationsForJob(job.id).length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{job.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteJob(job.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 border-t pt-3">
                      <div className="font-semibold text-sm mb-2">Applicants:</div>
                      {jobApps.length > 0 ? (
                        <div className="space-y-2">
                          {jobApps.map((app) => {
                            const profile = applicantProfiles[app.applicant_id]
                            const isCopied = copiedEmail[app.applicant_id]
                            return (
                              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded bg-white/80">
                                <div className="flex items-center gap-3">
                                  {profile && profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-8 w-8 rounded-full object-cover border" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-base border">
                                      {profile && profile.full_name ? profile.full_name[0] : "?"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium flex items-center gap-2">
                                      {profile ? (
                                        <Link 
                                          href={`/${app.applicant_id}`}
                                          className="hover:text-blue-600 hover:underline transition-colors"
                                        >
                                          {profile.full_name}
                                        </Link>
                                      ) : (
                                        <span className="text-gray-400">Loading...</span>
                                      )}
                                      <TooltipProvider>
                                        <Tooltip open={isCopied !== undefined} onOpenChange={() => {}}>
                                          <TooltipTrigger asChild>
                                            <button
                                              className="ml-1 p-1 hover:bg-gray-200 rounded"
                                              onClick={async () => {
                                                if (profile?.email) {
                                                  await navigator.clipboard.writeText(profile.email)
                                                  setCopiedEmail((prev) => ({ ...prev, [app.applicant_id]: true }))
                                                  setTimeout(() => {
                                                    setCopiedEmail((prev) => ({ ...prev, [app.applicant_id]: false }))
                                                  }, 1500)
                                                }
                                              }}
                                            >
                                              <Mail className="h-4 w-4 text-gray-500" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            {isCopied ? "Copied!" : "Copy Email"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
                                  <div className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(app.status)}`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                  </div>
                                  {app.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={!!statusLoading[app.id]}
                                        onClick={async () => {
                                          if (!profile?.email) return
                                          setStatusLoading(prev => ({ ...prev, [app.id]: true }))
                                          
                                          try {
                                            // Update status via API
                                            const response = await fetch(`/api/jobs/applications/${app.id}`, {
                                              method: "PUT",
                                              headers: {
                                                "Content-Type": "application/json",
                                              },
                                              body: JSON.stringify({ status: "accepted" }),
                                            })

                                            const result = await response.json()

                                            if (response.ok && result.success) {
                                              // Update local state
                                              setApplications(prevApps => prevApps.map(a => a.id === app.id ? { ...a, status: "accepted" } : a))
                                              
                                              // Send notification
                                              await notificationService.createNotification({
                                                userId: app.applicant_id,
                                                title: `You have been selected for ${job.title}`,
                                                message: `Congratulations! You have been selected for the job: ${job.title} at ${job.company}.`,
                                                type: "job_status_update",
                                                priority: "normal",
                                                referenceId: job.id,
                                                referenceType: "job_application"
                                              })
                                              
                                              toast.success("Applicant selected successfully")
                                            } else {
                                              console.error("Failed to update application status:", result.error)
                                              toast.error(result.error || "Failed to update application status")
                                            }
                                          } catch (error) {
                                            console.error("Error updating application status:", error)
                                            toast.error("Failed to update application status")
                                          } finally {
                                            setStatusLoading(prev => ({ ...prev, [app.id]: false }))
                                          }
                                        }}
                                      >
                                        Selected
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={!!statusLoading[app.id]}
                                        onClick={async () => {
                                          if (!profile?.email) return
                                          setStatusLoading(prev => ({ ...prev, [app.id]: true }))
                                          
                                          try {
                                            // Update status via API
                                            const response = await fetch(`/api/jobs/applications/${app.id}`, {
                                              method: "PUT",
                                              headers: {
                                                "Content-Type": "application/json",
                                              },
                                              body: JSON.stringify({ status: "rejected" }),
                                            })

                                            const result = await response.json()

                                            if (response.ok && result.success) {
                                              // Update local state
                                              setApplications(prevApps => prevApps.map(a => a.id === app.id ? { ...a, status: "rejected" } : a))
                                              
                                              // Send notification
                                              await notificationService.createNotification({
                                                userId: app.applicant_id,
                                                title: `You have not been selected for ${job.title}`,
                                                message: `We regret to inform you that you have not been selected for the job: ${job.title} at ${job.company}.`,
                                                type: "job_status_update",
                                                priority: "normal",
                                                referenceId: job.id,
                                                referenceType: "job_application"
                                              })
                                              
                                              toast.success("Applicant rejected successfully")
                                            } else {
                                              console.error("Failed to update application status:", result.error)
                                              toast.error(result.error || "Failed to update application status")
                                            }
                                          } catch (error) {
                                            console.error("Error updating application status:", error)
                                            toast.error("Failed to update application status")
                                          } finally {
                                            setStatusLoading(prev => ({ ...prev, [app.id]: false }))
                                          }
                                        }}
                                      >
                                        Rejected
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No applications received yet.</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 