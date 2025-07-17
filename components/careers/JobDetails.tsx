"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import type { Job } from "@/types/job"
import { useAuth } from "@/contexts/auth-context"
import { addJobApplication, getJobApplicationForUser, fetchUserApplicationsFromDB } from "@/lib/job-service-client"
import { notificationService } from "@/lib/notification-service-client"
import { toast } from "sonner"
import { awardCategoryPoints } from "@/lib/points-category-service"
import { getCached, setCached } from "@/utils/userCache"
import { createBrowserClient } from "@/lib/supabase/client"

interface JobDetailsProps {
  job: Job
}

export default function JobDetails({ job }: JobDetailsProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const [hasApplied, setHasApplied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setMounted(true)
    async function checkApplied() {
      if (!user?.id || !job?.id) return;
      const apps = await fetchUserApplicationsFromDB(user.id)
      setHasApplied(apps.some((app: any) => app.job_id === job.id))
    }
    checkApplied()
  }, [user?.id, job?.id])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleApply = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to apply.")
      return
    }
    
    setIsApplying(true)
    
    try {
      // Check if public profile is enabled
      const supabase = createBrowserClient()
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_public")
        .eq("id", user.id)
        .single()
      if (error || !profile || !profile.is_public) {
        toast.error("You must enable Public Profile to apply for jobs.")
        await notificationService.createNotificationFromTemplate(
          "public_profile_required_to_apply",
          user.id,
          {
            message: "You must enable Public Profile to apply for jobs. Go to your profile settings to enable it."
          },
          {
            referenceType: "job",
            referenceId: job.id,
            triggeredBy: user.id
          }
        )
        return
      }
      if (hasApplied) return
      const result = await addJobApplication({
        job_id: job.id,
        applicant_id: user.id,
        status: "pending"
      })
      if (result) {
        setHasApplied(true)
        // Update cached applications immediately
        let apps = getCached('jobApplications', user.id) || []
        setCached('jobApplications', user.id, [...apps, result])
        // Notify JobCards to update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('jobApplicationsUpdated'))
        }
        // Notify the job poster
        await notificationService.createNotificationFromTemplate(
          "application_received",
          job.posted_by,
          {
            job_title: job.title,
            company_name: job.company
          },
          {
            referenceId: job.id,
            referenceType: "job",
            triggeredBy: user.id
          }
        )
        // Notify the applicant (use template-driven notification)
        await notificationService.createNotificationFromTemplate(
          "application_submitted",
          user.id,
          {
            job_title: job.title,
            company_name: job.company
          },
          {
            referenceId: job.id,
            referenceType: "job",
            triggeredBy: user.id
          }
        )
        // Award points for applying to a job
        const pointsAwarded = 10
        const awardResult = await awardCategoryPoints(
          user.id,
          "careers",
          pointsAwarded,
          "Applied to a job",
          { jobId: job.id }
        )
        if (awardResult.success) {
          // Removed duplicate notification creation here
          toast.success("Application submitted!")
        } else {
          toast.error("Failed to apply. Please try again.")
        }
      } else {
        toast.error("Failed to apply. Please try again.")
      }
    } catch (error) {
      console.error("Error applying for job:", error)
      toast.error("Failed to apply. Please try again.")
    } finally {
      setIsApplying(false)
    }
  }

  // Add error handling for invalid dates
  const getPostedDate = () => {
    try {
      const date = new Date(job.created_at)
      if (isNaN(date.getTime())) {
        return "Recently"
      }
      return formatDistanceToNow(date, { addSuffix: false })
    } catch (error) {
      return "Recently"
    }
  }

  const getFormattedDate = () => {
    try {
      const date = new Date(job.created_at)
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return date.toLocaleDateString()
    } catch (error) {
      return "N/A"
    }
  }

  const timeAgo = getPostedDate()

  const shareText = encodeURIComponent(`Check out this job: ${job.title} at ${job.company}`);
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(job.title)}&source=mockify`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}%20${encodeURIComponent(currentUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${encodeURIComponent(currentUrl)}`;

  const sharePlatforms = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${shareText}%20${encodeURIComponent(currentUrl)}`,
      bg: "bg-green-600 hover:bg-green-700",
      icon: (
        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.644-.182-.067-.315-.099-.445.099-.133.197-.513.644-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.067-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.708 1.916.808 2.049.1.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      ),
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${shareText}%20${encodeURIComponent(currentUrl)}`,
      bg: "bg-sky-500 hover:bg-sky-600",
      icon: (
        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(job.title)}&source=mockify`,
      bg: "bg-blue-700 hover:bg-blue-800",
      icon: (
        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
          <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      bg: "bg-blue-600 hover:bg-blue-700",
      icon: (
        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              {job.company_logo ? (
                <img src={job.company_logo} alt="Logo" className="w-16 h-16 rounded-full object-contain border bg-white" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {job.company?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="text-blue-600 text-xl font-medium">
                  {job.company}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
                {job.location}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"/>
                </svg>
                Posted {timeAgo} ago
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                ₹{job.minSalary}L - ₹{job.maxSalary}L
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">{job.job_type}</span>
            </div>
            <div className="flex gap-4">
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 flex items-center justify-center ${hasApplied ? "bg-green-600 text-white cursor-not-allowed" : isApplying ? "bg-blue-500 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                onClick={handleApply}
                disabled={hasApplied || isApplying}
              >
                {isApplying && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isApplying ? "Applying..." : (hasApplied ? "Applied" : "Apply Now")}
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h5 className="text-xl font-semibold mb-0 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                </svg>
                Job Description
              </h5>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>
          </div>

          {/* Job Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200 px-6 py-4">
                <h5 className="text-xl font-semibold mb-0 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"/>
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"/>
                  </svg>
                  Requirements
                </h5>
              </div>
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed">
                  {(String(job.requirements)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200 px-6 py-4">
                <h5 className="text-xl font-semibold mb-0 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  Benefits
                </h5>
              </div>
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed">
                  {(String(job.benefits)
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {/* Job Overview */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h5 className="text-xl font-semibold mb-0 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                Job Overview
              </h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Date Posted</h6>
                    <p className="text-gray-600 text-sm">{getFormattedDate()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Location</h6>
                    <p className="text-gray-600 text-sm">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
                  </svg>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Job Type</h6>
                    <p className="text-gray-600 text-sm">{job.job_type ? job.job_type.replace("-", " ") : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                  </svg>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Salary</h6>
                    <p className="text-gray-600 text-sm">
                      ₹{job.minSalary || 0}L - ₹{job.maxSalary || 0}L
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.790 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                  </svg>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Experience</h6>
                    <p className="text-gray-600 text-sm">{job.experience_level ? job.experience_level.replace("-", " ") : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Job */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h5 className="text-xl font-semibold mb-0 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                </svg>
                Share This Job
              </h5>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sharePlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${platform.bg} text-white px-3 py-2 rounded-lg text-center transition-colors`}
                    aria-label={`Share on ${platform.name}`}
                  >
                    {platform.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Now CTA */}
          {!hasApplied && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md text-white">
              <div className="p-6 text-center">
                <h5 className="text-xl font-semibold mb-3">Ready to Apply?</h5>
                <p className="mb-4 text-blue-100">
                  Submit your application now and take the next step in your career journey.
                </p>
                <button
                  className={`font-semibold px-6 py-3 rounded-lg w-full transition-colors flex items-center justify-center ${isApplying ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-blue-600 hover:bg-gray-50"}`}
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isApplying ? "Applying..." : "Apply Now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}