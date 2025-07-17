"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronDown, ChevronUp, MessageSquare, Reply, ThumbsDown, ThumbsUp } from "lucide-react"

// Reuse the CommentProps interface and sampleComments data
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

// DESIGN 3: CARD-BASED DESIGN (distinct cards for each comment)
function Comment({ comment, depth = 0 }: { comment: CommentProps; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const maxVisibleReplies = 2

  const hasReplies = comment.replies && comment.replies.length > 0
  const hasHiddenReplies = hasReplies && comment.replies!.length > maxVisibleReplies
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, maxVisibleReplies)

  // Calculate card styles based on depth
  const getCardStyle = () => {
    return {
      marginLeft: `${depth * 16}px`,
      width: `calc(100% - ${depth * 16}px)`,
      zIndex: 10 - depth,
    }
  }

  return (
    <div className="mb-3">
      <Card className="shadow-sm border border-gray-200 overflow-hidden" style={getCardStyle()}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.author.name}</span>
                {comment.author.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {comment.author.role}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              </div>

              <div className="mt-2">{comment.content}</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-2 bg-gray-50 flex justify-between">
          <div className="flex items-center gap-3">
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
          </div>

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs transition-all duration-200 ease-in-out"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3 transition-transform duration-200" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3 transition-transform duration-200" />
                  Show replies ({comment.replies!.length})
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {hasReplies && (
        <div
          className={`mt-2 transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 mt-0 pointer-events-none"
          }`}
        >
          {visibleReplies?.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}

          {hasHiddenReplies && (
            <Button
              variant="ghost"
              className="ml-12 mt-1 text-blue-600 text-sm transition-all duration-200 ease-in-out"
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

export default function NestedCommentsCard() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Card Style Comments</h2>
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
