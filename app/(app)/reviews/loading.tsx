import AppHeader from "@/components/ui/AppHeader"
import { Button } from "@/components/ui/button"

export default function Loading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader 
        title="Reviews" 
        subtitle="Explore and share product experiences"
        right={
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 w-40 h-12 animate-pulse"></div>
        }
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex min-h-screen">
          <div className="flex-1 dark:bg-gray-900 min-h-screen">
            <div className="py-8">
              <div className="animate-pulse">
                {/* Main Content with Sidebar Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Sidebar Skeleton */}
                  <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-24">
                      {/* Categories Skeleton */}
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Skeleton */}
                  <div className="flex-1">
                    {/* Search Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>

                    {/* Trending Brands Skeleton */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>

                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                  </div>
                                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
