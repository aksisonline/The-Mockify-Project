"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, MoreVertical } from "lucide-react"

interface CommentProps {
  id: string
  author: {
    name: string
    avatar: string
    role?: string
  }
  content: string
  timestamp: string
  votes: number
  replies?: CommentProps[]
  depth?: number
}

// Sample comments data - same as in the minimal style
const sampleComments: CommentProps[] = [
  {
    id: "1",
    author: {
      name: "Bharat Dhane",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "  Engineer",
    },
    content:
      "The Mockify EVENTS Calendar is really helpful for keeping track of industry events. I've been using it to plan my professional development activities.",
    timestamp: "2 hours ago",
    votes: 15,
    replies: [
      {
        id: "2",
        author: {
          name: "Uday P",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "  Engineer",
        },
        content: "I agree! It's saved me so much time. Have you tried the notification feature?",
        timestamp: "1 hour ago",
        votes: 7,
        replies: [
          {
            id: "3",
            author: {
              name: "Vishnu Vardhan",
              avatar: "/placeholder.svg?height=40&width=40",
              role: "  Specialist",
            },
            content:
              "The notification feature is great. I also like how you can export events directly to your calendar.",
            timestamp: "45 minutes ago",
            votes: 4,
          },
        ],
      },
      {
        id: "4",
        author: {
          name: "Priya M",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "  Consultant",
        },
        content: "Does anyone know if they plan to add integration with other calendar apps in the future?",
        timestamp: "30 minutes ago",
        votes: 2,
      },
    ],
  },
  {
    id: "5",
    author: {
      name: "Rahul Singh",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "System Designer",
    },
    content:
      "The VC BAR SIMULATOR has been a game-changer for my projects. Being able to visualize camera and mic coverage before installation saves so much time on-site.",
    timestamp: "3 hours ago",
    votes: 12,
    replies: [
      {
        id: "6",
        author: {
          name: "Ananya K",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "Project Manager",
        },
        content:
          "My team has been using it for client presentations too. It helps non-technical stakeholders understand the setup better.",
        timestamp: "2 hours ago",
        votes: 8,
      },
    ],
  },
]

function Comment({ comment, depth = 0, isLast = false }: { comment: CommentProps; depth?: number; isLast?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Get color for the connection lines - always blue
  const getLineColor = () => {
    return "bg-blue-500"
  }

  // Get horizontal line color - always blue
  const getHorizontalLineColor = () => {
    return "bg-blue-500"
  }

  return (
    <div className="relative mb-3 group pb-0">
      {/* Connection line for replies - positioned to connect to the left edge of the card */}
      {depth > 0 && (
        <div
          className={`absolute left-[-30px] w-[3px] ${getLineColor()} rounded-full shadow-sm`}
          style={{
            top: isLast ? "-12px" : "0px", // Keep original position for last comment, move down for others
            height: isLast
              ? "36px" // For last comment, only extend to the horizontal line at top (24px + 12px offset)
              : "100%", // For other comments, extend to the bottom
            opacity: 0.9,
          }}
        ></div>
      )}

      {/* Horizontal connector line to the card - positioned at the avatar level */}
      {depth > 0 && (
        <div
          className={`absolute left-[-30px] w-[30px] h-[3px] ${getHorizontalLineColor()} rounded-full shadow-sm`}
          style={{
            top: "24px", // Position at the avatar level (parallel to the first child comment)
            opacity: 0.9,
          }}
        ></div>
      )}

      {/* Connection point dot */}
      {depth > 0 && (
        <div
          className="absolute left-[-30px] w-[8px] h-[8px] rounded-full bg-white border-2 border-blue-500 z-10"
          style={{
            top: "22px",
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)",
          }}
        ></div>
      )}

      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-full overflow-hidden">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback className="bg-gray-100 text-gray-800">{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900">{comment.author.name}</span>
                {comment.author.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {comment.author.role}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{comment.timestamp}</span>
            </div>

            <div className="mt-2 text-gray-800">{comment.content}</div>

            <div className="mt-3 flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-700">
                <MessageSquare className="h-4 w-4 mr-1" />
                {comment.replies?.length || 0}
              </Button>

              <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-700">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-700">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1"
                >
                  <path
                    d="M21 8.25C21 5.76472 18.9013 3.75 16.3125 3.75C14.3769 3.75 12.7153 4.87628 12 6.48342C11.2847 4.87628 9.62312 3.75 7.6875 3.75C5.09867 3.75 3 5.76472 3 8.25C3 15.4706 12 20.25 12 20.25C12 20.25 21 15.4706 21 8.25Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {comment.votes || 0}
              </Button>

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-gray-500 hover:text-gray-700 ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Hide replies" : `Show ${comment.replies.length} replies`}
                </Button>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div
          className={`pl-12 mt-2 relative overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Main connection line that extends to all replies - adjusted to be continuous */}
          <div
            className="absolute left-[-30px] top-[-12px] bottom-0 w-[3px] bg-blue-500 rounded-full shadow-sm"
            style={{ opacity: 0.9 }}
          ></div>

          {comment.replies.map((reply, index) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} isLast={index === comment.replies!.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NestedCommentsForum() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Forum Style Comments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Comment
        </Button>
      </div>

      <div className="space-y-4">
        {sampleComments.map((comment, index) => (
          <Comment key={comment.id} comment={comment} isLast={index === sampleComments.length - 1} />
        ))}
      </div>
    </div>
  )
}
