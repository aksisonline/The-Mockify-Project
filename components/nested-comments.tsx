"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, MessageSquare, Reply, ThumbsDown, ThumbsUp } from "lucide-react"

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

function Comment({ comment, depth = 0 }: { comment: CommentProps; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const maxVisibleReplies = 2

  const hasReplies = comment.replies && comment.replies.length > 0
  const hasHiddenReplies = hasReplies && comment.replies!.length > maxVisibleReplies
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, maxVisibleReplies)

  // Calculate gradient based on nesting depth
  const getGradient = () => {
    const baseColor = "rgb(239, 246, 255)" // Light blue
    const borderColor = depth === 0 ? "border-blue-500" : `border-blue-${Math.max(100, 500 - depth * 100)}`
    return {
      background: depth === 0 ? baseColor : `rgba(239, 246, 255, ${Math.max(0.2, 1 - depth * 0.2)})`,
      borderColor,
    }
  }

  const style = getGradient()

  return (
    <Card className={`mb-3 overflow-hidden border-l-4 ${style.borderColor}`} style={{ background: style.background }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.author.name}</span>
              {comment.author.role && (
                <span className="text-xs text-muted-foreground bg-blue-100 px-2 py-0.5 rounded-full">
                  {comment.author.role}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>

            <div className="mt-2">{comment.content}</div>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{comment.votes}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Hide replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Show replies
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasReplies && (
        <div className="pl-6 pr-2 pb-2">
          {visibleReplies?.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}

          {hasHiddenReplies && (
            <Button
              variant="ghost"
              className="ml-12 mb-2 text-blue-600 text-sm"
              onClick={() => setShowAllReplies(!showAllReplies)}
            >
              {showAllReplies
                ? "Show fewer replies"
                : `View ${comment.replies!.length - maxVisibleReplies} more replies`}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default function NestedComments() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Community Discussion</h2>
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
