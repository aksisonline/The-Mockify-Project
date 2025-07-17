"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, ThumbsUp } from "lucide-react"

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

// DESIGN 4: MINIMALIST DESIGN (clean and simple)
function Comment({ comment, depth = 0 }: { comment: CommentProps; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const maxVisibleReplies = 2
  const [isReplyBoxOpen, setIsReplyBoxOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(comment.votes)

  const hasReplies = comment.replies && comment.replies.length > 0
  const hasHiddenReplies = hasReplies && comment.replies!.length > maxVisibleReplies
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, maxVisibleReplies)

  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          {hasReplies && isExpanded && <div className="w-px h-full bg-gray-200 my-1"></div>}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.author.name}</span>
            {comment.author.role && <span className="text-xs text-blue-600 font-medium">{comment.author.role}</span>}
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>

          <div className="mt-2 text-sm">{comment.content}</div>

          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 text-xs gap-1 ${hasVoted ? "text-blue-600" : ""}`}
              onClick={() => {
                if (!hasVoted) {
                  setVoteCount(voteCount + 1)
                  setHasVoted(true)
                } else {
                  setVoteCount(voteCount - 1)
                  setHasVoted(false)
                }
              }}
            >
              <ThumbsUp className={`h-3 w-3 ${hasVoted ? "fill-blue-600" : ""}`} />
              {voteCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1 text-xs"
              onClick={() => setIsReplyBoxOpen(!isReplyBoxOpen)}
            >
              {isReplyBoxOpen ? "Cancel" : "Reply"}
            </Button>

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1 text-xs transition-all duration-200 ease-in-out"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide replies" : `Show replies (${comment.replies!.length})`}
              </Button>
            )}
          </div>
          {isReplyBoxOpen && (
            <div className="mt-3 space-y-2 transition-all duration-200 ease-in-out">
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Write your reply..."
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsReplyBoxOpen(false)
                    setReplyText("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 bg-blue-600 text-xs hover:bg-blue-700"
                  onClick={() => {
                    // In a real app, this would submit the reply to an API
                    // For now, we'll just close the reply box
                    setIsReplyBoxOpen(false)
                    setReplyText("")
                    // Show a simulated success message
                    alert("Reply submitted successfully!")
                  }}
                  disabled={!replyText.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasReplies && (
        <div
          className={`ml-10 mt-2 transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 mt-0 pointer-events-none"
          }`}
        >
          {visibleReplies?.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={depth + 1} />
          ))}

          {hasHiddenReplies && (
            <Button
              variant="link"
              className="text-blue-600 text-xs h-6 mt-1 transition-all duration-200 ease-in-out"
              onClick={() => setShowAllReplies(!showAllReplies)}
            >
              {showAllReplies
                ? "Show fewer replies"
                : `View ${comment.replies!.length - maxVisibleReplies} more replies`}
            </Button>
          )}
        </div>
      )}

      {depth === 0 && <Separator className="mt-4" />}
    </div>
  )
}

export default function NestedCommentsMinimal() {
  const [isNewCommentOpen, setIsNewCommentOpen] = useState(false)
  const [newCommentText, setNewCommentText] = useState("")
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Minimal Style Comments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsNewCommentOpen(!isNewCommentOpen)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {isNewCommentOpen ? "Cancel" : "New Comment"}
        </Button>
      </div>

      {isNewCommentOpen && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">Add a new comment</div>
            </div>
          </div>
          <textarea
            className="w-full rounded-md border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3"
            placeholder="Share your thoughts..."
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsNewCommentOpen(false)
                setNewCommentText("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
              onClick={() => {
                // In a real app, this would submit the comment to an API
                // For now, we'll just close the comment box
                setIsNewCommentOpen(false)
                setNewCommentText("")
                // Show a simulated success message
                alert("Comment posted successfully!")
              }}
              disabled={!newCommentText.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}

      <div>
        {sampleComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
