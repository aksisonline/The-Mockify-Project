import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import ContentWrapper from "@/components/ContentWrapper"

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen">
      <ContentWrapper>
        {/* Back button */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <Skeleton className="h-10 w-32 mb-6" />
        </div>

        {/* Event Header */}
        <div className="relative w-full bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white overflow-hidden rounded-3xl mb-12">
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-12 w-full mb-3" />
                <Skeleton className="h-12 w-3/4 mb-6" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3 mb-8" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-12 w-40" />
                </div>
              </div>

              <div className="md:w-1/3 flex items-center justify-center">
                <Skeleton className="h-80 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-8">
                  <Skeleton className="h-8 w-48 mb-6" />

                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />

                    <Skeleton className="h-6 w-40 mt-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />

                    <Skeleton className="h-6 w-40 mt-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-0 shadow-sm overflow-hidden mt-8">
                <CardContent className="p-8">
                  <Skeleton className="h-8 w-32 mb-6" />

                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              {/* Event Details Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden mb-8">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />

                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Related Events */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div>
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </div>
  )
}
