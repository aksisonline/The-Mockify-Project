import type React from "react"
import type { Metadata } from "next"
import ContentWrapper from "@/components/ContentWrapper"

export const metadata: Metadata = {
  title: "Media Tools - Professional Tools for Media Professionals",
  description:
    "Access a comprehensive suite of professional tools designed specifically for media professionals.",
}

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="">
      <ContentWrapper>
        <main>{children}</main>
      </ContentWrapper>
    </div>
  )
}
