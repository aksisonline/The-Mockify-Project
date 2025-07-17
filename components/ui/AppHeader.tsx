import React from "react"
import Link from "next/link"
import Image from "next/image"

interface AppHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

/**
 * AppHeader - Mobile-optimized header component
 * 
 * Features:
 * - Responsive layout that adapts to all screen sizes
 * - Smart overflow handling for buttons and additional content
 * - Proper text wrapping and breakpoints
 * - Optimized spacing and typography for mobile devices
 * 
 * Mobile Optimizations:
 * - Two-row layout on mobile: logo/actions on top, title/subtitle below
 * - Horizontal scrolling for overflow content in right section
 * - Responsive typography scaling
 * - Proper touch targets and spacing
 * - Hidden scrollbars with maintained functionality
 * 
 * Usage Examples:
 * 
 * Basic usage:
 * <AppHeader title="Page Title" subtitle="Page description" />
 * 
 * With buttons:
 * <AppHeader 
 *   title="Tools" 
 *   subtitle="Access calculators and utilities"
 *   right={
 *     <div className="flex items-center gap-2">
 *       <Button size="sm">Action 1</Button>
 *       <Button size="sm">Action 2</Button>
 *     </div>
 *   }
 * />
 * 
 * With points display:
 * <AppHeader 
 *   title="Rewards" 
 *   subtitle="Redeem your points"
 *   right={
 *     <div className="flex items-center gap-2">
 *       <Award className="h-5 w-5 text-yellow-600" />
 *       <span className="font-bold text-yellow-600">1,250</span>
 *     </div>
 *   }
 * />
 */
const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, right }) => (
  <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 md:p-6 mb-4 overflow-hidden">
    <div className="flex flex-col gap-3 md:gap-6 w-full">
      {/* Row: Logo, (title/subtitle on md+), and right content (button) */}
      <div className="flex flex-row items-center gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="mr-0 sm:mr-4">
            <Image
              src="/mockify-logo.png"
              alt="Mockify Logo"
              width={120}
              height={40}
              className="h-7 sm:h-8 md:h-10 w-auto object-contain dark:hidden"
            />
          </Link>
          <div className="hidden md:block h-7 sm:h-8 md:h-10 w-px bg-gray-200 dark:bg-gray-700 mx-0 md:mx-2"></div>
        </div>
        {/* Title/Subtext (only on md+) */}
        <div className="flex-1 min-w-0 hidden md:block">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 leading-relaxed break-words">
              {subtitle}
            </p>
          )}
        </div>
        {/* Button or right content */}
        {right && (
          <div className="flex items-center flex-shrink-0 min-w-0 ml-auto">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide max-w-full sm:max-w-none">
              {right}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

export default AppHeader 