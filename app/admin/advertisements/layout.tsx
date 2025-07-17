import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export default function AdvertisementsAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Card className="mt-8 mx-auto max-w-4xl p-6">
      <h2 className="text-xl font-bold mb-4">Advertisement Management</h2>
      {children}
    </Card>
  )
} 