"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function GuidedTour() {
  const [showTour, setShowTour] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const tourSteps = [
    {
      title: "Welcome to Mockify!",
      description:
        "This quick tour will help you navigate our website. Click 'Next' to continue or 'Skip' to exit the tour.",
      position: "center",
    },
    {
      title: "Navigation Menu",
      description: "Use the menu at the top to access different sections of our website.",
      position: "top",
      target: "header",
    },
    {
      title: "Our Services",
      description: "Explore our comprehensive range of services designed for professionals.",
      position: "bottom",
      target: "features-section",
    },
    {
      title: "Community Testimonials",
      description: "Read what our community members are saying about their experience with Mockify.",
      position: "bottom",
      target: "testimonials",
    },
    {
      title: "Get in Touch",
      description: "Have questions? Contact us using the form in this section.",
      position: "top",
      target: "contact",
    },
    {
      title: "Need Help?",
      description: "Click the chat icon in the bottom right corner to get instant assistance from our   Bot.",
      position: "left",
      target: "chat-bot",
    },
  ]

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem("mockify-tour-completed")

    if (!hasSeenTour) {
      // Wait a bit before showing the tour
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)

      // Scroll to the target element if specified
      if (tourSteps[currentStep + 1].target) {
        const element = document.getElementById(tourSteps[currentStep + 1].target)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)

      // Scroll to the target element if specified
      if (tourSteps[currentStep - 1].target) {
        const element = document.getElementById(tourSteps[currentStep - 1].target)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  const completeTour = () => {
    setShowTour(false)
    localStorage.setItem("mockify-tour-completed", "true")
  }

  const getPositionStyles = (position: string) => {
    switch (position) {
      case "top":
        return "bottom-full mb-4"
      case "bottom":
        return "top-full mt-4"
      case "left":
        return "right-full mr-4"
      case "right":
        return "left-full ml-4"
      default:
        return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    }
  }

  if (!showTour) return null

  return (
    <AnimatePresence>
      {showTour && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" onClick={completeTour} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-lg shadow-xl p-6 max-w-md pointer-events-auto ${
              tourSteps[currentStep].position === "center"
                ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                : `absolute ${getPositionStyles(tourSteps[currentStep].position)}`
            }`}
          >
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={completeTour}>
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-avblue mb-2">{tourSteps[currentStep].title}</h3>
              <p className="text-gray-600">{tourSteps[currentStep].description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-avblue" : "bg-gray-300"}`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}

                {currentStep < tourSteps.length - 1 ? (
                  <Button size="sm" className="bg-avblue hover:bg-avblue/90" onClick={handleNext}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" className="bg-avblue hover:bg-avblue/90" onClick={completeTour}>
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
