import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface RightSidebarProps {
  onNewDiscussion?: () => void
}

export function RightSidebar({ onNewDiscussion }: RightSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-3 space-y-4">
      {/* Ad space */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded">Sponsored</span>
        </div>
        <h3 className="font-bold text-lg mb-2">Upgrade Your Media Skills</h3>
        <p className="text-sm mb-3">
          Get certified with our premium media training courses. Special discount for community members.
        </p>
        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Learn More</Button>
      </div>

      {/* Trending topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Trending Topics</h3>
        <div className="space-y-3">
          {[
            "Camera placement best practices",
            "New equipment releases",
            "Remote media management solutions",
            "Upcoming industry events",
            "Certification pathways",
          ].map((topic, index) => (
            <div key={index} className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold mr-2">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">{topic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Community Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">1.2k</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">328</p>
            <p className="text-xs text-gray-500">Discussions</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">42</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">89</p>
            <p className="text-xs text-gray-500">New Today</p>
          </div>
        </div>
      </div>

    </div>
  )
}
