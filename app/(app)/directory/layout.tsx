import type React from "react"
import type { Metadata } from "next"
import ProfileSidebar from "@/components/profile-sidebar"
import ContentWrapper from "@/components/ContentWrapper"

export const metadata: Metadata = {
  title: "Media Professionals Directory | Mockify",
  description: "Connect with media professionals, engineers, and specialists in the industry",
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <ContentWrapper>
        {children}
        </ContentWrapper>
    </div>
  )
}
