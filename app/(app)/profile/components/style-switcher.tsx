"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layout, LayoutGrid, Sidebar, ScrollText, Minimize } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface StyleSwitcherProps {
  currentStyle: string
}

export default function StyleSwitcher({ currentStyle }: StyleSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      className={`fixed left-0 top-[20%] z-50 bg-white shadow-md rounded-r-lg p-4 border-r border-t border-b border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg ${isExpanded ? "max-w-[200px]" : "max-w-[60px]"}`}
      initial={{ x: -60 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="flex justify-between items-center mb-3">
        <motion.h2
          className={`text-lg font-medium text-blue-600 ${isExpanded ? "block" : "hidden"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Layout Style:
        </motion.h2>
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Minimize className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2 pr-2">
        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/profile?style=card`}
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center gap-2 ${currentStyle === "card" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <LayoutGrid className="h-4 w-4" />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
              >
                Card Layout
              </motion.span>
            )}
          </Link>
        </motion.div>

        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/profile?style=tabbed`}
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center gap-2 ${currentStyle === "tabbed" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <Layout className="h-4 w-4" />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
              >
                Tabbed Layout
              </motion.span>
            )}
          </Link>
        </motion.div>

        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/profile?style=sidebar`}
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center gap-2 ${currentStyle === "sidebar" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <Sidebar className="h-4 w-4" />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
              >
                Sidebar Layout
              </motion.span>
            )}
          </Link>
        </motion.div>

        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/profile?style=scrollable`}
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center gap-2 ${currentStyle === "scrollable" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <ScrollText className="h-4 w-4" />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
              >
                Scrollable Layout
              </motion.span>
            )}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
