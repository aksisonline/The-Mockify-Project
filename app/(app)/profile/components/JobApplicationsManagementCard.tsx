import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Mail, User, Calendar, Building } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { notificationService } from "@/lib/notification-service-client"

const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-500" },
  { value: "interviewed", label: "Interviewed", color: "bg-purple-500" },
  { value: "accepted", label: "Accepted", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" }
]

export default function JobApplicationsManagementCard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [applicantProfiles, setApplicantProfiles] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchJobsAndApplications()
  }, [])

  const fetchJobsAndApplications = async () => {
    setLoading(true)
    try {
      // Fetch jobs posted by the current user
      const jobsResponse = await fetch('/api/jobs/my-jobs?includeInactive=true')
      const jobsResult = await jobsResponse.json()
      
      if (!jobsResponse.ok) {
        throw new Error(jobsResult.error || "Failed to fetch jobs")
      }

      const userJobs = jobsResult.jobs || []
      setJobs(userJobs)

      if (userJobs.length > 0) {
        const jobIds = userJobs.map((job: any) => job.id)
        
        // Fetch applications for these jobs
        const appsResponse = await fetch(`/api/jobs/applications?jobIds=${jobIds.join(',')}`)
        const appsResult = await appsResponse.json()
        
        if (!appsResponse.ok) {
          throw new Error(appsResult.error || "Failed to fetch applications")
        }

        const userApplications = appsResult.applications || []
        setApplications(userApplications)

        // Fetch applicant profiles
        if (userApplications.length > 0) {
          const uniqueApplicantIds = Array.from(new Set(userApplications.map((app: any) => app.applicant_id)))
          
          const profilesResponse = await fetch(`/api/profiles/public?userIds=${uniqueApplicantIds.join(',')}`)
          const profilesResult = await profilesResponse.json()
          
          if (profilesResponse.ok) {
            setApplicantProfiles(profilesResult.profiles || {})
          }
        }
      }
    } catch (error) {
      console.error("Error fetching jobs and applications:", error)
      toast.error("Failed to load job applications")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
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

      const result = await response.json()
      
      // Update local state
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

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Job Applications Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading applications...</div>
        </CardContent>
      </Card>
    )
  }

  // Group applications by job
  const applicationsByJob = jobs.reduce((acc, job) => {
    const jobApplications = applications.filter(app => app.job_id === job.id)
    if (jobApplications.length > 0) {
      acc[job.id] = {
        job,
        applications: jobApplications
      }
    }
    return acc
  }, {} as Record<string, { job: any, applications: any[] }>)

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Job Applications Management</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(applicationsByJob).length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            You have no job applications to manage yet.
          </div>
        ) : (
          Object.entries(applicationsByJob).map(([jobId, { job, applications: jobApps }]) => (
            <div key={jobId} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <Badge variant="outline" className="ml-2">
                  {jobApps.length} application{jobApps.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
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
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application.id, value)}
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
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 