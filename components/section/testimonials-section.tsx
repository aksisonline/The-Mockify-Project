"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/container"
import { Marquee } from "@/components/ui/marquee"

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const testimonials = [
    {
      id: 1,
      content:
        "The Mockify EVENTS Calendar tracks trade shows, events, webinars, and training sessions, saving me time and keeping me updated on industry happenings.",
      author: "Bharat Dhane",
      role: "Productivity Engineer",
      avatar: "/avatar1.png",
      rating: 5,
      company: "TechAV Solutions",
    },
    {
      id: 2,
      content:
        "The Interactive Tools on Mockify are excellent. They help visualize project layouts and coverage, making my designs more accurate and client presentations more impressive.",
      author: "Uday P",
      role: "Productivity Engineer",
      avatar: "/avatar2.png",
      rating: 5,
      company: "Productivity Experts",
    },
    {
      id: 3,
      content:
        "The directory concept on Mockify is brilliant. It helps me connect with the right POC from organizations, streamlining collaboration and networking in the industry.",
      author: "Vishnu Vardhan",
      role: "Productivity Specialist",
      avatar: "/avatar3.png",
      rating: 5,
      company: "Visual Systems Inc.",
    },
    {
      id: 4,
      content:
        "Mockify has transformed how I approach projects. The resources and community support are invaluable for staying current with industry trends and solving complex technical challenges.",
      author: "Priya Sharma",
      role: "  Consultant",
      avatar: "/avatar1.png",
      rating: 5,
      company: "Integrated Solutions",
    },
    {
      id: 5,
      content:
        "The training materials on Mockify helped me advance my career. I highly recommend it to all professionals looking to enhance their skills and stay competitive in the industry.",
      author: "Rajesh Kumar",
      role: "System Integrator",
      avatar: "/avatar2.png",
      rating: 5,
      company: "  Integration Pro",
    },
  ]  // Use all testimonials in a single row
  const firstRow = testimonials
  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
    return (
      <>
        <style jsx>{`
          .testimonial-card {
            transition: 0.5s ease-out;
            overflow: visible;
          }
          
          .testimonial-card:hover {
            border-color: #008bf8;
            box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.25);
          }
          
          .card-button {
            transform: translate(-50%, 125%);
            width: 60%;
            border-radius: 1rem;
            border: none;
            background-color: #008bf8;
            color: #fff;
            font-size: 1rem;
            padding: 0.5rem 1rem;
            position: absolute;
            left: 50%;
            bottom: 0;
            opacity: 0;
            transition: 0.3s ease-out;
          }
          
          .testimonial-card:hover .card-button {
            transform: translate(-50%, 50%);
            opacity: 1;
          }
        `}</style>
        <figure
          className={cn(
            "testimonial-card relative w-[280px] sm:w-[320px] h-56 sm:h-64 cursor-pointer rounded-xl border-2 border-brand/30 p-4 sm:p-6",
            "bg-white shadow-lg flex flex-col justify-between mx-2"
          )}
        >
        <div className="flex justify-between items-start mb-4">
          <div className="text-brand opacity-20">
            <Quote className="h-8 w-8" />
          </div>
          <div className="flex space-x-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        <blockquote className="text-sm text-primary-text mb-4 flex-grow">
          {testimonial.content}
        </blockquote>        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
            <span className="text-brand font-bold text-sm">
              {testimonial.author.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-primary text-sm">{testimonial.author}</h4>
            <p className="text-xs text-primary-text">{testimonial.role}</p>
            <p className="text-xs text-brand">{testimonial.company}</p>
          </div>
        </div>
        
        {/* <button className="card-button">More info</button> */}
      </figure>
      </>
    )
  }
  return (
    <section className="py-10 md:py-16 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand/5 rounded-full filter blur-3xl opacity-30"></div>
      </div>

      <Container className="relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-brand mr-2"></span>
            Testimonials
          </div>          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 text-primary whitespace-nowrap">
            What Our <span className="text-brand glow font-serif">Community Says</span>
          </h2>

          <p className="text-lg text-primary-text px-4">
            Check out these testimonials to see how Mockify is driving success across the   landscape.
            Ready to take the next step in your journey? Sign up today and be part of a platform built to empower your future.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative flex w-full flex-col items-center justify-center overflow-hidden"
        >
          {/* First Row */}
          <Marquee pauseOnHover className="[--duration:40s] mb-4">
            {firstRow.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}          </Marquee>

          {/* Gradient overlays for smooth fade effect */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white"></div>
        </motion.div>
      </Container>
    </section>
  )
}