"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { DiscussionProps } from "@/types/discussion"
import { CreatePostForm } from "./discussions/create-post-form"
import { SearchFilterBar } from "./discussions/search-filter-bar"
import { DiscussionList } from "./discussions/discussion-list"
import { LeftSidebar } from "./discussions/left-sidebar"
import { RightSidebar } from "./discussions/right-sidebar"
import { NewDiscussionDialog } from "./discussions/new-discussion-dialog"

// Sample discussions data
const sampleDiscussions: DiscussionProps[] = [
  {
    id: "disc-poll-1",
    title: "Which productivity tool do you prefer for medium-sized teams?",
    preview:
      "I'm working on a project for a client with 10 medium-sized teams. Looking for community feedback on preferred productivity tools...",
    author: {
      name: "Rajesh Kumar",
      avatar: "/abstract-rk.png",
      role: "Productivity Consultant",
    },
    timestamp: "Just now",
    commentCount: 8,
    likeCount: 12,
    tags: ["Productivity", "Teams", "Poll"],
    isNew: true,
    hasPoll: true,
    poll: {
      question: "Which productivity tool do you prefer for medium-sized teams?",
      allowMultiple: false,
      options: [
        { emoji: "📊", text: "Asana", votes: 14 },
        { emoji: "🗂️", text: "Trello", votes: 8 },
        { emoji: "📅", text: "Monday.com", votes: 11 },
        { emoji: "📝", text: "Notion", votes: 5 },
      ],
      totalVotes: 38,
    },
  },
    {
      id: "disc-poll-2",
    title: "What features are most important in your media management software?",
    preview:
      "We're gathering feedback on the most valued features in media management software. Please select all the features that are important to you...",
    author: {
      name: "Mockify Official",
      avatar: "/abstract-geometric- .png",
      role: "Admin",
    },
    timestamp: "2 hours ago",
    commentCount: 17,
    likeCount: 29,
    tags: ["Software", "Management", "Poll"],
    isNew: true,
    hasPoll: true,
      poll: {
      question: "What features are most important in your media management software?",
      allowMultiple: true,
      options: [
        { emoji: "📊", text: "Usage analytics & reporting", votes: 42 },
        { emoji: "🔔", text: "Proactive alerts & monitoring", votes: 38 },
        { emoji: "📱", text: "Mobile app access", votes: 27 },
        { emoji: "🔄", text: "Integration with other systems", votes: 35 },
        { emoji: "🔒", text: "Advanced security features", votes: 31 },
      ],
      totalVotes: 56,
    },
  },
  {
    id: "disc-1",
    title: "Introducing the New VC BAR SIMULATOR Feature",
    preview:
      "We're excited to announce the latest update to our VC BAR SIMULATOR tool. This update includes enhanced camera visualization...",
    author: {
      name: "Mockify Official",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    timestamp: "3 hours ago",
    commentCount: 24,
    likeCount: 42,
    tags: ["Tag 1", "Tag 2", "Tag 5"],
    isNew: true,
  },
  {
    id: "disc-2",
    title: "Best practices for mic placement in large conference rooms?",
    preview:
      "I'm working on a project for a large workspace (30x40 ft) and need advice on optimal productivity setup for...",
    author: {
      name: "Bharat Dhane",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Media Engineer",
    },
    timestamp: "Yesterday",
    commentCount: 18,
    likeCount: 15,
    tags: ["Tag 2", "Tag 3"],
  },
  {
    id: "disc-3",
    title: "How to use the EVENTS Calendar for trade show planning",
    preview:
      "I've been using the EVENTS Calendar to track upcoming trade shows, but I'm wondering if there's a way to export selected events to...",
    author: {
      name: "Vishnu Vardhan",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Media Specialist",
    },
    timestamp: "2 days ago",
    commentCount: 7,
    likeCount: 9,
    tags: ["Tag 1", "Tag 4"],
  },
  {
    id: "disc-4",
    title: "Camera recommendations for hybrid meeting rooms",
    preview:
      "Our company is setting up several hybrid meeting rooms and I'm looking for camera recommendations that work well with...",
    author: {
      name: "Uday P",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Media Engineer",
    },
    timestamp: "3 days ago",
    commentCount: 32,
    likeCount: 27,
    tags: ["Tag 3", "Tag 5"],
  },
  {
    id: "disc-5",
    title: "Directory feature - how to find specific POCs?",
    preview:
      "I'm trying to use the directory feature to find the right point of contact at a specific organization, but I'm having trouble with...",
    author: {
      name: "Priya M",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Media Consultant",
    },
    timestamp: "4 days ago",
    commentCount: 5,
    likeCount: 3,
    tags: ["Tag 2", "Tag 4", "Tag 5"],
  },
]

export default function DiscussionsList() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false)
  const router = useRouter()

  const availableTags = ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"]

  return (
    <div className="w-full mx-auto p-4 bg-gray-50 min-h-screen">
      <style jsx global>{`
        @keyframes gradientBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .gradient-border-focus:focus {
          outline: none !important;
          border-color: transparent !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          position: relative;
        }
        
        .gradient-border-focus:focus::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd, #60a5fa, #3b82f6);
          background-size: 200% 100%;
          border-radius: 0.5rem;
          z-index: -1;
          animation: gradientBorder 3s ease infinite;
        }
      `}</style>

      {/* Main three-column layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Left sidebar */}
        <LeftSidebar categories={[]} onCategoryChange={function (categoryId: string | undefined): void {
          throw new Error("Function not implemented.")
        } } onActivityChange={function (activity: "my-posts" | "saved" | undefined): void {
          throw new Error("Function not implemented.")
        } } />

        {/* Main content area */}
        <div className="col-span-1 lg:col-span-7 space-y-4">
          {/* Back button - visible on all screens */}
          <div className="mb-4">
            <Button variant="ghost" className="flex items-center text-blue-600" onClick={() => router.push("/")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Home
            </Button>
          </div>

          {/* Create post form */}
          <CreatePostForm />

          {/* Search and filters */}
          <SearchFilterBar
            searchQuery={searchQuery}
            filter={filter}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilter}
          />

          {/* Discussion list */}
          <DiscussionList discussions={sampleDiscussions} />
        </div>

        {/* Right sidebar */}
        <RightSidebar />
      </div>

      {/* New Discussion Dialog */}
      <NewDiscussionDialog
        isOpen={isNewDiscussionOpen}
        onOpenChange={setIsNewDiscussionOpen}
        availableTags={availableTags}
      />
    </div>
  )
}
