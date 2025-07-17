"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

export function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="space-y-6">
          {/* Profile header skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-5 w-80" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-2" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Public Profile Toggle skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-blue-100 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content - Tabbed Interface skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Tabs skeleton */}
              <div className="flex space-x-1 p-1 bg-gray-50 rounded-t-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-28" />
                ))}
              </div>
              
              {/* Tab content skeleton */}
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Section header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>

                  {/* Form fields skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>

                  {/* Additional sections skeleton */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <Skeleton className="h-5 w-40 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <Skeleton className="h-5 w-40 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons skeleton */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
