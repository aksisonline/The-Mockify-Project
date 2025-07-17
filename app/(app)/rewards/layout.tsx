import type React from "react"
import type { Metadata } from "next"
import ContentWrapper from "@/components/ContentWrapper"

export const metadata: Metadata = {
  title: "Rewards - Mockify",
  description: "Redeem your points for exclusive rewards and benefits",
}

export default function RewardsLayout({
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