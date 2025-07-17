"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { PulsingBadge } from "@/components/ui/pulsing-badge"

export default function SponsorsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }))

  // Sample sponsor logos - these would be replaced with actual sponsor logos
  const sponsors = [
    { id: 1, name: "Logitech", logo: "/placeholder.svg?key=sgvsw" },
    { id: 2, name: "Poly", logo: "/placeholder.svg?key=m0fyh" },
    { id: 3, name: "Crestron", logo: "/placeholder.svg?key=ude8e" },
    { id: 4, name: "Extron", logo: "/placeholder.svg?key=skbmi" },
    { id: 5, name: "Shure", logo: "/placeholder.svg?key=8ma3m" },
    { id: 6, name: "Biamp", logo: "/placeholder.svg?key=bow3p" },
    { id: 7, name: "Barco", logo: "/placeholder.svg?key=gl578" },
    { id: 8, name: "Zoom", logo: "/abstract-zoom.png" },
    { id: 9, name: "Microsoft", logo: "/microsoft-campus.png" },
    { id: 10, name: "Cisco", logo: "/cisco-logo.png" },
  ]

  return (
    <section className="py-10 md:py-16 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gray-100 dark:bg-gray-800/50 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gray-100 dark:bg-gray-800/50 rounded-full filter blur-3xl opacity-30"></div>
      </div>

      <div ref={ref} className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <PulsingBadge className="mb-4">Our Partners</PulsingBadge>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're proud to partner with leading brands in the   industry to bring you the best resources and
            opportunities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sponsors.map((sponsor) => (
                <CarouselItem
                  key={sponsor.id}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="p-4 h-24 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <Image
                      src={sponsor.logo || "/placeholder.svg"}
                      alt={`${sponsor.name} logo`}
                      width={180}
                      height={60}
                      className="max-h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
}
