"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrainingDialog, TrainingDialogContent, TrainingDialogHeader, TrainingDialogTitle, TrainingDialogTrigger } from "@/components/ui/training-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, Monitor, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { TrainingProgram } from "@/lib/training-service"
import AppHeader from "@/components/ui/AppHeader"

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const router = useRouter()
  const [course, setCourse] = useState<TrainingProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/training/programs/${courseId}`)

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const data = await response.json()
        setCourse(data)
      } catch (err: any) {
        console.error("Error fetching course:", err)
        setError(err.message || "Failed to load course")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleEnrollment = async (formData: FormData) => {
    if (!course) return

    try {
      const enrollmentData = {
        program_id: course.id,
        full_name: formData.get("fullName") as string,
        email: formData.get("email") as string,
        mobile_number: formData.get("mobile") as string,
        location: formData.get("location") as string,
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

      alert("Enrollment successful! We will contact you soon.")
      setIsRegistrationOpen(false)
    } catch (err: any) {
      alert(err.message || "Failed to enroll. Please try again.")
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

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/training")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to all courses
          </Button>

          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <Skeleton className="h-64 w-full" />
            <div className="p-6">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-6" />

              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-6" />

              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/training")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to all courses
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-red-600 mb-8">{error || "The requested course could not be found."}</p>
            <Button onClick={() => router.push("/training")}>View All Courses</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/training")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to all courses
        </Button>

        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64">
            <Image
              src={course.image_url || "/placeholder.svg?height=300&width=800&query=training%20course"}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-white/90">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    <span>{course.mode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Course Fees:</span> {course.fees}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                {course.instructors && <TabsTrigger value="instructors">Instructors</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Course Description</h2>
                  <p className="text-gray-600">{course.description || course.topics}</p>
                </div>

                {course.learning_outcomes && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Learning Outcomes</h2>
                    <ul className="space-y-2">
                      {course.learning_outcomes.map((outcome: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="curriculum">
                {course.weekly_curriculum ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Program Summary</h2>
                    <div className="space-y-3">
                      {course.weekly_curriculum.map((week: any) => (
                        <div key={week.number} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-blue-600">
                            Week {week.number}: {week.title}
                          </h3>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Detailed curriculum information is not available for this course.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requirements">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {course.hardware_requirements && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">HARDWARE</h3>
                      <ul className="space-y-2">
                        {course.hardware_requirements.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.software_requirements && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">SOFTWARE</h3>
                      <ul className="space-y-2">
                        {course.software_requirements.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.advantages && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">ADVANTAGES</h3>
                      <ul className="space-y-2">
                        {course.advantages.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!course.hardware_requirements && !course.software_requirements && !course.advantages && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Detailed requirements information is not available for this course.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="instructors">
                {course.instructors ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">Meet Your Instructors</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {course.instructors.map((instructor: any, index: number) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                          <div className="w-16 h-16 rounded-full overflow-hidden relative">
                            <Image
                              src={instructor.image || "/placeholder.svg?height=100&width=100&query=instructor"}
                              alt={instructor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{instructor.name}</h3>
                            <p className="text-blue-600 text-sm">{instructor.role}</p>
                            <p className="text-gray-600 text-sm mt-1">{instructor.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Instructor information is not available for this course.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mt-8">
              <TrainingDialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
                <TrainingDialogTrigger asChild>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsRegistrationOpen(true)}
                  >
                    Enroll Now
                  </Button>
                </TrainingDialogTrigger>
                <TrainingDialogContent>
                  <TrainingDialogHeader>
                    <TrainingDialogTitle>Enroll in {course.title}</TrainingDialogTitle>
                  </TrainingDialogHeader>
                  <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        required 
                        pattern="[A-Za-z\s]+"
                        className="peer"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^[A-Za-z\s]*$/.test(value)) {
                            e.target.setCustomValidity('Please enter only letters and spaces');
                          } else {
                            e.target.setCustomValidity('');
                          }
                        }}
                      />
                      <p className="mt-1 text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block hidden">
                        Please enter only letters and spaces
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        className="peer"
                      />
                      <p className="mt-1 text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block hidden">
                        Please enter a valid email address
                      </p>
                    </div>
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
                    <div>
                      <Label htmlFor="location">Location/City</Label>
                      <Input id="location" name="location" required />
                    </div>
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
                </TrainingDialogContent>
              </TrainingDialog>

              <Button variant="outline" className="flex-1" onClick={() => router.push("/training")}>
                View All Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
