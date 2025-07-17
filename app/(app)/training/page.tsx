"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrainingDialog, TrainingDialogContent, TrainingDialogHeader, TrainingDialogTitle, TrainingDialogTrigger } from "@/components/ui/training-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, MapPin, Users, Star, BookOpen, Award, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { TrainingProgram } from "@/lib/training-service"
import AppHeader from "@/components/ui/AppHeader"

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  city?: string
  country?: string
}

interface UserEnrollment {
  id: string
  program_id: string
  enrollment_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  enrolled_at: string
  email: string
}

export default function TrainingPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<TrainingProgram | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [userEnrollments, setUserEnrollments] = useState<UserEnrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/training/programs")

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const data = await response.json()
        setCourses(data)
      } catch (err: any) {
        console.error("Error fetching courses:", err)
        setError(err.message || "Failed to load courses")
      } finally {
        setLoading(false)
      }
    }

    async function fetchUserProfile() {
      try {
        setProfileLoading(true)
        const response = await fetch("/api/profile")
        
        if (response.ok) {
          const data = await response.json()
          // Extract the profile data from the response
          const profile = data.profile || data
          setUserProfile({
            id: profile.id,
            full_name: profile.full_name || profile.fullName || "",
            email: profile.email || "",
            phone: profile.phone_number || "",
            city: profile.city || (profile.addresses && profile.addresses[0]?.city) || "",
            country: profile.country || (profile.addresses && profile.addresses[0]?.country) || "",
          })
        } else {
          console.error("Failed to fetch user profile")
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
      } finally {
        setProfileLoading(false)
      }
    }

    async function fetchUserEnrollments() {
      try {
        setEnrollmentsLoading(true)
        const response = await fetch("/api/training/enrollments")
        
        if (response.ok) {
          const data = await response.json()
          // console.log("Fetched user enrollments data:", data)
          // console.log("User profile email:", userProfile?.email)
          setUserEnrollments(data.enrollments || [])
        } else {
          console.error("Failed to fetch user enrollments")
        }
      } catch (err) {
        console.error("Error fetching user enrollments:", err)
      } finally {
        setEnrollmentsLoading(false)
      }
    }

    fetchCourses()
    fetchUserProfile()
    fetchUserEnrollments()
  }, [])

  // Separate useEffect to refresh enrollments when user profile is loaded
  useEffect(() => {
    if (userProfile?.email) {
      async function fetchUserEnrollments() {
        try {
          setEnrollmentsLoading(true)
          const response = await fetch("/api/training/enrollments")
          
          if (response.ok) {
            const data = await response.json()
            // console.log("Refreshed user enrollments data:", data)
            // console.log("User profile email:", userProfile?.email)
            setUserEnrollments(data.enrollments || [])
          } else {
            console.error("Failed to fetch user enrollments")
          }
        } catch (err) {
          console.error("Error fetching user enrollments:", err)
        } finally {
          setEnrollmentsLoading(false)
        }
      }
      
      fetchUserEnrollments()
    }
  }, [userProfile?.email])

  const handleEnrollment = async (formData: FormData) => {
    if (!selectedCourse || !userProfile) return

    try {
      const enrollmentData = {
        program_id: selectedCourse.id,
        mobile_number: formData.get("mobile") as string || userProfile.phone || "",
        working_status: formData.get("workingStatus") as "yes" | "no",
        preferred_mode: formData.get("preferredMode") as "online" | "classroom",
      }

      const response = await fetch("/api/training/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enrollmentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to enroll")
      }

      toast.success("Enrollment successful! We will contact you soon.")
      setSelectedCourse(null)
      setDialogOpen(false)
      
      // Refresh enrollments to update the UI
      const enrollmentsResponse = await fetch("/api/training/enrollments")
      if (enrollmentsResponse.ok) {
        const data = await enrollmentsResponse.json()
        setUserEnrollments(data.enrollments || [])
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnrolling(true) // Set loading state immediately on button click
    
    const formData = new FormData(e.currentTarget)
    await handleEnrollment(formData)
  }

  const navigateToDetails = (courseId: string) => {
    router.push(`/training/${courseId}`)
  }

  const isEnrolled = (courseId: string) => {
    // Check if user's email exists in enrollments for this specific program
    const enrolled = userEnrollments.some(enrollment => 
      enrollment.program_id === courseId && 
      enrollment.email === userProfile?.email
    )
    // console.log(`Checking enrollment for course ${courseId}:`, {
    //   courseId,
    //   userEmail: userProfile?.email,
    //   userEnrollments,
    //   enrolled,
    //   matchingEnrollments: userEnrollments.filter(e => e.program_id === courseId)
    // })
    return enrolled
  }

  const getEnrollmentStatus = (courseId: string) => {
    // Find enrollment for this specific program and user's email
    const enrollment = userEnrollments.find(e => 
      e.program_id === courseId && 
      e.email === userProfile?.email
    )
    return enrollment?.enrollment_status || null
  }

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnrollmentStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'pending': return 'Pending'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Training Programs" subtitle="Enhance your media skills with our comprehensive training programs designed by industry experts" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Training Programs" subtitle="Enhance your media skills with our comprehensive training programs designed by industry experts" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Training Programs</h1>
            <p className="text-red-600 mb-8">Error loading courses: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader title="Training Programs" subtitle="Enhance your media skills with our comprehensive training programs designed by industry experts" />
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{courses.length}+</h3>
            <p className="text-gray-600">Training Programs</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">500+</h3>
            <p className="text-gray-600">Students Trained</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">95%</h3>
            <p className="text-gray-600">Success Rate</p>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const enrolled = isEnrolled(course.id)
            const enrollmentStatus = getEnrollmentStatus(course.id)
            
            return (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="cursor-pointer" onClick={() => navigateToDetails(course.id)}>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {course.mode}
                  </div>
                  <div className="text-lg font-semibold text-green-600">{course.fees}</div>
                  
                  {/* Show enrollment status if enrolled */}
                  {enrolled && enrollmentStatus && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge className={getEnrollmentStatusColor(enrollmentStatus)}>
                        {getEnrollmentStatusText(enrollmentStatus)}
                      </Badge>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigateToDetails(course.id)}>
                    More Info
                  </Button>

                  {enrolled ? (
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      disabled
                      onClick={() => navigateToDetails(course.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enrolled
                    </Button>
                  ) : (
                    <TrainingDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <TrainingDialogTrigger asChild>
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCourse(course)
                            setDialogOpen(true)
                          }}
                        >
                          Enroll Now
                        </Button>
                      </TrainingDialogTrigger>
                      <TrainingDialogContent>
                        <TrainingDialogHeader>
                          <TrainingDialogTitle>Enroll in {selectedCourse?.title}</TrainingDialogTitle>
                        </TrainingDialogHeader>
                        
                        {profileLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : userProfile ? (
                          <div className="space-y-4">
                            {/* Display user info from profile */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Name:</span>
                                <span className="text-sm">{userProfile.full_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Email:</span>
                                <span className="text-sm">{userProfile.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Location:</span>
                                <span className="text-sm">{userProfile.city || userProfile.country || "Not specified"}</span>
                              </div>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                              {/* Only show phone input if user doesn't have a phone number */}
                              {!userProfile.phone && (
                                <div>
                                  <Label htmlFor="mobile">Mobile Number</Label>
                                  <Input 
                                    id="mobile" 
                                    name="mobile" 
                                    required 
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    className="peer"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (!/^\d*$/.test(value)) {
                                        e.target.setCustomValidity('Please enter only numbers');
                                      } else if (value.length !== 10) {
                                        e.target.setCustomValidity('Please enter exactly 10 digits');
                                      } else {
                                        e.target.setCustomValidity('');
                                      }
                                    }}
                                  />
                                  <p className="mt-1 text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block hidden">
                                    Please enter a valid 10-digit mobile number
                                  </p>
                                </div>
                              )}
                              
                              <div>
                                <Label>Are you currently working?</Label>
                                <RadioGroup name="workingStatus" defaultValue="yes" className="flex gap-4 mt-2">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="working-yes" />
                                    <Label htmlFor="working-yes">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="working-no" />
                                    <Label htmlFor="working-no">No</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <div>
                                <Label>Preferred Training Mode</Label>
                                <RadioGroup name="preferredMode" defaultValue="online" className="flex gap-4 mt-2">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="online" id="mode-online" />
                                    <Label htmlFor="mode-online">Online</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="classroom" id="mode-classroom" />
                                    <Label htmlFor="mode-classroom">Classroom</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <Button type="submit" className="w-full" disabled={enrolling}>
                                {enrolling ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enrolling...
                                  </>
                                ) : (
                                  "Submit Enrollment"
                                )}
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600">Please complete your profile to enroll in training programs.</p>
                            <Button 
                              onClick={() => router.push('/profile')} 
                              className="mt-2"
                            >
                              Complete Profile
                            </Button>
                          </div>
                        )}
                      </TrainingDialogContent>
                    </TrainingDialog>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
