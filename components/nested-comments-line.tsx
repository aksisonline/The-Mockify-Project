"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MessageSquare, Reply, ThumbsDown, ThumbsUp } from "lucide-react"

// Reuse the CommentProps interface and sampleComments data from the first file
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

// Sample comments data - same as in the first file
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

// DESIGN 2: LINE-BASED DESIGN (similar to Reddit)
function Comment({ comment, depth = 0 }: { comment: CommentProps; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const maxVisibleReplies = 2

  const hasReplies = comment.replies && comment.replies.length > 0
  const hasHiddenReplies = hasReplies && comment.replies!.length > maxVisibleReplies
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, maxVisibleReplies)

  // Get line color based on depth
  const getLineColor = () => {
    const colors = ["border-blue-500", "border-blue-400", "border-blue-300", "border-blue-200", "border-blue-100"]
    return colors[depth % colors.length]
  }

  return (
    <div className="mb-4">
      <div className="p-3 bg-white rounded-md hover:bg-gray-50">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-semibold">{comment.author.name}</span>
              {comment.author.role && (
                <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{comment.author.role}</span>
              )}
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>

            <div className="mt-2 text-sm">{comment.content}</div>

            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 px-1">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {comment.votes}
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-1">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 transition-all duration-200 ease-in-out"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1 transition-transform duration-200" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1 transition-transform duration-200" />
                      Show
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div
          className={`pl-4 ml-4 mt-2 border-l-2 ${getLineColor()} transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 mt-0 pointer-events-none"
          }`}
        >
          {visibleReplies?.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}

          {hasHiddenReplies && (
            <Button
              variant="ghost"
              className="ml-4 mt-1 text-blue-600 text-xs h-8 transition-all duration-200 ease-in-out"
              onClick={() => setShowAllReplies(!showAllReplies)}
            >
              {showAllReplies
                ? "Show fewer replies"
                : `View ${comment.replies!.length - maxVisibleReplies} more replies`}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function NestedCommentsLine() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Line Style Comments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Comment
        </Button>
      </div>

      <div className="space-y-4">
        {sampleComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
