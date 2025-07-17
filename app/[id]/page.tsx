"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getPublicProfileById, PublicProfile } from "@/lib/directory-service"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, MapPin, Briefcase, Phone, Globe, ExternalLink, Facebook } from "lucide-react"
import Image from "next/image"

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError("No profile ID provided")
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPublicProfileById(id as string)
        setProfile(data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        setError("Failed to load profile")
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">Loading Profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <Card className="w-full max-w-md shadow-xl text-center p-8 bg-white">
          <h2 className="text-xl font-semibold text-red-600">Profile Not Found</h2>
          <p className="text-gray-600 mt-2">
            {error || "The profile you are looking for does not exist or is not public."}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden bg-white">
        {/* Logo Header */}
        <div className="bg-white p-6 flex justify-center border-b border-gray-200">
          <Image src="/mockify-logo.png" alt="Mockify Logo" width={180} height={60} className="h-12 w-auto" priority />
        </div>

        <CardContent className="p-0">
          {/* Colored Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-8" />

          {/* Profile Content */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg -mt-16 sm:-mt-20 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User Avatar"} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              {/* Name and Title */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{profile.full_name}</h2>
                {profile.designation && (
                  <p className="text-blue-600 font-semibold text-md sm:text-lg">{profile.designation}</p>
                )}
                {profile.company_name && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mt-1 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{profile.company_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-700">
              {(profile.city || profile.country) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {/* Only show social links, not email or phone */}
              {(profile.social_links?.linkedin || profile.social_links?.twitter || profile.social_links?.facebook) && (
                <div className="flex items-center gap-3">
                  {profile.social_links?.linkedin && (
                    <a
                      href={profile.social_links.linkedin.startsWith("http") ? profile.social_links.linkedin : `https://${profile.social_links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors break-all flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {profile.social_links?.twitter && (
                    <a
                      href={profile.social_links.twitter.startsWith("http") ? profile.social_links.twitter : `https://${profile.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors break-all flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" /> Twitter
                    </a>
                  )}
                  {profile.social_links?.facebook && (
                    <a
                      href={profile.social_links.facebook.startsWith("http") ? profile.social_links.facebook : `https://${profile.social_links.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors break-all flex items-center gap-1"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            {/* Remove the old social links section, as the above now covers it */}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 sm:px-8 py-3 text-center text-xs text-gray-500 border-t border-gray-200">
            <span>Mockify Professional Directory</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}