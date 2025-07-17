import type React from "react"
import type { Metadata } from "next"
import ContentWrapper from "@/components/ContentWrapper"

export const metadata: Metadata = {
  title: "Training Programs | Mockify",
  description: "Professional media training courses for all experience levels",
}

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main><ContentWrapper>{children}</ContentWrapper></main>
}
