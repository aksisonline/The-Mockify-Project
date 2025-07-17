"use client"

import type React from "react"
import { Suspense } from "react"
import VerticalSidebarDock from "@/components/vertical-sidebar-dock"
import SponsoredContent from "@/components/careers/SponsoredContent"
import { PointsCard } from "@/components/points/points-card"
import { usePathname } from "next/navigation"
import "./globals.css"
import { useEffect, useState } from "react"

// Add a simple useBreakpoint hook
function useBreakpoint() {
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    function check() {
      const isWideEnough = window.matchMedia('(min-width: 1024px)').matches;
      const isTallEnough = window.innerHeight >= 900; // Minimum height for desktop sidebar
      setIsLgUp(isWideEnough && isTallEnough);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isLgUp;
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLgUp = typeof window === 'undefined' ? true : useBreakpoint();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {!isLoginPage && (
        <Suspense fallback={null}>
          {isLgUp ? (
            <VerticalSidebarDock variant="desktop" />
          ) : (
            <VerticalSidebarDock variant="mobile" />
          )}
        </Suspense>
      )}
      <div style={{ display: 'none' }}><PointsCard /></div>
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
        <main className="flex-1 px-4 md:px-6 pt-4 md:pt-0">
          {children}
          <div className="block h-20" />
          <div className="hidden md:block h-6" />
        </main>
        {!isLoginPage && isLgUp && (
          <aside className="hidden lg:block w-full md:w-1/4 max-w-md mx-auto md:mx-0 md:pl-6 md:pt-8 md:pr-5">
            <SponsoredContent />
          </aside>
        )}
      </div>
    </div>
  )
}
