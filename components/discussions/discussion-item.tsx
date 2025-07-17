"use client"

import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bookmark, Heart, Eye, File } from "lucide-react"
import type { DiscussionProps } from "@/types/discussion"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Poll } from "./poll"
import { useAuth } from "@/contexts/auth-context"
import { useVoting, useViewing, useDiscussionPoll } from "@/hooks/use-discussions"

interface DiscussionItemProps {
  discussion: DiscussionProps
}

export function DiscussionItem({ discussion }: DiscussionItemProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Voting hooks
  const { voteOnDiscussion, loading: voteLoading } = useVoting()
  
  // Bookmarks hook
  // const { 
  //   bookmarks, 
  //   toggleBookmarkItem, 
  //   loading: bookmarkLoading 
  // } = useBookmarks(user?.id || "")
  
  // View tracking hook
  const { recordDiscussionView } = useViewing()
  
  // Poll hooks
  const { vote: voteOnPoll, loading: pollVoteLoading } = useDiscussionPoll(discussion.id)

  const [likeCount, setLikeCount] = useState(discussion.likeCount)
  const [isLiked, setIsLiked] = useState(false)
  const [userVotes, setUserVotes] = useState<number[]>([])
  const [viewRecorded, setViewRecorded] = useState(false)

  // Check if discussion is bookmarked
  // const isDiscussionBookmarked = bookmarks.some(bookmark => bookmark.id === discussion.id)

  // Record view when component mounts
  useEffect(() => {
    if (user && !viewRecorded) {
      recordDiscussionView(discussion.id, user.id)
      setViewRecorded(true)
    }
  }, [user, discussion.id, viewRecorded, recordDiscussionView])

  const handleVote = async (optionIndex: number) => {
    if (!user || !discussion.poll) return

    try {
      // For polls, we need the actual option ID, not just the index
      const optionId = optionIndex.toString() // Simple conversion for now
      await voteOnPoll(optionId, user.id)
      
      // Update user votes
      if (discussion.poll?.allowMultiple) {
        if (userVotes.includes(optionIndex)) {
          setUserVotes(userVotes.filter((index) => index !== optionIndex))
        } else {
          setUserVotes([...userVotes, optionIndex])
        }
      } else {
        setUserVotes([optionIndex])
      }
    } catch (error) {
      console.error('Error voting on poll:', error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || voteLoading) return

    try {
      if (!isLiked) {
        await voteOnDiscussion(discussion.id, user.id, 'up')
        setLikeCount(prev => prev + 1)
        setIsLiked(true)
      } else {
        await voteOnDiscussion(discussion.id, user.id, 'down')
        setLikeCount(prev => prev - 1)
        setIsLiked(false)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  // const handleBookmark = async (e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   if (!user || bookmarkLoading) return

  //   try {
  //     await toggleBookmarkItem(discussion.id)
  //   } catch (error) {
  //     console.error('Error bookmarking:', error)
  //   }
  // }

  const handleClick = () => {
    router.push(`/discussions/${discussion.id}`)
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Author info */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img
            src={discussion.author.avatar || "/placeholder.svg"}
            alt={discussion.author.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-900">{discussion.author.name}</h3>
            {discussion.author.role && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">{discussion.author.role}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{discussion.timestamp}</p>
        </div>
      </div>

      {/* Post content */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h2>
        <p className="text-gray-700 mb-3">{discussion.preview}</p>

        {/* Poll */}
        {discussion.poll && (
          <div onClick={(e) => e.stopPropagation()} className="mb-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">{discussion.poll.question}</h4>
              <div className="space-y-2">
                {discussion.poll.options.map((option, index) => {
                  const percentage = discussion.poll!.totalVotes > 0 
                    ? Math.round((option.votes / discussion.poll!.totalVotes) * 100) 
                    : 0
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">{option.emoji || '📊'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{option.text}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {discussion.poll!.totalVotes} total votes
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {discussion.tags.map((tag) => (
              <Badge key={tag} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Interaction stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/discussions/${discussion.id}#comments`)
              }}
              aria-label={`View ${discussion.commentCount} comments`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">{discussion.commentCount}</span>
            </button>
            
            <button
              className={`flex items-center ${isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"} ${voteLoading ? "opacity-50" : ""}`}
              onClick={handleLike}
              disabled={voteLoading || !user}
              aria-label={isLiked ? "Unlike this discussion" : "Like this discussion"}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm">{likeCount}</span>
            </button>

            {/* {user && (
              <button
                className={`flex items-center ${isDiscussionBookmarked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"} ${bookmarkLoading ? "opacity-50" : ""}`}
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                aria-label={isDiscussionBookmarked ? "Remove bookmark" : "Bookmark this discussion"}
              >
                <Bookmark className={`h-4 w-4 ${isDiscussionBookmarked ? "fill-current" : ""}`} />
              </button>
            )} */}

            <div className="flex items-center text-gray-400">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm">{discussion.likeCount * 5 || 0}</span>
            </div>
          </div>
          {discussion.isNew && <Badge className="bg-green-100 text-green-800 border-green-200">New</Badge>}
        </div>
      </div>
    </div>
  )
}
