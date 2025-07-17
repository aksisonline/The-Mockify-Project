import type React from "react"
import ContentWrapper from "@/components/ContentWrapper"

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="">
      <ContentWrapper>
        <main>{children}</main>
      </ContentWrapper>
    </div>
  )
}