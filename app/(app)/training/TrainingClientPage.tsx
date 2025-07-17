"use client"

import type React from "react"
import { Suspense } from "react"
import { getTrainingPrograms } from "@/lib/training-service"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TrainingDialog, TrainingDialogContent, TrainingDialogHeader, TrainingDialogTitle } from "@/components/ui/training-dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTrainingEnrollment } from "@/hooks/use-training"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

async function TrainingContent() {
  const courses = await getTrainingPrograms()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Platform Training Programs</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enhance your skills with our specialized media training programs designed by industry experts.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            No training programs available at the moment. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={course.image_url || "/placeholder.svg?height=300&width=400&query=media%20course"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Mode</span>
                    <p className="font-medium">{course.mode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Fees</span>
                    <p className="font-medium">{course.fees}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                    Enroll Now
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded transition-colors">
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrainingPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="flex space-x-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default function TrainingClientPage() {
  const { enrollInProgram, enrolling } = useTrainingEnrollment()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      await enrollInProgram({
        program_id: formData.get("programId") as string,
        full_name: formData.get("fullName") as string,
        email: formData.get("email") as string,
        mobile_number: formData.get("mobile") as string,
        location: formData.get("location") as string,
        working_status: formData.get("working") as "yes" | "no",
        preferred_mode: formData.get("training") as "online" | "classroom",
      })

      toast({
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in the training program.",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "There was an error processing your enrollment. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <Image src="/media-training.png" alt="Media Training" fill className="object-cover" priority />
        </div>
        <div className="container relative z-10 py-20 px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Elevate Your Media Skills</h1>
            <p className="text-xl opacity-90 mb-8">
              Professional training programs designed by industry experts to advance your career in media
              technology
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.scrollTo({ top: 500, behavior: "smooth" })}
            >
              Explore Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<TrainingPageSkeleton />}>
        <TrainingContent />
      </Suspense>

      {/* Registration Dialog */}
      <TrainingDialog open={false} onOpenChange={() => {}}>
        <TrainingDialogContent className="sm:max-w-md">
          <TrainingDialogHeader>
            <TrainingDialogTitle className="text-2xl font-bold text-center text-primary">Registration Form</TrainingDialogTitle>
          </TrainingDialogHeader>

          <div className="absolute -z-10 inset-0 overflow-hidden rounded-lg">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full filter blur-2xl opacity-30"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-2xl opacity-30"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 py-4 relative">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                name="fullName"
                id="fullName"
                placeholder="Enter your full name"
                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                name="mobile"
                id="mobile"
                placeholder="Enter your mobile number"
                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Location/City <span className="text-red-500">*</span>
              </Label>
              <Input
                name="location"
                id="location"
                placeholder="Enter your city"
                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13h-18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Working Status
                </Label>
                <RadioGroup name="working" defaultValue="yes" className="flex gap-4 pt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="working-yes" className="text-primary" />
                    <Label htmlFor="working-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="working-no" className="text-primary" />
                    <Label htmlFor="working-no" className="text-sm">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Preferred Training Mode
                </Label>
                <RadioGroup name="training" defaultValue="online" className="flex gap-4 pt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="training-online" className="text-primary" />
                    <Label htmlFor="training-online" className="text-sm">
                      Online
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="classroom" id="training-classroom" className="text-primary" />
                    <Label htmlFor="training-classroom" className="text-sm">
                      Classroom
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Your information is secure and will only be used to contact you about the course.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {}}
                className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={enrolling}
                className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm hover:shadow"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </div>
          </form>
        </TrainingDialogContent>
      </TrainingDialog>
    </div>
  )
}
