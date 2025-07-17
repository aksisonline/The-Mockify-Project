"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOutsideClick } from "@/hooks/use-outside-click"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import type { Event } from "@/lib/events-service"

interface ExpandableEventCardProps {
  events: Event[]
  selectedCategory: string | null
}

export default function ExpandableEventCard({ events, selectedCategory }: ExpandableEventCardProps) {
  const [active, setActive] = useState<Event | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  const filteredEvents = selectedCategory ? events.filter((event) => event.category === selectedCategory) : events

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null)
      }
    }

    if (active) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(null))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-8 w-8 z-10"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-[600px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              <motion.div layoutId={`image-${active.id}-${id}`}>
                <img
                  width={600}
                  height={300}
                  src={active.image_url || "/placeholder.svg"}
                  alt={active.title}
                  className="w-full h-60 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover"
                />
              </motion.div>

              <div className="flex-1 overflow-auto">
                <div className="flex justify-between items-start p-6">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-2xl text-neutral-700 dark:text-neutral-200 mb-2"
                    >
                      {active.title}
                    </motion.h3>

                    <motion.p
                      layoutId={`description-${active.id}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 mb-4"
                    >
                      {active.description}
                    </motion.p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${getCategoryColor(active.category)} text-white border-0`}>
                        {active.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(active.start_date)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <MapPin className="h-4 w-4" />
                        {active.location}
                      </div>
                    </div>
                  </div>

                  <motion.a
                    layoutId={`button-${active.id}-${id}`}
                    href={active.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-sm rounded-full font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 ml-4"
                  >
                    Register
                    <ExternalLink className="h-4 w-4" />
                  </motion.a>
                </div>

                <div className="px-6 pb-6">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-sm md:text-base dark:text-neutral-400"
                  >
                    <div className="prose prose-sm max-w-none">
                      {active.content.split("\n").map((paragraph, index) => (
                        <p key={index} className="mb-3">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            layoutId={`card-${event.id}-${id}`}
            key={`card-${event.id}-${id}`}
            onClick={() => setActive(event)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
            whileHover={{ y: -5 }}
          >
            <motion.div layoutId={`image-${event.id}-${id}`}>
              <img
                width={400}
                height={200}
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge className={`${getCategoryColor(event.category)} text-white border-0`}>{event.category}</Badge>
                {event.is_featured && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                    Featured
                  </Badge>
                )}
              </div>

              <motion.h3
                layoutId={`title-${event.id}-${id}`}
                className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-2 group-hover:text-purple-600 transition-colors"
              >
                {event.title}
              </motion.h3>

              <motion.p
                layoutId={`description-${event.id}-${id}`}
                className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2"
              >
                {event.description}
              </motion.p>

              <div className="space-y-2 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.start_date)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              </div>

              <motion.button
                layoutId={`button-${event.id}-${id}`}
                className="w-full mt-4 px-4 py-2 text-sm rounded-full font-medium bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 transition-all duration-200"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  )
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  )
}
