"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { PulsingBadge } from "@/components/ui/pulsing-badge"

export default function HeroSection() {
  const [videoPlaying, setVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setVideoPlaying(!videoPlaying)
    }
  }

  const scrollToNextSection = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full filter blur-3xl opacity-50"></div>

        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>

        <svg
          className="absolute bottom-0 left-0 right-0 text-gray-100 dark:text-gray-800"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left pt-8 md:pt-0"
          >
            <PulsingBadge className="mb-6">The Ultimate Media Community Platform</PulsingBadge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Connect, Collaborate,</span>
              <br />
              <span className="dark:text-white">Elevate in the Media World</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Mockify is a vibrant platform uniting media professionals, enthusiasts, and learners. From
              networking and knowledge-sharing to exploring jobs, trading media equipment, and accessing tools, we empower
              the media community to innovate, connect, and excel.
            </p>

            <div className="flex justify-center lg:justify-start">
              <Link href="/profile">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Media/Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 mix-blend-multiply"></div>

              <Image
                src="/hero-image.png"
                alt="Media professionals collaborating"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />

              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover hidden"
                controls={false}
                onEnded={() => setVideoPlaying(false)}
              >
                <source src="/placeholder-media.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center animate-float">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">Years of Excellence</div>
            </div>

            <div
              className="absolute -top-6 -left-6 w-28 h-28 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex flex-col items-center justify-center animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Community Support</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={scrollToNextSection}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
