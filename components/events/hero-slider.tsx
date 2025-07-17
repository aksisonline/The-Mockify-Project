"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, MapPin, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/events-service"

interface HeroSliderProps {
  featuredEvents: Event[]
}

export default function HeroSlider({ featuredEvents }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (featuredEvents.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredEvents.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [featuredEvents.length])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredEvents.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredEvents.length) % featuredEvents.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Conference: "bg-gradient-to-r from-purple-500 to-pink-500",
      Workshop: "bg-gradient-to-r from-blue-500 to-cyan-500",
      Masterclass: "bg-gradient-to-r from-green-500 to-emerald-500",
      Bootcamp: "bg-gradient-to-r from-orange-500 to-red-500",
      Certification: "bg-gradient-to-r from-yellow-500 to-amber-500",
      Festival: "bg-gradient-to-r from-indigo-500 to-purple-500",
      Seminar: "bg-gradient-to-r from-pink-500 to-rose-500",
    }
    return colors[category as keyof typeof colors] || "bg-gradient-to-r from-gray-500 to-gray-600"
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="relative h-[500px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">No Featured Events</h2>
          <p className="text-lg opacity-90">Check back soon for exciting upcoming events!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={featuredEvents[currentIndex]?.image_url || "/placeholder.svg"}
            alt={featuredEvents[currentIndex]?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl text-white"
              >
                <Badge
                  className={`${getCategoryColor(featuredEvents[currentIndex]?.category)} text-white border-0 mb-4`}
                >
                  {featuredEvents[currentIndex]?.category}
                </Badge>

                <h2 className="text-4xl md:text-5xl font-bold mb-4">{featuredEvents[currentIndex]?.title}</h2>

                <p className="text-lg md:text-xl mb-6 opacity-90">{featuredEvents[currentIndex]?.description}</p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formatDate(featuredEvents[currentIndex]?.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{featuredEvents[currentIndex]?.location}</span>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                >
                  <a
                    href={featuredEvents[currentIndex]?.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Register Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {featuredEvents.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredEvents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featuredEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
