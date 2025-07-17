"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Star,
  Clock,
  Wrench,
  Calculator,
  Video,
  Music,
  Calendar,
  BarChart,
  MessageSquare,
  ExternalLink,
  Lock,
  Unlock,
  Award,
  Zap,
  Sparkles,
  LogIn,
  Thermometer,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import type { ToolMetadata } from "@/lib/tools"
import dynamic from "next/dynamic"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"
import { useToolPurchases } from "@/hooks/use-tool-purchases"
import { useAuth } from "@/contexts/auth-context"
import { useCategoryPoints } from "@/hooks/use-category-points"
import AppHeader from "@/components/ui/AppHeader"
import { toolUsageTracker, getRecentTools, recordToolUsage } from "@/utils/userCache"

// Dynamically import icons to avoid bundling all icons
const LucideIcon = dynamic(() => import("@/components/dynamic-icon"), {
  loading: () => <div className="w-6 h-6 rounded animate-pulse" />,
  ssr: false,
})

// Tool categories
const categories = [
  { id: "all", name: "All Tools", icon: <Wrench className="h-4 w-4" /> },
  { id: "calculators", name: "Calculators", icon: <Calculator className="h-4 w-4" /> },
  { id: "media", name: "Media Tools", icon: <Video className="h-4 w-4" /> },
  { id: "hvac", name: "HVAC & Climate", icon: <Thermometer className="h-4 w-4" /> },
  { id: "certification", name: "Certifications", icon: <Award className="h-4 w-4" /> },
  { id: "media", name: "Media Tools", icon: <Music className="h-4 w-4" /> },
  { id: "communications", name: "Communications", icon: <MessageSquare className="h-4 w-4" /> },
]

// Helper to normalize tool IDs for robust comparison
function normalizeToolId(id: string) {
  return id.trim().toLowerCase()
}

export default function ToolsPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [rawTools, setRawTools] = useState<ToolMetadata[]>([])
  const [rawPremiumTools, setRawPremiumTools] = useState<ToolMetadata[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeView, setActiveView] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [frequentlyUsed, setFrequentlyUsed] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [lockedToolsCount, setLockedToolsCount] = useState(0)

  const { user, isLoading: isAuthLoading } = useAuth()
  const { purchasedToolIds, isLoading: isPurchasesLoading, buyTool, refreshPurchases } = useToolPurchases()
  const { pointsByCategory, totalPoints, isLoading: pointsLoading } = useCategoryPoints()
  const isAuthenticated = !!user && !isAuthLoading

  // Add effect to force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
  }, [])

  // Fetch tools from the API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true)

        // Get favorites
        try {
          const savedFavorites = localStorage.getItem("media-tools-favorites")
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites))
          }
        } catch (error) {
          console.error("Error loading favorites:", error)
        }

        // Get frequently used tools
        try {
          const frequentTools = toolUsageTracker.getFrequentTools()
          setFrequentlyUsed(frequentTools)
        } catch (error) {
          console.error("Error loading frequent tools:", error)
          setFrequentlyUsed([])
        }

        // Fetch regular tools (non-premium) - this should work without authentication
        try {
          const regularToolsResponse = await fetch("/api/tools?premium=false")
          if (!regularToolsResponse.ok) {
            throw new Error("Failed to fetch regular tools")
          }
          const regularTools = await regularToolsResponse.json()
          setRawTools(regularTools)
        } catch (error) {
          console.error("Error fetching regular tools:", error)
          setRawTools([])
        }

        // Fetch premium tools - this should work without authentication
        try {
          const premiumResponse = await fetch("/api/tools?premium=true")
          if (!premiumResponse.ok) {
            throw new Error("Failed to fetch premium tools")
          }
          const premiumData = await premiumResponse.json()
          setRawPremiumTools(premiumData)
        } catch (error) {
          console.error("Error fetching premium tools:", error)
          setRawPremiumTools([])
        }
      } catch (error) {
        console.error("Error in fetchTools:", error)
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading) {
      fetchTools()
    }
  }, [isAuthenticated, isAuthLoading])

  // Process tools based on unlocked status and points - using useMemo to avoid recalculation on every render
  const processedTools = useMemo(() => {
    if (isLoading || rawTools.length === 0 || rawPremiumTools.length === 0) {
      return { regularTools: [], premiumTools: [] }
    }

    // Normalize purchased tool IDs for robust comparison
    const normalizedPurchasedToolIds = purchasedToolIds.map(normalizeToolId)

    if (!isAuthenticated) {
      const premiumToolsWithProgress = rawPremiumTools.map((tool) => ({
        ...tool,
        progress: 0,
      }))
      const regularToolsWithAccess = rawTools.map((tool) => {
        if (tool.pointsRequired === 0) {
          return {
            ...tool,
            progress: 100,
          }
        }
        return {
          ...tool,
          progress: 0,
        }
      })

      return { regularTools: regularToolsWithAccess, premiumTools: premiumToolsWithProgress }
    }

    const premiumToolsWithProgress = rawPremiumTools.map((tool) => ({
      ...tool,
      progress: undefined,
    }))
    const regularToolsWithAccess = rawTools.map((tool) => {
      if (tool.pointsRequired === 0) {
        return {
          ...tool,
          progress: 100,
        }
      }
      if ((tool.pointsRequired || 0) > 0 && !normalizedPurchasedToolIds.includes(normalizeToolId(tool.id))) {
        const pointsRequired = tool.pointsRequired || 100
        const progress = Math.min(Math.floor((totalPoints / pointsRequired) * 100), 100)

        return {
          ...tool,
          progress,
        }
      }
      return {
        ...tool,
        progress: 100,
      }
    })

    return { regularTools: regularToolsWithAccess, premiumTools: premiumToolsWithProgress }
  }, [isLoading, rawTools, rawPremiumTools, totalPoints, purchasedToolIds, isAuthenticated])

  // Memoize locked tools to avoid recalculation on every render
  const lockedTools = useMemo(() => {
    if (isLoading) {
      return []
    }

    // Normalize purchased tool IDs for robust comparison
    const normalizedPurchasedToolIds = purchasedToolIds.map(normalizeToolId)

    if (!isAuthenticated) {
      return [...rawPremiumTools, ...rawTools.filter((tool) => (tool.pointsRequired || 0) > 0)]
    }

    // Only show tools as locked if the user has NOT purchased them, regardless of points
    const lockedPremiumTools = processedTools.premiumTools.filter((tool) => !normalizedPurchasedToolIds.includes(normalizeToolId(tool.id)))
    const lockedNonPremiumTools = rawTools.filter(
      (tool) => !tool.isPremium && (tool.pointsRequired || 0) > 0 && !normalizedPurchasedToolIds.includes(normalizeToolId(tool.id)),
    )

    return [...lockedPremiumTools, ...lockedNonPremiumTools]
  }, [processedTools.premiumTools, rawTools, rawPremiumTools, purchasedToolIds, isLoading, isAuthenticated])

  useEffect(() => {
    setLockedToolsCount(lockedTools.length)
  }, [lockedTools])

  // Memoize favorite tools to avoid recalculation on every render
  const favoriteTools = useMemo(() => {
    if (isLoading || !isAuthenticated) {
      return []
    }

    const regularFavorites = processedTools.regularTools.filter((tool) => favorites.includes(tool.id))
    const premiumFavorites = processedTools.premiumTools.filter(
      (tool) => favorites.includes(tool.id) && purchasedToolIds.includes(tool.id),
    )

    return [...regularFavorites, ...premiumFavorites]
  }, [
    processedTools.regularTools,
    processedTools.premiumTools,
    favorites,
    purchasedToolIds,
    isLoading,
    isAuthenticated,
  ])

  // Filter tools based on search query and active category - using useMemo to avoid recalculation on every render
  const filteredToolsResult = useMemo(() => {
    if (isLoading) {
      return []
    }

    // Normalize purchased tool IDs for robust comparison
    const normalizedPurchasedToolIds = purchasedToolIds.map(normalizeToolId)

    // Get the appropriate tool list based on active view
    let baseTools: ToolMetadata[] = []
    
    if (activeView === "all") {
      if (!isAuthenticated) {
        baseTools = processedTools.regularTools.filter((tool) => tool.pointsRequired === 0)
      } else {
        baseTools = processedTools.regularTools.filter(
          (tool) => tool.pointsRequired === 0 || normalizedPurchasedToolIds.includes(normalizeToolId(tool.id)),
        )
        // Also include purchased premium tools, but avoid duplicates
        const purchasedPremiumTools = processedTools.premiumTools.filter(
          (tool) => normalizedPurchasedToolIds.includes(normalizeToolId(tool.id))
        )
        // Filter out any premium tools that are already in baseTools to avoid duplicates
        const uniquePremiumTools = purchasedPremiumTools.filter(
          (premiumTool) => !baseTools.some((baseTool) => baseTool.id === premiumTool.id)
        )
        baseTools = [...baseTools, ...uniquePremiumTools]
      }
    } else if (activeView === "favorites" && isAuthenticated) {
      baseTools = favoriteTools
    } else if (activeView === "frequent" && isAuthenticated) {
      baseTools = frequentlyUsed
        .map((id) => {
          const regularTool = processedTools.regularTools.find((tool) => tool.id === id)
          const premiumTool = processedTools.premiumTools.find(
            (tool) => tool.id === id && purchasedToolIds.includes(tool.id),
          )
          return regularTool || premiumTool
        })
        .filter(Boolean) as ToolMetadata[]
    } else if (activeView === "locked") {
      baseTools = lockedTools
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      baseTools = baseTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Apply category filter (only for "all" view)
    if (activeView === "all" && activeCategory !== "all") {
      baseTools = baseTools.filter((tool) => tool.category.includes(activeCategory))
    }

    return baseTools
  }, [searchQuery, activeCategory, activeView, processedTools.regularTools, processedTools.premiumTools, purchasedToolIds, isLoading, isAuthenticated, favoriteTools, lockedTools])

  const filteredLockedTools = useMemo(() => {
    // Show locked tools in both "all" and "locked" views
    if (activeView !== "all" && activeView !== "locked") {
      return []
    }
    
    return lockedTools
      .filter((tool) => activeCategory === "all" || tool.category.includes(activeCategory))
      .filter(
        (tool) =>
          !searchQuery ||
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
  }, [lockedTools, activeCategory, searchQuery, activeView])

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      })
      return
    }

    const newFavorites = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem("media-tools-favorites", JSON.stringify(newFavorites))
  }

  // Track tool usage
  const trackToolUsage = (id: string) => {
    const tool = [...rawTools, ...rawPremiumTools].find((t) => t.id === id)
    if (!tool) return

    if (!isAuthenticated && (tool.pointsRequired || 0) > 0) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this tool",
        variant: "destructive",
      })
      router.push("/login?redirect=/tools")
      return
    }

    // Record usage in the enhanced cache system
    recordToolUsage(id)
    
    // Update the frequent tools list
    const newFrequent = toolUsageTracker.getFrequentTools()
    setFrequentlyUsed(newFrequent)

    router.push(`/tools/${id}`)
  }

  // Unlock a tool
  const unlockTool = async (id: string, pointsRequired: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to unlock tools",
        variant: "destructive",
      })
      router.push("/login?redirect=/tools")
      return
    }

    const toolToUnlock = [...rawTools, ...rawPremiumTools].find((tool) => tool.id === id)

    if (!toolToUnlock) {
      toast({
        title: "Error",
        description: "Tool not found",
        variant: "destructive",
      })
      return
    }

    if (purchasedToolIds.includes(id)) {
      toast({
        title: "Already Unlocked",
        description: "You already own this tool.",
      })
      return
    }

    setIsPurchasing(true)
    try {
      const result = await buyTool(toolToUnlock)
      if (result) {
        await refreshPurchases()
        toast({
          title: "Tool Unlocked",
          description: `You have unlocked ${toolToUnlock.name}`,
        })
      }
    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: "An error occurred while unlocking the tool.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleLoginRedirect = () => {
    router.push("/login?redirect=/tools")
  }

  return (
    <div className="min-h-screen pb-8 light-mode-only">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader 
          title="Media Tools" 
          subtitle="Access calculators, utilities, and more"
          right={
            isAuthenticated ? (
              <div className="flex flex-row-reverse items-center gap-3">
                <span className="text-lg font-bold text-yellow-600">
                  {pointsLoading ? <Skeleton className="h-6 w-12" /> : totalPoints}
                </span>
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            ) : (
              <>
                <div className="p-2 bg-blue-100 rounded-full">
                  <LogIn className="h-5 w-5 text-blue-600" />
                </div>
                <Button onClick={handleLoginRedirect} className="bg-blue-600 hover:bg-blue-700 text-sm">
                  Sign In
                </Button>
              </>
            )
          }
        />

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search tools..."
              className="pl-10 bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Combined View and Category Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {/* Main View Tabs */}
              <Button
                variant={activeView === "all" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap mb-2"
                onClick={() => setActiveView("all")}
              >
                <Wrench className="h-4 w-4" />
                <span>All Tools</span>
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button
                    variant={activeView === "favorites" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap mb-2"
                    onClick={() => setActiveView("favorites")}
                  >
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Favorites ({favorites.length})</span>
                  </Button>
                  <Button
                    variant={activeView === "frequent" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap mb-2"
                    onClick={() => setActiveView("frequent")}
                  >
                    <BarChart className="h-4 w-4 text-green-500" />
                    <span>Frequent</span>
                  </Button>
                </>
              )}
              
              <Button
                variant={activeView === "locked" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap mb-2"
                onClick={() => setActiveView("locked")}
              >
                <Lock className="h-4 w-4 text-gray-500" />
                <span>Locked ({lockedToolsCount})</span>
              </Button>

              {/* Category Filter - Only show for "all" view */}
              {activeView === "all" && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-2 mb-2"></div>
                  {categories.slice(1).map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-2 whitespace-nowrap mb-2"
                      onClick={() => setActiveCategory(activeCategory === category.id ? "all" : category.id)}
                    >
                      {category.icon}
                      <span>{isMobile && category.id !== "all" ? "" : category.name}</span>
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Content based on active view */}
          {activeView === "favorites" && isAuthenticated && (
            <div>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredToolsResult.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={true}
                      onFavoriteToggle={toggleFavorite}
                      onToolClick={trackToolUsage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Click the star icon on any tool to add it to your favorites for quick access
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === "frequent" && isAuthenticated && (
            <div>
              {frequentlyUsed.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredToolsResult.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={favorites.includes(tool.id)}
                      onFavoriteToggle={toggleFavorite}
                      onToolClick={trackToolUsage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No frequent tools</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Tools you use frequently will appear here for quick access
                  </p>
                </div>
              )}
            </div>
          )}

          {activeView === "locked" && (
            <div>
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full flex-shrink-0 mt-1">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Locked Tools</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isAuthenticated
                        ? "Unlock advanced tools by earning points through completing projects, participating in training, and contributing to the community."
                        : "Sign in to unlock premium tools with your points."}
                    </p>
                  </div>
                  {!isAuthenticated && (
                    <Button onClick={handleLoginRedirect} className="bg-blue-600 hover:bg-blue-700 ml-auto">
                      Sign In
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredToolsResult.map((tool) => (
                  <LockedToolCard
                    key={tool.id}
                    tool={tool}
                    userPoints={totalPoints}
                    onUnlock={unlockTool}
                    isPurchasing={isPurchasing}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </div>
          )}

          {activeView === "all" && (
            <div>
              {/* Tools Grid */}
              {isLoading || isAuthLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ToolCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Regular Tools Section */}
                  {filteredToolsResult.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredToolsResult.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          isFavorite={favorites.includes(tool.id)}
                          onFavoriteToggle={toggleFavorite}
                          onToolClick={trackToolUsage}
                          isPremium={tool.isPremium}
                        />
                      ))}
                    </div>
                  ) : filteredLockedTools.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : null}

                  {/* Locked Tools Section */}
                  {filteredLockedTools.length > 0 && (
                    <>
                      {(filteredToolsResult.length > 0) && (
                        <div className="flex items-center my-8">
                          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                          <div className="mx-4 flex items-center">
                            <Lock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Locked Tools</span>
                          </div>
                          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredLockedTools.map((tool) => (
                          <LockedToolCard
                            key={tool.id}
                            tool={tool}
                            userPoints={totalPoints}
                            onUnlock={unlockTool}
                            isPurchasing={isPurchasing}
                            isAuthenticated={isAuthenticated}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({
  tool,
  isFavorite,
  onFavoriteToggle,
  onToolClick,
  isPremium = false,
}: {
  tool: ToolMetadata
  isFavorite: boolean
  onFavoriteToggle: (id: string) => void
  onToolClick: (id: string) => void
  isPremium?: boolean
}) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden h-full bg-white hover:shadow-md transition-shadow ${isPremium ? "border-2 border-yellow-400" : ""}`}
      >
        <CardContent className="p-0 flex flex-col h-full">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${isPremium ? "bg-yellow-100" : "bg-gray-100"}`}>
                <LucideIcon iconName={tool.iconName} iconColor={tool.iconColor} />
              </div>
              <div className="flex items-center gap-2">
                {isPremium && <Badge className="bg-yellow-500 text-white">Premium</Badge>}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onFavoriteToggle(tool.id)
                  }}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                </button>
              </div>
            </div>

            <h3 className="font-medium text-lg text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{tool.description}</p>

            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                  {tag}
                </Badge>
              ))}
              {tool.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
              {tool.version && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                  v{tool.version}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-100">
            <Button
              variant={isPremium ? "ghost" : "ghost"}
              className={`w-full rounded-none h-14 flex items-center justify-center ${
                isPremium
                  ? "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  : "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              }`}
              onClick={() => onToolClick(tool.id)}
            >
              Open Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Locked Tool Card Component
function LockedToolCard({
  tool,
  userPoints,
  onUnlock,
  isPurchasing,
  isAuthenticated,
}: {
  tool: ToolMetadata
  userPoints: number
  onUnlock: (id: string, pointsRequired: number) => void
  isPurchasing: boolean
  isAuthenticated: boolean
}) {
  const pointsRequired = tool.pointsRequired || 0
  const progress = typeof tool.progress === "number" ? tool.progress : undefined
  const canUnlock = isAuthenticated && userPoints >= pointsRequired

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden h-full bg-gray-100 hover:shadow-md transition-shadow relative">
        {/* Lock Overlay */}
        <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
          <div className="p-3 bg-white rounded-full shadow-lg mb-3">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <div className="text-center px-4">
            <h4 className="font-medium text-gray-900 mb-1">Required Points</h4>
            <div className="flex items-center justify-center gap-1 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xl font-bold text-yellow-600">{pointsRequired}</span>
            </div>

            {isAuthenticated && progress !== undefined && (
              <div className="mb-3 w-full max-w-[200px] mx-auto">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={() => onUnlock(tool.id, pointsRequired)}
              disabled={!canUnlock || isPurchasing}
              className={canUnlock ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
            >
              {!isAuthenticated ? (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Unlock
                </>
              ) : isPurchasing ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : canUnlock ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Now
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {userPoints > 0 ? `Need ${pointsRequired - userPoints} more points` : "Earn Points to Unlock"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tool Card (Blurred Background) */}
        <CardContent className="p-0 opacity-70 flex flex-col h-full">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                <LucideIcon iconName={tool.iconName} iconColor={tool.iconColor} />
              </div>
              <div>
                <Badge className="bg-yellow-500/50 text-white">Premium</Badge>
              </div>
            </div>

            <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{tool.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{tool.description}</p>

            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-gray-200 dark:bg-gray-700">
                  {tag}
                </Badge>
              ))}
              {tool.isNew && <Badge className="bg-green-500/50 text-white">New</Badge>}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="w-full h-14 flex items-center justify-center text-gray-400">Locked</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Skeleton loader for tool cards
function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full bg-white dark:bg-gray-800">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 dark:border-gray-700">
          <Skeleton className="h-14 w-full rounded-none" />
        </div>
      </CardContent>
    </Card>
  )
}
