"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Careers", href: "/careers", description: "Find job opportunities in the   industry" },
    { name: "Kart", href: "/kart", description: "Shop for   equipment and accessories" },
    { name: "Review", href: "/review", description: "Read and write reviews of   products" },
    { name: "Community", href: "/community", description: "Connect with other professionals" },
    { name: "Contact", href: "/contact", description: "Get in touch with our team" },
  ]

  return (
    <div className="md:hidden">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="relative z-50"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 text-avblue" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-16 bg-white p-4 rounded-lg shadow-lg z-40 w-64 mr-4"
          >
            <div className="text-sm">
              <h3 className="font-bold text-avblue mb-2">Navigation Help</h3>
              <p className="mb-2">Tap the menu icon to see all navigation options.</p>
              <p className="mb-2">Each menu item takes you to a different section of our website.</p>
              <Button size="sm" className="w-full mt-2" onClick={() => setShowHelp(false)}>
                Got it!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center p-4">
              <div className="w-full max-w-md space-y-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-3 shadow-sm"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-between hover:text-avblue transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div>
                        <div className="text-lg font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1 text-left">{item.description}</div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                  className="mt-6"
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-avblue hover:bg-avblue/90 shadow-md">SignUp/Login</Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
