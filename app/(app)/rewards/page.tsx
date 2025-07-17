"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Award, Gift, ShoppingBag, Clock, Check, AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { useRewardsDashboard } from "@/hooks/use-rewards-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { useCategoryPoints } from "@/hooks/use-category-points"
import type { Reward } from "@/types/supabase"
import AppHeader from "@/components/ui/AppHeader"

export default function RewardsPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { totalPoints, isLoading: pointsLoading } = useCategoryPoints()
  const {
    rewards,
    featuredRewards,
    userPoints,
    purchasedRewards,
    isLoading: isRewardsLoading,
    isPurchasing,
    purchaseReward,
    refreshData: refreshRewardsData,
  } = useRewardsDashboard()

  // Use userPoints from rewards dashboard for consistency
  const currentPoints = userPoints || totalPoints
  const currentPointsLoading = isRewardsLoading || pointsLoading

  // Manual refresh function for points
  const refreshPointsData = async () => {
    try {
      await Promise.all([
        // Refresh rewards dashboard data (includes userPoints)
        refreshRewardsData(),
        // Note: profile data will be refreshed via the page reload
      ])
    } catch (error) {
      console.error("Error refreshing points data:", error)
    }
  }

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [refreshingPoints, setRefreshingPoints] = useState(false)

  // Filter rewards based on active tab
  const filteredRewards = rewards.filter((reward) => {
    if (activeTab === "all") return true
    return reward.category === activeTab
  })

  // Handle reward selection
  const handleSelectReward = (reward: Reward) => {
    // Don't allow selection if already purchased
    if (isRecentlyPurchased(reward.id)) {
      toast({
        title: "Already Redeemed",
        description: "You have already redeemed this reward.",
        variant: "destructive",
      })
      return
    }
    
    setSelectedReward(reward)
    setConfirmationOpen(true)
    setErrorMessage("")
  }

  // Handle reward redemption
  const handleRedeemReward = async () => {
    if (!selectedReward || isPurchasing) return

    setErrorMessage("")

    try {
      // Attempt to purchase the reward
      await purchaseReward(selectedReward.id)

      // Wait a moment for the data to be refreshed
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh points data to ensure we have the latest balance
      setRefreshingPoints(true)
      await refreshPointsData()
      setRefreshingPoints(false)

      // Close confirmation and show success
      setConfirmationOpen(false)
      setSuccessOpen(true)

      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }, 300)
    } catch (error: any) {
      console.error("Error redeeming reward:", error)
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.")
      setRefreshingPoints(false)
    }
  }

  // Handle carousel navigation
  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredRewards.length)
  }

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredRewards.length) % featuredRewards.length)
  }

  // Check if a reward was recently purchased
  const isRecentlyPurchased = (rewardId: string) => {
    return purchasedRewards.some((purchase) => purchase.reward_id === rewardId)
  }

  const isLoading = isAuthLoading || isRewardsLoading

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader
        title="Rewards Center"
        subtitle="Redeem your points for exclusive rewards and benefits"
        right={
          <div className="flex flex-row-reverse items-center gap-3">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={refreshPointsData}
              disabled={currentPointsLoading}
              className="p-2"
            >
              <RefreshCw className={`h-4 w-4 ${currentPointsLoading ? 'animate-spin' : ''}`} />
            </Button> */}
            <span className="text-lg font-bold text-yellow-600">
              {currentPointsLoading ? <Skeleton className="h-6 w-12" /> : currentPoints}
            </span>
            <Award className="h-5 w-5 text-yellow-600" />
          </div>
        }
      />

      {/* Featured Rewards Carousel */}
      {!isLoading && featuredRewards.length > 0 && (
        <div className="relative mb-8 overflow-hidden rounded-xl">
          <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={prevFeatured}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={nextFeatured}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden">
            {featuredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-6 md:p-10"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: index === featuredIndex ? 1 : 0,
                  x: index === featuredIndex ? 0 : 100,
                  zIndex: index === featuredIndex ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 md:mb-0 md:mr-6 max-w-md">
                  <Badge variant="secondary" className="mb-2">
                    Featured Reward
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{reward.title}</h2>
                  <p className="text-muted-foreground mb-4">{reward.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="font-bold">{reward.price} points</span>
                  </div>
                  <Button
                    onClick={() => handleSelectReward(reward)}
                    disabled={
                      currentPoints < reward.price || 
                      reward.quantity <= 0 || 
                      isPurchasing || 
                      isRecentlyPurchased(reward.id)
                    }
                    className="w-full md:w-auto"
                  >
                    {reward.quantity <= 0
                      ? "Out of Stock"
                      : isRecentlyPurchased(reward.id)
                        ? "Already Redeemed"
                        : currentPoints >= reward.price
                          ? "Redeem Now"
                          : "Not Enough Points"}
                  </Button>
                </div>
                <div className="relative w-full md:w-1/2 h-[150px] md:h-[250px] rounded-lg overflow-hidden">
                  <Image
                    src={reward.image_url || "/placeholder.svg?height=300&width=400&query=Reward"}
                    alt={reward.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {featuredRewards.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === featuredIndex ? "bg-blue-600" : "bg-gray-300"}`}
                onClick={() => setFeaturedIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Rewards Tabs and Grid */}
      {!isLoading && (
        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Rewards</TabsTrigger>
            <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => {
                  const isAffordable = currentPoints >= reward.price
                  const hasBeenRedeemed = isRecentlyPurchased(reward.id)
                  const isOutOfStock = reward.quantity <= 0

                  return (
                    <Card
                      key={reward.id}
                      className={`overflow-hidden transition-all ${
                        isAffordable && !isOutOfStock && !hasBeenRedeemed ? "hover:shadow-md" : "opacity-80"
                      } ${hasBeenRedeemed ? "border-green-400 bg-green-50 dark:bg-green-950/20" : ""}`}
                    >
                      <div className="relative h-48">
                        <Image
                          src={reward.image_url || "/placeholder.svg?height=300&width=400&query=Reward"}
                          alt={reward.title}
                          fill
                          className="object-cover"
                        />
                        {hasBeenRedeemed && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500">Already Redeemed</Badge>
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="bg-red-500">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                        {!isOutOfStock && reward.quantity <= 10 && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="bg-orange-500">
                              Only {reward.quantity} left
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <span>{reward.title}</span>
                          <Badge variant="outline" className="ml-2 whitespace-nowrap">
                            {reward.category}
                          </Badge>
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-600">{reward.price} points</span>
                          </div>

                          {reward.delivery_description && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{reward.delivery_description}</span>
                            </div>
                          )}
                        </div>

                        {!isAffordable && (
                          <div className="mb-4">
                            <Progress value={(currentPoints / reward.price) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              You need {reward.price - currentPoints} more points
                            </p>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          onClick={() => handleSelectReward(reward)}
                          disabled={
                            !isAffordable || 
                            isOutOfStock || 
                            isPurchasing || 
                            hasBeenRedeemed
                          }
                          className="w-full"
                          variant={isAffordable && !isOutOfStock && !hasBeenRedeemed ? "default" : "outline"}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : hasBeenRedeemed
                              ? "Already Redeemed"
                              : isAffordable
                                ? "Redeem Reward"
                                : `Need ${reward.price - currentPoints} More Points`}
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-medium">No rewards found</h3>
                <p className="text-muted-foreground">No rewards available in this category at the moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* How to Earn Points Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-600" />
          How to Earn More Points
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Complete Your Profile</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add your professional details and profile picture to earn 50 points.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
              Go to Profile
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Write Product Reviews</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Earn 25 points for each detailed product review you submit.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push("/reviews")}>
              Write Reviews
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Shop in Kart</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Earn points by posting items or making purchases in our Kart marketplace.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push("/ekart")}>
              Visit Kart
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>You are about to redeem the following reward using your points.</DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="py-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedReward.image_url || "/placeholder.svg?height=300&width=400&query=Reward"}
                    alt={selectedReward.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedReward.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{selectedReward.price} points</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Balance after: {currentPoints - (selectedReward?.price || 0)} points
                </div>
              </div>

              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {selectedReward.delivery_description && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery: {selectedReward.delivery_description}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmationOpen(false)} disabled={isPurchasing}>
              Cancel
            </Button>
            <Button
              onClick={handleRedeemReward}
              disabled={
                isPurchasing ||
                !!errorMessage ||
                !selectedReward ||
                currentPoints < (selectedReward?.price || 0) ||
                (selectedReward?.quantity || 0) <= 0
              }
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Redemption"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Redemption Successful!
            </DialogTitle>
          </DialogHeader>

          {selectedReward && (
            <div className="py-4 text-center">
              <div className="relative h-24 w-24 mx-auto mb-4">
                <Image
                  src={selectedReward.image_url || "/placeholder.svg?height=300&width=400&query=Reward"}
                  alt={selectedReward.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <h3 className="font-medium text-lg mb-2">Thank you for redeeming!</h3>
              <p className="text-muted-foreground mb-4">
                You have successfully redeemed {selectedReward.title} for {selectedReward.price} points.
              </p>

              {selectedReward.category === "merchandise" && (
                <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                  <p className="text-sm">Please check your email for shipping details and tracking information.</p>
                </Alert>
              )}

              {selectedReward.category === "digital" && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <p className="text-sm">Your digital reward has been added to your account and is ready to use.</p>
                </Alert>
              )}

              {selectedReward.category === "experiences" && (
                <Alert className="mb-4 bg-purple-50 text-purple-800 border-purple-200">
                  <p className="text-sm">Check your email for details about your experience and how to schedule it.</p>
                </Alert>
              )}

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <div className="text-sm">Your new balance:</div>
                <div className="font-bold">
                  {refreshingPoints ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    `${currentPoints} points`
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => {
              setSuccessOpen(false)
              // Refresh the page to update all points displays
              window.location.reload()
            }} className="w-full">
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
