"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Job } from "@/types/job"
import { useAuth } from "@/contexts/auth-context"
import { fetchUserApplicationsFromDB } from "@/lib/job-service-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const postedDate = new Date(job.created_at)
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: false })
  const { user } = useAuth()
  const [hasApplied, setHasApplied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;
    async function checkApplied() {
      if (!user?.id || !job?.id) {
        if (isMounted) setHasApplied(false)
        return;
      }
      const apps = await fetchUserApplicationsFromDB(user.id)
      if (isMounted) setHasApplied(apps.some((app: any) => app.job_id === job.id))
    }
    checkApplied()

    // Listen for cache update events
    function handleUpdate() {
      checkApplied()
    }
    window.addEventListener('jobApplicationsUpdated', handleUpdate)
    return () => {
      isMounted = false;
      window.removeEventListener('jobApplicationsUpdated', handleUpdate)
    }
  }, [user?.id, job?.id])

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary group cursor-pointer h-full flex flex-col"
      onClick={() => router.push(`/careers/jobs/${job.id}`)}
    >
      <CardContent className="p-3 flex flex-col h-full">
        <div className="flex items-center mb-3">
          {job.company_logo ? (
            <img src={job.company_logo} alt="Logo" className="w-10 h-10 min-w-10 rounded-full object-contain border bg-white" />
          ) : (
            <div className="w-10 h-10 min-w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              {job.company?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="ml-3">
            <h2 className="font-semibold text-base mb-0.5 text-gray-800 group-hover:text-primary transition-colors duration-200">
              {job.title}
            </h2>
            <div className="text-primary text-base">{job.company}</div>
          </div>
          <Badge className="ml-auto text-xs py-1">{job.job_type}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="flex items-center text-xs font-normal text-gray-600">
            <MapPin className="h-3 w-3 mr-1" /> {job.location}
          </Badge>
          <Badge variant="outline" className="flex items-center text-xs font-normal text-gray-600">
            <Calendar className="h-3 w-3 mr-1" /> Posted {timeAgo} ago
          </Badge>
          <Badge variant="outline" className="flex items-center text-xs font-normal text-gray-600">
            ₹{job.minSalary}L - ₹{job.maxSalary}L
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>

        {/* Spacer to push the button to the bottom */}
        <div className="flex-1" />

        <div className="flex justify-end items-end mt-2">
          <Button
            size="sm"
            asChild
            disabled={hasApplied}
            className={hasApplied ? "bg-green-600 text-white cursor-not-allowed" : undefined}
            onClick={e => e.stopPropagation()}
          >
            {hasApplied ? (
              <span>Applied</span>
            ) : (
              <Link href={`/careers/jobs/${job.id}`}>Apply Now</Link>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
