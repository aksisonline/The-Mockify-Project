"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Reply, MoreHorizontal, Clock, CheckCircle } from "lucide-react"

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

// Sample comments data
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
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.votes)
  const commentRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (commentRef.current) {
      observer.observe(commentRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  return (
    <div
      ref={commentRef}
      className={`relative mb-6 transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${depth * 50}ms` }}
    >
      {/* Modern connection line */}
      {depth > 0 && (
        <div
          className="absolute bg-gray-200"
          style={{
            left: `-${10 + (depth - 1) * 5}px`,
            top: 0,
            bottom: 0,
            width: "1px",
          }}
        ></div>
      )}

      <div
        className={`p-4 rounded-lg bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 ${
          depth > 0 ? `ml-${depth * 5}` : ""
        }`}
      >
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback className="bg-gray-100 text-gray-700">{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {comment.author.role && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <CheckCircle className="h-3 w-3 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
              {comment.author.role && (
                <Badge variant="secondary" className="font-normal text-xs py-0 h-5">
                  {comment.author.role}
                </Badge>
              )}
              <div className="flex items-center text-xs text-gray-500 ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {comment.timestamp}
              </div>
            </div>

            <div className="mt-1 text-gray-700 text-sm">{comment.content}</div>

            <div className="mt-3 flex items-center gap-1 text-xs">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 rounded-md transition-all duration-200 ${
                  isLiked ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-3.5 w-3.5 mr-1 ${isLiked ? "fill-blue-600" : ""}`} />
                <span>{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 rounded-md text-gray-500 hover:text-blue-600 transition-all duration-200"
              >
                <Reply className="h-3.5 w-3.5 mr-1" />
                <span>Reply</span>
              </Button>

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 rounded-md text-gray-500 hover:text-blue-600 transition-all duration-200 ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  <span>{isExpanded ? "Hide" : `${comment.replies.length} replies`}</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-md text-gray-400 hover:text-gray-600 transition-all duration-200"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div
          className={`mt-3 transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {comment.replies.map((reply, index) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} isLast={index === comment.replies!.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NestedCommentsModern() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Discussion (24)</h2>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Comment
        </Button>
      </div>

      <div className="space-y-6 pl-6">
        {sampleComments.map((comment, index) => (
          <Comment key={comment.id} comment={comment} isLast={index === sampleComments.length - 1} />
        ))}
      </div>
    </div>
  )
}
