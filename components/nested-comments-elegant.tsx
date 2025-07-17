"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, ArrowRight, Star, Clock } from "lucide-react"

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

  // Get elegant style based on depth
  const getElegantStyle = () => {
    const styles = [
      { bg: "bg-white", border: "border-gray-200", accent: "text-gray-700" },
      { bg: "bg-gray-50", border: "border-gray-200", accent: "text-gray-700" },
      { bg: "bg-white", border: "border-gray-200", accent: "text-gray-700" },
      { bg: "bg-gray-50", border: "border-gray-200", accent: "text-gray-700" },
      { bg: "bg-white", border: "border-gray-200", accent: "text-gray-700" },
    ]
    return styles[depth % styles.length]
  }

  const style = getElegantStyle()

  return (
    <div
      ref={commentRef}
      className={`relative mb-8 transition-all duration-800 ease-out ${
        isVisible ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-12 rotate-1"
      }`}
      style={{ transitionDelay: `${depth * 150}ms` }}
    >
      {/* Elegant connection line */}
      {depth > 0 && (
        <div
          className="absolute top-[20px] h-[3px]"
          style={{
            left: "-50px",
            width: "50px",
            background: "linear-gradient(to right, #e5e7eb, #111827)",
          }}
        ></div>
      )}

      <div
        className={`p-5 rounded-lg ${style.bg} border ${style.border} ${depth > 0 ? "ml-6" : ""}`}
        style={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        }}
      >
        <div className="flex gap-4">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full ${style.border} blur-md opacity-30 animate-pulse`}
              style={{
                animationDuration: "3s",
                animationDelay: `${depth * 0.5}s`,
              }}
            ></div>
            <Avatar className={`h-12 w-12 border ${style.border} relative z-10`}>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback className={`${style.bg} ${style.accent}`}>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900">{comment.author.name}</h4>
              {comment.author.role && (
                <Badge className="bg-gray-100 text-gray-700 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  {comment.author.role}
                </Badge>
              )}
              <div className="flex items-center text-xs text-gray-500 ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {comment.timestamp}
              </div>
            </div>

            <div className="mt-2 text-gray-700 leading-relaxed">{comment.content}</div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full h-9 px-4 border transition-all duration-300 ${
                  isLiked ? "bg-gray-100 text-gray-900" : "hover:border-gray-300"
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-gray-900" : ""}`} />
                <span>{likeCount}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-4 border hover:border-gray-300 transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                <span>Reply</span>
              </Button>

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 px-4 border transition-all duration-300 text-gray-700 ml-auto"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>{isExpanded ? "Hide Conversation" : `Show ${comment.replies.length} Responses`}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div
          className={`mt-4 pl-6 transition-all duration-700 ease-in-out overflow-hidden ${
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

export default function NestedCommentsElegant() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gray-200 blur-md opacity-30 animate-pulse"></div>
            <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center text-white relative z-10">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Elegant Conversations</h2>
            <p className="text-gray-500 text-sm">Share your thoughts and ideas</p>
          </div>
        </div>

        <Button className="bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-full px-6 py-6 h-auto">
          <MessageSquare className="mr-2 h-5 w-5" />
          <span className="font-medium">Add Your Voice</span>
        </Button>
      </div>

      <div className="space-y-4 pl-0">
        {sampleComments.map((comment, index) => (
          <Comment key={comment.id} comment={comment} isLast={index === sampleComments.length - 1} />
        ))}
      </div>
    </div>
  )
}
