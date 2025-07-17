"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateProfilePublicStatus } from "@/lib/profile-service"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"

interface PublicProfileToggleProps {
  userId: string
  initialValue: boolean
  onToggle?: (isPublic: boolean) => void
}

export function PublicProfileToggle({ userId, initialValue, onToggle }: PublicProfileToggleProps) {
  const [isPublic, setIsPublic] = useState(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchIsPublic() {
      if (!user?.id) return
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("is_public")
        .eq("id", userId || user.id)
        .single()
      if (!error && data && typeof data.is_public === "boolean") {
        setIsPublic(data.is_public)
      }
    }
    fetchIsPublic()
  }, [userId, user?.id])

  const handleToggle = async (checked: boolean) => {
    if (!user?.id) return
    try {
      setIsUpdating(true)
      await updateProfilePublicStatus(
        checked,
        userId || user.id
      )
      setIsPublic(checked)

      if (onToggle) {
        onToggle(checked)
      }

      toast.success(checked ? "Profile is now public" : "Profile is now private", {
        description: checked
          ? "Your profile is now visible in the directory"
          : "Your profile has been removed from the directory"
      })
    } catch (error) {
      console.error("Error updating profile visibility:", error)
      toast.error("Error updating profile visibility", {
        description: "Please try again later"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="public-profile" className="text-base font-medium">
            Make Profile Public
          </Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When enabled, your profile will be visible in the Mockify directory
          </p>
        </div>
        <Switch
          id="public-profile"
          checked={isPublic}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          aria-label="Make profile public"
        />
      </div>
      <p className="text-xs text-blue-700 mt-2">
        <b>Note:</b> Only users with Public Profile enabled can apply to jobs & post items on AVKart.
      </p>
    </div>
  )
}
