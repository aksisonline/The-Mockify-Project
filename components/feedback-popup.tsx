"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, ThumbsDown, X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface FeedbackPopupProps {
  toolId: string
  toolName: string
  onClose: () => void
}

export default function FeedbackPopup({ toolId, toolName, onClose }: FeedbackPopupProps) {
  const hasFeedbackBeenSubmitted = (toolId: string): boolean => {
    if (typeof window === "undefined") return false

    const submittedFeedback = localStorage.getItem(" -tools-feedback-submitted")
    if (!submittedFeedback) return false

    const submittedTools = JSON.parse(submittedFeedback)
    return submittedTools.includes(toolId)
  }

  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null)
  const [comment, setComment] = useState("")
  const [showComment, setShowComment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Close popup when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  // Add this useEffect after the other useEffect in the component
  useEffect(() => {
    // Check if feedback has already been submitted for this tool
    if (hasFeedbackBeenSubmitted(toolId)) {
      onClose()
    }
  }, [toolId, onClose])

  const handleFeedback = (type: "like" | "dislike") => {
    setFeedback(type)
    setShowComment(true)
  }

  const handleSubmit = async () => {
    if (!feedback) return

    setIsSubmitting(true)

    try {
      // In a real app, you would send this data to your backend
      // console.log("Submitting feedback:", {
      //   toolId,
      //   toolName,
      //   feedback,
      //   comment,
      //   timestamp: new Date().toISOString(),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage that feedback has been submitted for this tool
      const submittedFeedback = localStorage.getItem(" -tools-feedback-submitted") || "[]"
      const submittedTools = JSON.parse(submittedFeedback)
      if (!submittedTools.includes(toolId)) {
        submittedTools.push(toolId)
        localStorage.setItem(" -tools-feedback-submitted", JSON.stringify(submittedTools))
      }

      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our tools.",
      })

      onClose()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">How was your experience?</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {showComment
                ? `Thanks for your ${feedback === "like" ? "positive" : "negative"} feedback!`
                : `Did you find the ${toolName} helpful?`}
            </p>
          </div>

          {!showComment ? (
            <div className="flex justify-center gap-8 mb-8">
              <Button
                variant="outline"
                size="icon"
                className={`w-16 h-16 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                  feedback === "like"
                    ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleFeedback("like")}
              >
                <ThumbsUp className={`h-8 w-8 ${feedback === "like" ? "text-green-500" : "text-green-500"}`} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`w-16 h-16 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                  feedback === "dislike"
                    ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleFeedback("dislike")}
              >
                <ThumbsDown className={`h-8 w-8 ${feedback === "dislike" ? "text-red-500" : "text-red-500"}`} />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare className="h-5 w-5" />
                <span>Would you like to share more details?</span>
              </div>

              <Textarea
                placeholder={feedback === "like" ? "What did you like about it?" : "How can we improve?"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 resize-none"
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => handleSubmit()}>
                  Skip
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
