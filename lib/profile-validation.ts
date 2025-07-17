import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { updateProfilePublicStatus } from "@/lib/profile-service"

export async function checkProfilePublicStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("is_public")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error checking profile public status:", error)
      return false
    }

    return data?.is_public || false
  } catch (error) {
    console.error("Error checking profile public status:", error)
    return false
  }
}

export function showPublicProfileRequiredToast(userId: string) {
  toast("Public Profile Required", {
    description: "You need to make your profile public to post jobs and items on AVKart.",
    action: {
      label: "Make Profile Public",
      onClick: async () => {
        try {
          await updateProfilePublicStatus(true, userId)
          toast.success("Profile is now public", {
            description: "You can now post jobs and items on AVKart"
          })
        } catch (error) {
          console.error("Error updating profile visibility:", error)
          toast.error("Failed to update profile visibility", {
            description: "Please try again later"
          })
        }
      },
    },
  })
}

export async function validateProfileForPosting(userId: string): Promise<boolean> {
  const isPublic = await checkProfilePublicStatus(userId)
  
  if (!isPublic) {
    showPublicProfileRequiredToast(userId)
    return false
  }
  
  return true
} 