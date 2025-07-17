"use client"
import { Suspense } from "react"
import { getTrainingPrograms } from "@/lib/training-service"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function ClientTrainingPage() {
  return (
    <Suspense fallback={<TrainingPageSkeleton />}>
      <TrainingContent />
    </Suspense>
  )
}

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
