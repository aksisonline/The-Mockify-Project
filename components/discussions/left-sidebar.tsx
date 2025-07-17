import { Button } from "@/components/ui/button"
import { DiscussionCategory } from "@/types/discussion"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface LeftSidebarProps {
  categories: DiscussionCategory[]
  selectedCategory?: string
  onCategoryChange: (categoryId: string | undefined) => void
  selectedActivity?: "my-posts" | "saved"
  onActivityChange: (activity: "my-posts" | "saved" | undefined) => void
}

export function LeftSidebar({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  selectedActivity,
  onActivityChange 
}: LeftSidebarProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleActivityClick = (activity: "my-posts" | "saved") => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    onActivityChange(activity === selectedActivity ? undefined : activity)
  }

  return (
    <div className="hidden lg:block lg:col-span-2 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "ghost"}
            className={`w-full justify-start ${selectedCategory === undefined 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => onCategoryChange(undefined)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-start ${selectedCategory === category.id 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">My Activity</h3>
        <div className="space-y-2">
          <Button
            variant={selectedActivity === "my-posts" ? "default" : "ghost"}
            className={`w-full justify-start ${selectedActivity === "my-posts"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => handleActivityClick("my-posts")}
          >
            My Posts
          </Button>
          <Button
            variant={selectedActivity === "saved" ? "default" : "ghost"}
            className={`w-full justify-start ${selectedActivity === "saved"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => handleActivityClick("saved")}
          >
            Saved
          </Button>
        </div>
      </div>
    </div>
  )
}
