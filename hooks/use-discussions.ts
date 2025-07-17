"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  getDiscussions,
  getDiscussionCategories,
  getDiscussionById,
  getDiscussionBySlug,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getDiscussionComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getDiscussionPoll,
  createPoll,
  votePoll,
  votePollSingleOption,
  getUserPollVotes,
  createAttachment,
  deleteAttachment,
  voteDiscussion,
  voteComment,
  // toggleBookmark,
  getUserBookmarks,
  recordShare,
  recordView,
  reportContent
} from "@/lib/discussions-service"
import type {
  Discussion,
  DiscussionCategory,
  DiscussionComment,
  DiscussionPoll,
  DiscussionPollOption,
  DiscussionAttachment,
  DiscussionProps,
} from "@/types/discussion"

// Hook for fetching discussions with filters
export function useDiscussions(
  options: {
    limit?: number
    category_id?: string
    tag?: string
    search?: string
    sort_by?: "newest" | "popular" | "activity"
    author_id?: string
    activity?: "my-posts" | "saved"
    user_id?: string
  } = {},
) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = options.limit || 10

  const loadDiscussions = async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)
      const currentOffset = isLoadMore ? offset : 0

      // If activity filter is set, we need to handle it differently
      let data: Discussion[] | null = null
      if (options.activity === "my-posts" && options.user_id) {
        // Get discussions created by the user
        data = await getDiscussions({
          ...options,
          author_id: options.user_id,
          offset: currentOffset,
          limit: 10,
        })
      } else if (options.activity === "saved" && options.user_id) {
        // Get discussions bookmarked by the user
        data = await getUserBookmarks(options.user_id)
        // Apply other filters to the bookmarked discussions
        if (data) {
          data = data.filter(discussion => {
            if (options.category_id && discussion.category_id !== options.category_id) return false
            if (options.tag && !discussion.tags?.includes(options.tag)) return false
            if (options.search) {
              const searchLower = options.search.toLowerCase()
              return (
        discussion.title.toLowerCase().includes(searchLower) ||
        (discussion.content && discussion.content.toLowerCase().includes(searchLower))
              )
            }
            return true
          })
          // Apply sorting
          if (options.sort_by) {
            data.sort((a, b) => {
              switch (options.sort_by) {
                case "newest":
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case "popular":
                  return (b.vote_score || 0) - (a.vote_score || 0)
                case "activity":
                  return (b.comment_count || 0) - (a.comment_count || 0)
                default:
                  return 0
              }
            })
          }
          // Apply pagination
          data = data.slice(currentOffset, currentOffset + 10)
        }
      } else {
        // Normal discussion fetch with filters
        data = await getDiscussions({
          ...options,
          offset: currentOffset,
          limit: 10,
        })
      }

      if (isLoadMore) {
        setDiscussions((prev) => [...prev, ...(data || [])])
      } else {
        setDiscussions(data || [])
        setOffset(0)
      }

      setHasMore((data || []).length === 10)
      setOffset(currentOffset + (data || []).length)
    } catch (err) {
      // Always set empty array for failed requests
      setDiscussions([])

      // Only log actual errors, not empty data scenarios
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any).message
        const errorMessage = typeof message === 'string' ? message.toLowerCase() : ''
        const isEmptyDataError = errorMessage.includes('no discussions found') ||
          errorMessage.includes('no rows') ||
          errorMessage.includes('empty')

        if (!isEmptyDataError) {
          console.error("Error loading discussions:", err)
          setError(err instanceof Error ? err : new Error("Failed to load discussions"))
        }
      } else if (err) {
        // For other types of errors, still log them
        console.error("Error loading discussions:", err)
        setError(err instanceof Error ? err : new Error("Failed to load discussions"))
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadDiscussions(true)
    }
  }

  const refresh = () => {
    loadDiscussions(false)
  }

  useEffect(() => {
    setOffset(0)
    loadDiscussions(false)
  }, [
    options.category_id, 
    options.tag, 
    options.search, 
    options.sort_by, 
    options.author_id,
    options.activity,
    options.user_id
  ])

  return { discussions, loading, error, hasMore, loadMore, refresh }
}

// Hook for fetching discussion categories
export function useDiscussionCategories() {
  const [categories, setCategories] = useState<DiscussionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getDiscussionCategories()
        setCategories(data || []) // Ensure we always have an array
      } catch (err) {
        // Always set empty array for failed requests
        setCategories([])

        // Only log actual errors, not empty data scenarios
        if (err && typeof err === 'object' && 'message' in err) {
          const message = (err as any).message
          const errorMessage = typeof message === 'string' ? message.toLowerCase() : ''
          const isEmptyDataError = errorMessage.includes('no categories found') ||
            errorMessage.includes('no rows') ||
            errorMessage.includes('empty')

          if (!isEmptyDataError) {
            console.error("Error loading categories:", err)
            setError(err instanceof Error ? err : new Error("Failed to load categories"))
          }
        } else if (err) {
          // For other types of errors, still log them
          console.error("Error loading categories:", err)
          setError(err instanceof Error ? err : new Error("Failed to load categories"))
        }
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, loading, error }
}

// Hook for fetching a single discussion with comments
export function useDiscussion(id: string) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [comments, setComments] = useState<DiscussionComment[]>([])
  const [poll, setPoll] = useState<DiscussionPoll | null>(null)
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/discussions/${id}`)

      if (response.status === 404) {
        router.push("/discussions")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch discussion")
      }

      const data = await response.json()
      setDiscussion(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (sortBy = "newest") => {
    try {
      setCommentsLoading(true)
      const response = await fetch(`/api/discussions/${id}/comments?sort_by=${sortBy}&parentId=null`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data || [])
    } catch (err) {
      // Always set empty array for failed requests
      setComments([])

      // Only log actual errors, not empty data scenarios
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as any).message
        const errorMessage = typeof message === 'string' ? message.toLowerCase() : ''
        const isEmptyDataError = errorMessage.includes('no comments found') ||
          errorMessage.includes('no rows') ||
          errorMessage.includes('empty')

        if (!isEmptyDataError) {
          console.error("Error fetching comments:", err)
        }
      } else if (err) {
        // For other types of errors, still log them
        console.error("Error fetching comments:", err)
      }
    } finally {
      setCommentsLoading(false)
    }
  }

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/discussions/${id}/poll`)

      if (response.status === 404) {
        // No poll for this discussion
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch poll")
      }

      const data = await response.json()
      setPoll(data.poll)
      setUserVotes(data.userVotes || [])
    } catch (err) {
      console.error("Error fetching poll:", err)
    }
  }

  useEffect(() => {
    if (id) {
      fetchDiscussion()
      fetchComments()
      fetchPoll()
    }
  }, [id])

  const refresh = () => {
    fetchDiscussion()
    fetchComments()
    fetchPoll()
  }

  const refreshComments = (sortBy = "newest") => {
    fetchComments(sortBy)
  }

  return {
    discussion,
    comments,
    poll,
    userVotes,
    loading,
    commentsLoading,
    error,
    refresh,
    refreshComments,
  }
}

// Helper function to convert database discussions to UI props format
export function mapDiscussionsToProps(discussions: Discussion[]): DiscussionProps[] {
  return discussions.map((discussion) => ({
    id: discussion.id,
    title: discussion.title,
    preview:
      discussion.content?.substring(0, 150) + (discussion.content && discussion.content.length > 150 ? "..." : "") ||
      "",
    author: {
      name: discussion.author?.full_name || "Anonymous",
      avatar: discussion.author?.avatar_url || "/placeholder.svg?height=40&width=40",
      role: discussion.author?.role,
    },
    timestamp: formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true }),
    commentCount: discussion.comment_count,
    likeCount: discussion.vote_score,
    view_count: discussion.view_count,
    tags: discussion.tags,
    isNew: new Date(discussion.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    hasPoll: discussion.content_type === "poll",
    poll: discussion.poll ? {
      question: discussion.poll.question,
      options: discussion.poll.options.map(option => ({
        emoji: option.emoji || "📊",
        text: option.text || option.option_text, // Use parsed text first, fallback to option_text
        votes: option.vote_count,
      })),
      allowMultiple: discussion.poll.is_multiple_choice,
      totalVotes: discussion.poll.total_votes,
    } : undefined,
  }))
}

// Hook for managing discussion CRUD operations
export function useDiscussionActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createNewDiscussion = async (discussionData: Partial<Discussion>) => {
    try {
      setLoading(true)
      setError(null)
      const discussion = await createDiscussion(discussionData)
      return discussion
    } catch (err) {
      console.error("Error creating discussion:", err)
      setError(err instanceof Error ? err : new Error("Failed to create discussion"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateExistingDiscussion = async (id: string, updates: Partial<Discussion>) => {
    try {
      setLoading(true)
      setError(null)
      const discussion = await updateDiscussion(id, updates)
      return discussion
    } catch (err) {
      console.error("Error updating discussion:", err)
      setError(err instanceof Error ? err : new Error("Failed to update discussion"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeDiscussion = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteDiscussion(id)
    } catch (err) {
      console.error("Error deleting discussion:", err)
      setError(err instanceof Error ? err : new Error("Failed to delete discussion"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (id: string) => {
    try {
      // Note: For client-side view tracking, it's better to let the API handle this
      // when fetching the discussion, rather than calling recordView directly from the client
      // This function is kept for compatibility but should ideally be removed
      console.log("View count increment requested for discussion:", id)
    } catch (err) {
      console.error("Error incrementing view count:", err)
    }
  }

  return {
    createNewDiscussion,
    updateExistingDiscussion,
    removeDiscussion,
    incrementViewCount,
    loading,
    error,
  }
}

// Hook for fetching discussion by ID or slug
export function useDiscussionByIdOrSlug(identifier: string, isSlug = false) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = isSlug
          ? await getDiscussionBySlug(identifier)
          : await getDiscussionById(identifier)
        setDiscussion(data)
      } catch (err) {
        console.error("Error fetching discussion:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch discussion"))
      } finally {
        setLoading(false)
      }
    }

    if (identifier) {
      fetchDiscussion()
    }
  }, [identifier, isSlug])

  const refresh = useCallback(async () => {
    if (identifier) {
      try {
        setLoading(true)
        const data = isSlug
          ? await getDiscussionBySlug(identifier)
          : await getDiscussionById(identifier)
        setDiscussion(data)
      } catch (err) {
        console.error("Error refreshing discussion:", err)
        setError(err instanceof Error ? err : new Error("Failed to refresh discussion"))
      } finally {
        setLoading(false)
      }
    }
  }, [identifier, isSlug])

  return { discussion, loading, error, refresh }
}

// Hook for managing discussion comments
export function useDiscussionComments(
  discussionId: string,
  options: {
    parentId?: string | null
    limit?: number
    sort_by?: "newest" | "oldest" | "popular"
  } = {}
) {
  const [comments, setComments] = useState<DiscussionComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const loadComments = async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)
      const currentOffset = isLoadMore ? offset : 0
      const data = await getDiscussionComments(discussionId, {
        parentId: options.parentId ?? null,
        sort_by: options.sort_by || "newest",
        offset: currentOffset,
        limit: options.limit,
      })

      if (isLoadMore) {
        setComments(prev => [...prev, ...data])
      } else {
        setComments(data)
        setOffset(0)
      }

      setHasMore(data.length === (options.limit || 50))
      setOffset(currentOffset + data.length)
    } catch (err) {
      console.error("Error loading comments:", err)
      setError(err instanceof Error ? err : new Error("Failed to load comments"))
    } finally {
      setLoading(false)
    }
  }

  const addComment = async (commentData: Partial<DiscussionComment>) => {
    try {
      const newComment = await createComment(commentData)
      setComments(prev => [newComment, ...prev])
      return newComment
    } catch (err) {
      console.error("Error creating comment:", err)
      throw err
    }
  }

  const editComment = async (id: string, updates: Partial<DiscussionComment>) => {
    try {
      const updatedComment = await updateComment(id, updates)
      setComments(prev =>
        prev.map(comment =>
          comment.id === id ? updatedComment : comment
        )
      )
      return updatedComment
    } catch (err) {
      console.error("Error updating comment:", err)
      throw err
    }
  }

  const removeComment = async (id: string) => {
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(comment => comment.id !== id))
    } catch (err) {
      console.error("Error deleting comment:", err)
      throw err
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadComments(true)
    }
  }

  const refresh = () => {
    loadComments(false)
  }

  useEffect(() => {
    if (discussionId) {
      setOffset(0)
      loadComments(false)
    }
  }, [discussionId, options.parentId, options.sort_by])

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    addComment,
    editComment,
    removeComment,
  }
}

// Hook for managing discussion polls
export function useDiscussionPoll(discussionId: string) {
  const [poll, setPoll] = useState<DiscussionPoll | null>(null)
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPoll = async () => {
    try {
      setLoading(true)
      setError(null)
      const pollData = await getDiscussionPoll(discussionId)
      setPoll(pollData)

      if (pollData) {
        // Fetch user votes for this poll (you'd need to pass userId)
        // For now, we'll set empty array
        setUserVotes([])
      }
    } catch (err) {
      console.error("Error fetching poll:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch poll"))
    } finally {
      setLoading(false)
    }
  }

  const createNewPoll = async (
    pollData: Partial<DiscussionPoll>,
    options: Partial<DiscussionPollOption>[]
  ) => {
    try {
      setLoading(true)
      setError(null)
      const newPoll = await createPoll(pollData, options)
      setPoll(newPoll)
      return newPoll
    } catch (err) {
      console.error("Error creating poll:", err)
      setError(err instanceof Error ? err : new Error("Failed to create poll"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const vote = async (optionId: string, userId: string) => {
    try {
      if (!poll) throw new Error("No poll available")

      await votePollSingleOption(poll.id, optionId, userId)

      // Refresh poll data and user votes
      const updatedPoll = await getDiscussionPoll(discussionId)
      const updatedUserVotes = await getUserPollVotes(poll.id, userId)

      setPoll(updatedPoll)
      setUserVotes(updatedUserVotes)
    } catch (err) {
      console.error("Error voting on poll:", err)
      throw err
    }
  }

  const fetchUserVotes = async (userId: string) => {
    try {
      if (!poll) return

      const votes = await getUserPollVotes(poll.id, userId)
      setUserVotes(votes)
    } catch (err) {
      console.error("Error fetching user votes:", err)
    }
  }

  useEffect(() => {
    if (discussionId) {
      fetchPoll()
    }
  }, [discussionId])

  return {
    poll,
    userVotes,
    loading,
    error,
    createNewPoll,
    vote,
    fetchUserVotes,
    refresh: fetchPoll,
  }
}

// Hook for managing attachments
export function useAttachments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const uploadAttachment = async (attachmentData: Partial<DiscussionAttachment>) => {
    try {
      setLoading(true)
      setError(null)
      const attachment = await createAttachment(attachmentData)
      return attachment
    } catch (err) {
      console.error("Error uploading attachment:", err)
      setError(err instanceof Error ? err : new Error("Failed to upload attachment"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeAttachment = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteAttachment(id)
    } catch (err) {
      console.error("Error deleting attachment:", err)
      setError(err instanceof Error ? err : new Error("Failed to delete attachment"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    uploadAttachment,
    removeAttachment,
    loading,
    error,
  }
}

// Hook for managing votes (discussions and comments)
export function useVoting() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const voteOnDiscussion = async (discussionId: string, userId: string, voteType: "up" | "down") => {
    try {
      setLoading(true)
      setError(null)
      await voteDiscussion(discussionId, userId, voteType)
    } catch (err) {
      console.error("Error voting on discussion:", err)
      setError(err instanceof Error ? err : new Error("Failed to vote on discussion"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const voteOnComment = async (commentId: string, userId: string, voteType: "up" | "down") => {
    try {
      setLoading(true)
      setError(null)
      await voteComment(commentId, userId, voteType)
    } catch (err) {
      console.error("Error voting on comment:", err)
      setError(err instanceof Error ? err : new Error("Failed to vote on comment"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    voteOnDiscussion,
    voteOnComment,
    loading,
    error,
  }
}

// // Hook for managing bookmarks
// export function useBookmarks(userId: string) {
//   const [bookmarks, setBookmarks] = useState<Discussion[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<Error | null>(null)

//   const fetchBookmarks = async () => {
//     if (!userId) {
//       setBookmarks([])
//       return
//     }

//     try {
//       setLoading(true)
//       setError(null)
//       const data = await getUserBookmarks(userId)
//       setBookmarks(data || []) // Ensure we always have an array
//     } catch (err) {
//       // Always set empty array for failed requests
//       setBookmarks([])

//       // Only log actual errors, not empty data scenarios
//       if (err && typeof err === 'object' && 'message' in err) {
//         const message = (err as any).message
//         const errorMessage = typeof message === 'string' ? message.toLowerCase() : ''
//         const isEmptyDataError = errorMessage.includes('no bookmarks found') ||
//           errorMessage.includes('no rows') ||
//           errorMessage.includes('empty')

//         if (!isEmptyDataError) {
//           console.error("Error fetching bookmarks:", err)
//           setError(err instanceof Error ? err : new Error("Failed to fetch bookmarks"))
//         }
//       } else if (err) {
//         // For other types of errors, still log them
//         console.error("Error fetching bookmarks:", err)
//         setError(err instanceof Error ? err : new Error("Failed to fetch bookmarks"))
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const toggleBookmarkItem = async (discussionId?: string, commentId?: string) => {
//     try {
//       const isBookmarked = await toggleBookmark(userId, discussionId, commentId)

//       // Refresh bookmarks list
//       if (discussionId) {
//         await fetchBookmarks()
//       }

//       return isBookmarked
//     } catch (err) {
//       console.error("Error toggling bookmark:", err)
//       throw err
//     }
//   }

//   useEffect(() => {
//     if (userId) {
//       fetchBookmarks()
//     }
//   }, [userId])

//   return {
//     bookmarks,
//     loading,
//     error,
//     toggleBookmarkItem,
//     refresh: fetchBookmarks,
//   }
// }

// Hook for tracking shares
export function useSharing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const shareContent = async (
    userId: string,
    shareType: "link" | "social",
    platform: string,
    discussionId: string,
    commentId?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      await recordShare(userId, shareType, platform, discussionId)
    } catch (err) {
      console.error("Error recording share:", err)
      setError(err instanceof Error ? err : new Error("Failed to record share"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    shareContent,
    loading,
    error,
  }
}

// Hook for tracking views
export function useViewing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const recordDiscussionView = async (
    discussionId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      await recordView(discussionId, userId, ipAddress, userAgent)
    } catch (err) {
      console.error("Error recording view:", err)
      setError(err instanceof Error ? err : new Error("Failed to record view"))
    } finally {
      setLoading(false)
    }
  }

  return {
    recordDiscussionView,
    loading,
    error,
  }
}

// Hook for reporting content
export function useReporting() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reportItem = async (
    reporterId: string,
    reason: "spam" | "harassment" | "inappropriate" | "misinformation" | "other",
    description?: string,
    discussionId?: string,
    commentId?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      await reportContent(reporterId, reason, description, discussionId, commentId)
    } catch (err) {
      console.error("Error reporting content:", err)
      setError(err instanceof Error ? err : new Error("Failed to report content"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    reportItem,
    loading,
    error,
  }
}

// Hook for fetching a single comment
export function useComment(commentId: string) {
  const [comment, setComment] = useState<DiscussionComment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchComment = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCommentById(commentId)
        setComment(data)
      } catch (err) {
        console.error("Error fetching comment:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch comment"))
      } finally {
        setLoading(false)
      }
    }

    if (commentId) {
      fetchComment()
    }
  }, [commentId])

  const refresh = useCallback(async () => {
    if (commentId) {
      try {
        setLoading(true)
        const data = await getCommentById(commentId)
        setComment(data)
      } catch (err) {
        console.error("Error refreshing comment:", err)
        setError(err instanceof Error ? err : new Error("Failed to refresh comment"))
      } finally {
        setLoading(false)
      }
    }
  }, [commentId])

  return { comment, loading, error, refresh }
}
