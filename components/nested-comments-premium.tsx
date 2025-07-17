"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, CornerDownRight, MoreHorizontal, Clock, Award } from "lucide-react"

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

  // Get color based on depth
  const getAccentColor = () => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-indigo-500 to-purple-600",
      "from-purple-500 to-pink-600",
      "from-pink-500 to-rose-600",
      "from-rose-500 to-orange-600",
    ]
    return colors[depth % colors.length]
  }

  return (
    <div
      ref={commentRef}
      className={`relative mb-6 transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${depth * 100}ms` }}
    >
      {/* Connection line */}
      {depth > 0 && (
        <div
          className="absolute bg-gradient-to-b opacity-30 rounded-full"
          style={{
            left: `-${12 + (depth - 1) * 6}px`,
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundImage: `linear-gradient(to bottom, transparent, ${depth % 2 === 0 ? "#3b82f6" : "#8b5cf6"}, transparent)`,
          }}
        ></div>
      )}

      <div
        className={`p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${
          depth > 0 ? `ml-${depth * 6}` : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-white">
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                {comment.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {comment.author.role && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{comment.author.name}</h4>
              {comment.author.role && (
                <Badge variant="outline" className="bg-gradient-to-r text-white text-xs py-0 px-2 h-5">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getAccentColor()}`}>
                    {comment.author.role}
                  </span>
                </Badge>
              )}
              <div className="flex items-center text-xs text-gray-500 ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {comment.timestamp}
              </div>
            </div>

            <div className="text-gray-700 leading-relaxed">{comment.content}</div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full h-8 px-3 transition-all duration-300 ${
                  isLiked ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:text-rose-500"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-rose-500" : ""}`} />
                <span>{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <CornerDownRight className="h-4 w-4 mr-1.5" />
                <span>Reply</span>
              </Button>

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8 px-3 text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition-all duration-300 ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  <span>{isExpanded ? "Hide replies" : `Show ${comment.replies.length} replies`}</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div
          className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${
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

export default function NestedCommentsPremium() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Community Insights
          </h2>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 rounded-full px-3">
            {sampleComments.reduce((count, comment) => {
              return count + 1 + (comment.replies?.length || 0)
            }, 0)}
          </Badge>
        </div>

        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-full px-5">
          <MessageSquare className="mr-2 h-4 w-4" />
          Add Comment
        </Button>
      </div>

      <div className="space-y-6 pl-10">
        {sampleComments.map((comment, index) => (
          <Comment key={comment.id} comment={comment} isLast={index === sampleComments.length - 1} />
        ))}
      </div>
    </div>
  )
}
