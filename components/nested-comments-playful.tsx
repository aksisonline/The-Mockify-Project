"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Send, MoreHorizontal, Star } from "lucide-react"

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

// Get a playful color based on depth
const getPlayfulColor = (depth: number) => {
  const colors = [
    { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-600" },
    { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-600" },
    { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-600" },
    { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-600" },
    { bg: "bg-green-100", border: "border-green-300", text: "text-green-600" },
  ]
  return colors[depth % colors.length]
}

function Comment({ comment, depth = 0, isLast = false }: { comment: CommentProps; depth?: number; isLast?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.votes)
  const [isHovered, setIsHovered] = useState(false)
  const commentRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const colors = getPlayfulColor(depth)

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
      className={`relative mb-6 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-10 -rotate-1"
      }`}
      style={{ transitionDelay: `${depth * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Playful connection line */}
      {depth > 0 && (
        <div
          className={`absolute ${colors.border}`}
          style={{
            left: `-${12 + (depth - 1) * 6}px`,
            top: 0,
            bottom: 0,
            width: "2px",
            borderRadius: "4px",
            transform: isHovered ? "scaleY(1.05)" : "scaleY(1)",
            transition: "transform 0.3s ease-out",
          }}
        ></div>
      )}

      <div
        className={`p-4 rounded-2xl ${colors.bg} border ${colors.border} shadow-sm transition-all duration-300 ${
          depth > 0 ? `ml-${depth * 6}` : ""
        }`}
        style={{
          transform: isHovered ? "scale(1.01)" : "scale(1)",
          transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
          boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.08)" : "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className={`h-10 w-10 border-2 ${colors.border}`}>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback className={`${colors.bg} ${colors.text}`}>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {comment.author.role && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Star className={`h-3.5 w-3.5 ${colors.text} fill-current`} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-gray-900">{comment.author.name}</h4>
              {comment.author.role && (
                <Badge className={`${colors.bg} ${colors.text} border-0`}>{comment.author.role}</Badge>
              )}
              <div className="text-xs text-gray-500 ml-auto">{comment.timestamp}</div>
            </div>

            <div className="mt-2 text-gray-700">{comment.content}</div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full h-8 px-3 transition-all duration-300 ${
                  isLiked ? `${colors.bg} ${colors.text}` : "text-gray-500 hover:text-pink-500"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 text-gray-500 hover:text-blue-500 transition-all duration-300"
              >
                <Send className="h-4 w-4 mr-1.5" />
                <span>Reply</span>
              </Button>

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8 px-3 text-gray-500 hover:text-purple-500 transition-all duration-300 ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  <span>{isExpanded ? "Hide replies" : `Show ${comment.replies.length} replies`}</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0 text-gray-400 hover:text-gray-600 transition-all duration-300"
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
            isExpanded ? "max-h-[2000px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
          }`}
          style={{ transformOrigin: "top left" }}
        >
          {comment.replies.map((reply, index) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} isLast={index === comment.replies!.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NestedCommentsPlayful() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-3xl border-2 border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold">Fun Discussion Zone</h2>
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 rounded-full">
            {sampleComments.reduce((count, comment) => {
              return count + 1 + (comment.replies?.length || 0)
            }, 0)}
          </Badge>
        </div>

        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 rounded-full px-5">
          <MessageSquare className="mr-2 h-4 w-4" />
          Join the Chat
        </Button>
      </div>

      <div className="space-y-6 pl-8">
        {sampleComments.map((comment, index) => (
          <Comment key={comment.id} comment={comment} isLast={index === sampleComments.length - 1} />
        ))}
      </div>
    </div>
  )
}
