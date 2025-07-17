"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Calendar, User } from "lucide-react"
import DynamicIcon from "@/components/dynamic-icon"
import type { ToolMetadata } from "@/lib/tools"
import { getToolComponent, toolExists } from "@/components/toolbox/registry"

export default function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tool, setTool] = useState<ToolMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if the tool exists in our registry
  useEffect(() => {
    if (!toolExists(id)) {
      setError(`Tool "${id}" not found in the registry`)
    }
  }, [id])

  // Fetch tool data
  useEffect(() => {
    const fetchTool = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/tools?id=${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Tool not found in the API")
            return
          }
          throw new Error("Failed to fetch tool")
        }

        const data = await response.json()
        setTool(data)

        // Check if tool is in favorites
        const savedFavorites = localStorage.getItem(" -tools-favorites")
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites)
          setIsFavorite(favorites.includes(id))
        }

        // Add to recently used
        const savedRecent = localStorage.getItem(" -tools-recent") || "[]"
        const recentlyUsed = JSON.parse(savedRecent)
        const newRecent = [id, ...recentlyUsed.filter((item: string) => item !== id)].slice(0, 5)
        localStorage.setItem(" -tools-recent", JSON.stringify(newRecent))
      } catch (error) {
        console.error("Error fetching tool:", error)
        setError("Failed to load tool data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTool()
  }, [id])

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!tool) return

    const savedFavorites = localStorage.getItem(" -tools-favorites") || "[]"
    const favorites = JSON.parse(savedFavorites)

    const newFavorites = isFavorite ? favorites.filter((fav: string) => fav !== id) : [...favorites, id]

    localStorage.setItem(" -tools-favorites", JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  if (isLoading) {
    return <ToolPageSkeleton />
  }

  if (error || !tool) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tool Error</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "Tool not found"}</p>
            <Button onClick={() => router.push("/tools")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tools
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Get the tool component from the registry
  const ToolComponent = getToolComponent(id)

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tool Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/tools")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              className={isFavorite ? "text-yellow-500" : ""}
            >
              <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-yellow-500" : ""}`} />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Button>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <DynamicIcon iconName={tool.iconName} iconColor={tool.iconColor} size={32} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{tool.description}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-gray-50 dark:bg-gray-700">
                    {tag}
                  </Badge>
                ))}
                {tool.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                {tool.version && (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    v{tool.version}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {tool.lastUpdated && (
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Updated: {tool.lastUpdated}
                  </div>
                )}
                {tool.author && (
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    Author: {tool.author}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tool Content */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            {ToolComponent ? (
              <ToolComponent />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  This tool is currently under development. Please check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation Link (For Future Purpose)*/}
        {/* {tool.documentation && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => window.open(tool.documentation, "_blank")}>
              View Documentation
            </Button>
          </div>
        )} */}
      </div>
    </div>
  )
}

// Skeleton loader for tool page
function ToolPageSkeleton() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-36" />
          </div>

          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-lg" />

            <div className="flex-1">
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />

              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
}
