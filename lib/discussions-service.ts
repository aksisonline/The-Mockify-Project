import { createBrowserClient } from "@/lib/supabase/client"
import type {
  Discussion,
  DiscussionCategory,
  DiscussionComment,
  DiscussionPoll,
  DiscussionPollOption,
  DiscussionAttachment,
  DiscussionBookmark,
} from "@/types/discussion"

const supabase = createBrowserClient()
// Categories
export async function getDiscussionCategories(): Promise<DiscussionCategory[]> {
  const { data, error } = await supabase.from("discussion_categories").select("*").order("name")

  if (error) throw error
  return data || []
}

// Discussions
export async function getDiscussions(
  options: {
    limit?: number
    offset?: number
    category_id?: string
    tag?: string
    search?: string
    sort_by?: "newest" | "popular" | "activity"
    author_id?: string
  } = {},
): Promise<Discussion[]> {
  const { limit = 10, offset = 0, category_id, tag, search, sort_by = "newest", author_id } = options

  let query = supabase
    .from("discussions")
    .select(`
      *,
      author:author_id (id, full_name, avatar_url),
      category:category_id (id, name, color, icon),
      poll:discussion_polls (
        id,
        question,
        is_multiple_choice,
        is_anonymous,
        total_votes,
        created_at,
        options:discussion_poll_options (
          id,
          option_text,
          vote_count,
          display_order
        )
      ),
      views_count:discussion_views(count)
    `)
    .eq("is_deleted", false)

  if (category_id) {
    query = query.eq("category_id", category_id)
  }

  if (tag) {
    query = query.contains("tags", [tag])
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  if (author_id) {
    query = query.eq("author_id", author_id)
  }

  // Apply sorting
  switch (sort_by) {
    case "popular":
      query = query.order("vote_score", { ascending: false })
      break
    case "activity":
      query = query.order("last_activity_at", { ascending: false })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error
  
  // Process the discussions data to parse poll options and view counts
  const processedData = (data || []).map((discussion: any) => {
    // Parse poll options if the discussion has a poll
    if (discussion.poll && discussion.poll.length > 0) {
      const poll = discussion.poll[0] // Assuming one poll per discussion
      if (poll.options) {
        poll.options = poll.options
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((option: any) => {
            const parsedOption = parsePollOptionText(option.option_text)
            return {
              ...option,
              text: parsedOption.text,
              emoji: parsedOption.emoji,
              option_text: option.option_text
            }
          })
      }
      // Replace array with single poll object
      discussion.poll = poll
    } else {
      // No poll for this discussion
      discussion.poll = null
    }
    
    // Process view count from discussion_views table
    discussion.view_count = discussion.views_count && discussion.views_count.length > 0 
      ? discussion.views_count[0].count 
      : 0
    
    // Remove the temporary views_count field
    delete discussion.views_count
    
    return discussion
  })

  // Filter out discussions with missing author (e.g., deleted user)
  return processedData.filter((d) => d.author)
}

export async function getDiscussionById(id: string, userId?: string): Promise<Discussion | null> {
  const { data, error } = await supabase
    .from("discussions")
    .select(`
      *,
      author:author_id (id, full_name, avatar_url),
      category:category_id (id, name, color, icon),
      attachments:discussion_attachments!discussion_id(*),
      views_count:discussion_views(count)
    `)
    .eq("id", id)
    .eq("is_deleted", false)  // Only return non-deleted discussions
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Record not found or Not Acceptable
    throw error
  }

  // Get poll data if this discussion has a poll
  let pollData = null
  if (data && data.content_type === "poll") {
    pollData = await getDiscussionPoll(id)
    
    // Get user's votes if userId is provided
    if (pollData && userId) {
      const userVotes = await getUserPollVotes(pollData.id, userId)
      pollData = { ...pollData, userVotes }
    }
  }

  // Process view count from discussion_views table
  const view_count = data.views_count && data.views_count.length > 0 
    ? data.views_count[0].count 
    : 0

  return {
    ...data,
    view_count,
    poll: pollData
  }
}

export async function getDiscussionBySlug(slug: string): Promise<Discussion | null> {
  const { data, error } = await supabase
    .from("discussions")
    .select(`
      *,
      author:author_id (id, full_name, avatar_url),
      category:category_id (id, name, color, icon),
      attachments:discussion_attachments!discussion_id(*)
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116" ) return null // Record not found or Not Acceptable
    throw error
  }

  return data
}

export async function createDiscussion(discussion: Partial<Discussion>): Promise<Discussion> {
  // Generate a slug from the title
  if (discussion.title && !discussion.slug) {
    discussion.slug =
      discussion.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 100) +
      "-" +
      Date.now().toString(36)
  }

  // Extract only the fields that belong to the discussions table
  // Remove any fields that don't exist in the schema (like 'poll')
  const {
    poll, // Remove poll field - it belongs to a separate table
    ...discussionData
  } = discussion

  const { data, error } = await supabase.from("discussions").insert(discussionData).select().single()

  if (error) throw error
  return data
}

export async function updateDiscussion(id: string, updates: Partial<Discussion>): Promise<Discussion> {
  const { data, error } = await supabase.from("discussions").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteDiscussion(id: string): Promise<void> {
  // Soft delete
  const { error } = await supabase.from("discussions").update({ is_deleted: true }).eq("id", id)

  if (error) throw error
}

export async function incrementDiscussionViewCount(id: string): Promise<void> {
  const { error } = await supabase
    .from("discussions")
    .update({ view_count: supabase.rpc("increment", { x: 1 }) })
    .eq("id", id)

  if (error) throw error
}

// Comments
export async function getDiscussionComments(
  discussionId: string,
  { parentId, sort_by, offset, limit }: { parentId: string | null; sort_by: string; offset?: number; limit?: number }
): Promise<DiscussionComment[]> {
  let query = supabase
    .from("discussion_comments")
    .select(`
      *,
      author:author_id (id, full_name, avatar_url),
      attachments:discussion_attachments!comment_id(*)
    `)
    .eq("discussion_id", discussionId)
    .eq("is_deleted", false)  // Only return non-deleted comments
    
  // Handle null parentId properly
  if (parentId === null) {
    query = query.is("parent_id", null)
  } else {
    query = query.eq("parent_id", parentId)
  }
  
  const { data, error } = await query.order("created_at", { ascending: sort_by === "oldest" })

  if (error) throw error
  return data || []
}

export async function getCommentById(id: string): Promise<DiscussionComment | null> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .select(`
      *,
      author:author_id (id, full_name, avatar_url),
      attachments:discussion_attachments!comment_id(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116" ) return null // Record not found or Not Acceptable
    throw error
  }

  return data
}

export async function createComment(comment: Partial<DiscussionComment>): Promise<DiscussionComment> {
  try {
    // If this is a reply, get the parent comment to calculate depth and path
    if (comment.parent_id) {
      const parent = await getCommentById(comment.parent_id);
      if (!parent) {
        throw new Error("Parent comment not found");
      }
      comment.depth = parent.depth + 1;
      comment.path = parent.path ? `${parent.path}.${parent.id}` : parent.id;
    } else {
      comment.depth = 0;
    }

    // Validate required fields
    if (!comment.content) {
      throw new Error("Comment content is required");
    }
    if (!comment.discussion_id) {
      throw new Error("Discussion ID is required");
    }
    if (!comment.author_id) {
      throw new Error("Author ID is required");
    }

    const { data, error } = await supabase
      .from("discussion_comments")
      .insert(comment)
      .select(`
        *,
        author:author_id (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw new Error(error.message || "Failed to create comment");
    }

    return data;
  } catch (error) {
    console.error("Error in createComment:", error);
    throw error;
  }
}

export async function updateComment(id: string, updates: Partial<DiscussionComment>): Promise<DiscussionComment> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .update({ ...updates, is_edited: true })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(id: string): Promise<void> {
  // Soft delete
  const { error } = await supabase.from("discussion_comments").update({ is_deleted: true }).eq("id", id)

  if (error) throw error
}

// Polls
export async function getDiscussionPoll(discussionId: string): Promise<DiscussionPoll | null> {
  const { data, error } = await supabase
    .from("discussion_polls")
    .select(`
      *,
      options:discussion_poll_options(*)
    `)
    .eq("discussion_id", discussionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Record not found or Not Acceptable
    throw error
  }

  // Parse poll options to extract emoji and text from JSON
  if (data && data.options) {
    data.options = data.options
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((option: any) => {
        const parsedOption = parsePollOptionText(option.option_text)
        return {
          ...option,
          text: parsedOption.text,
          emoji: parsedOption.emoji,
          option_text: option.option_text
        }
      })
  }

  return data
}

export async function createPoll(
  poll: Partial<DiscussionPoll>,
  options: Partial<DiscussionPollOption>[],
): Promise<DiscussionPoll> {
  console.log('🏗️ createPoll called with:', {
    poll: poll,
    optionsCount: options.length,
    options: options
  })

  // First create the poll
  console.log('🔄 Inserting poll into discussion_polls table...')
  const { data: pollData, error: pollError } = await supabase.from("discussion_polls").insert(poll).select().single()

  if (pollError) {
    console.error('❌ Error inserting poll:', pollError)
    throw pollError
  }
  
  console.log('✅ Poll inserted successfully:', pollData)

  // Then create the options
  const optionsWithPollId = options.map((option, index) => ({
    ...option,
    poll_id: pollData.id,
    display_order: index,
  }))

  console.log('🔄 Inserting poll options:', optionsWithPollId)

  const { data: optionsData, error: optionsError } = await supabase
    .from("discussion_poll_options")
    .insert(optionsWithPollId)
    .select()

  if (optionsError) {
    console.error('❌ Error inserting poll options:', optionsError)
    throw optionsError
  }

  console.log('✅ Poll options inserted successfully:', optionsData)

  const result = {
    ...pollData,
    options: optionsData,
  }
  
  console.log('🎉 createPoll completed successfully:', result)
  return result
}

export async function getUserPollVotes(pollId: string, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("discussion_poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)

  if (error) throw error
  return data?.map((vote) => vote.option_id) || []
}

// Helper function to parse poll option text (handles both JSON and plain text)
function parsePollOptionText(optionText: string): { text: string; emoji?: string } {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(optionText)
    if (typeof parsed === 'object' && parsed.text) {
      return {
        text: parsed.text,
        emoji: parsed.emoji || '📊'
      }
    }
  } catch (e) {
    // If parsing fails, treat as plain text (backward compatibility)
  }
  
  // Fallback to plain text
  return {
    text: optionText,
    emoji: '📊'
  }
}

export async function getPollWithVotes(pollId: string, userId?: string): Promise<DiscussionPoll | null> {
  const { data: poll, error: pollError } = await supabase
    .from("discussion_polls")
    .select(`
      *,
      options:discussion_poll_options(*)
    `)
    .eq("id", pollId)
    .single()

  if (pollError) {
    if (pollError.code === "PGRST116") return null
    throw pollError
  }

  // Get user's votes if userId is provided
  let userVotes: string[] = []
  if (userId) {
    userVotes = await getUserPollVotes(pollId, userId)
  }

  return {
    ...poll,
    userVotes,
    options: poll.options
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((option: any) => {
        const parsedOption = parsePollOptionText(option.option_text)
        return {
          ...option,
          text: parsedOption.text,
          emoji: parsedOption.emoji,
          // Keep original option_text for database operations
          option_text: option.option_text
        }
      })
  }
}

export async function deletePoll(pollId: string): Promise<void> {
  // Cascade delete will handle votes and options
  const { error } = await supabase
    .from("discussion_polls")
    .delete()
    .eq("id", pollId)

  if (error) throw error
}

export async function updatePoll(
  pollId: string, 
  updates: Partial<DiscussionPoll>
): Promise<DiscussionPoll> {
  const { data, error } = await supabase
    .from("discussion_polls")
    .update(updates)
    .eq("id", pollId)
    .select(`
      *,
      options:discussion_poll_options(*)
    `)
    .single()

  if (error) throw error
  return data
}

// Attachments
export async function createAttachment(attachment: Partial<DiscussionAttachment>): Promise<DiscussionAttachment> {
  const { data, error } = await supabase.from("discussion_attachments").insert(attachment).select().single()

  if (error) throw error
  return data
}

export async function deleteAttachment(id: string): Promise<void> {
  // Soft delete
  const { error } = await supabase.from("discussion_attachments").update({ is_deleted: true }).eq("id", id)

  if (error) throw error
}

// Votes
export async function voteDiscussion(discussionId: string, userId: string, voteType: "up" | "down"): Promise<void> {
  try {
    if (voteType === "down") {
      // For discussions, "down" means removing the like/upvote
      await supabase
        .from("discussion_votes")
        .delete()
        .eq("discussion_id", discussionId)
        .eq("user_id", userId)
    } else {
      // Upsert the upvote
      await supabase
        .from("discussion_votes")
        .upsert({
          discussion_id: discussionId,
          user_id: userId,
          vote_type: "up", // Discussions only support upvotes (likes)
          created_at: new Date().toISOString(),
        })
    }

    // Update the discussion's vote score
    await updateDiscussionVoteScore(discussionId)
  } catch (error) {
    console.error("Error voting on discussion:", error)
    throw new Error("Failed to vote on discussion")
  }
}

export async function voteComment(commentId: string, userId: string, voteType: "up" | "down" | "neutral"): Promise<void> {
  try {
    if (voteType === "neutral") {
      // Remove any existing vote using comment_id
      await supabase
        .from("discussion_votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId)
    } else {
      // Upsert the vote using comment_id field
      await supabase
        .from("discussion_votes")
        .upsert({
          comment_id: commentId, // Use comment_id for comment votes
          user_id: userId,
          vote_type: voteType,
          created_at: new Date().toISOString(),
        })
    }

    // Update the comment's vote score
    await updateCommentVoteScore(commentId)
  } catch (error) {
    console.error("Error voting on comment:", error)
    throw new Error("Failed to vote on comment")
  }
}

export async function votePoll(pollId: string, optionIds: string[], userId: string): Promise<void> {
  try {
    // Get poll details to validate the vote
    const { data: poll, error: pollError } = await supabase
      .from("discussion_polls")
      .select("is_multiple_choice, expires_at")
      .eq("id", pollId)
      .single()

    if (pollError) throw pollError

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      throw new Error("Poll has expired")
    }

    // If not multiple choice, ensure only one option is selected
    if (!poll.is_multiple_choice && optionIds.length > 1) {
      throw new Error("This poll only allows one selection")
    }

    // Remove existing votes for this user and poll
    await supabase
      .from("discussion_poll_votes")
      .delete()
      .eq("poll_id", pollId)
      .eq("user_id", userId)

    // Add new votes
    if (optionIds.length > 0) {
      const votes = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
        created_at: new Date().toISOString()
      }))

      const { error: voteError } = await supabase
        .from("discussion_poll_votes")
        .insert(votes)

      if (voteError) throw voteError
    }

    // Update vote counts
    await updatePollVoteCounts(pollId)
  } catch (error) {
    console.error("Error voting on poll:", error)
    throw new Error("Failed to vote on poll")
  }
}

// Backward compatibility wrapper for single option voting
export async function votePollSingleOption(pollId: string, optionId: string, userId: string): Promise<void> {
  // Get current user votes to determine if we're toggling
  const currentVotes = await getUserPollVotes(pollId, userId)
  
  if (currentVotes.includes(optionId)) {
    // User already voted for this option, remove it
    const newVotes = currentVotes.filter(id => id !== optionId)
    await votePoll(pollId, newVotes, userId)
  } else {
    // User hasn't voted for this option, add it
    // For single choice polls, this will replace existing votes
    // For multiple choice polls, this will add to existing votes
    const { data: poll } = await supabase
      .from("discussion_polls")
      .select("is_multiple_choice")
      .eq("id", pollId)
      .single()
    
    if (!poll) throw new Error("Poll not found")
    
    const newVotes = poll.is_multiple_choice 
      ? [...currentVotes, optionId]  // Add to existing votes for multiple choice
      : [optionId]                   // Replace all votes for single choice
    
    await votePoll(pollId, newVotes, userId)
  }
}

// Helper functions for updating vote scores
async function updateDiscussionVoteScore(discussionId: string): Promise<void> {
  // Calculate vote score from votes table
  const { data: voteData } = await supabase
    .from("discussion_votes")
    .select("vote_type")
    .eq("discussion_id", discussionId)

  if (voteData) {
    const upvotes = voteData.filter(v => v.vote_type === "up").length
    const downvotes = voteData.filter(v => v.vote_type === "down").length
    const voteScore = upvotes - downvotes

    await supabase
      .from("discussions")
      .update({ vote_score: voteScore })
      .eq("id", discussionId)
  }
}

async function updateCommentVoteScore(commentId: string): Promise<void> {
  // Calculate vote score from votes table using comment_id
  const { data: voteData } = await supabase
    .from("discussion_votes")
    .select("vote_type")
    .eq("comment_id", commentId) // Use comment_id for comment votes

  if (voteData) {
    const upvotes = voteData.filter(v => v.vote_type === "up").length
    const downvotes = voteData.filter(v => v.vote_type === "down").length
    const voteScore = upvotes - downvotes

    await supabase
      .from("discussion_comments")
      .update({ vote_score: voteScore })
      .eq("id", commentId)
  }
}

async function updatePollVoteCounts(pollId: string): Promise<void> {
  // Get all options for this poll
  const { data: options } = await supabase
    .from("discussion_poll_options")
    .select("id")
    .eq("poll_id", pollId)

  if (options) {
    // Update vote count for each option
    for (const option of options) {
      const { data: voteData } = await supabase
        .from("discussion_poll_votes")
        .select("id")
        .eq("option_id", option.id)

      const voteCount = voteData?.length || 0

      await supabase
        .from("discussion_poll_options")
        .update({ vote_count: voteCount })
        .eq("id", option.id)
    }

    // Update total votes for the poll
    const { data: totalVoteData } = await supabase
      .from("discussion_poll_votes")
      .select("id")
      .eq("poll_id", pollId)

    const totalVotes = totalVoteData?.length || 0

    await supabase
      .from("discussion_polls")
      .update({ total_votes: totalVotes })
      .eq("id", pollId)
  }
}

// Bookmarks
export async function toggleBookmark(userId: string, discussionId: string): Promise<boolean> {
  try {
    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
      .from("discussion_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("discussion_id", discussionId)
      .single()

    if (existingBookmark) {
      // Remove bookmark
      await supabase
        .from("discussion_bookmarks")
        .delete()
        .eq("id", existingBookmark.id)
      return false
    } else {
      // Add bookmark
      await supabase
        .from("discussion_bookmarks")
        .insert({
          user_id: userId,
          discussion_id: discussionId
        })
      return true
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw new Error("Failed to toggle bookmark")
  }
}

// Shares
export async function recordShare(
  userId: string,
  shareType: "link" | "social",
  platform: string,
  discussionId: string
): Promise<void> {
  try {
    await supabase
      .from("discussion_shares")
      .insert({
        user_id: userId,
        discussion_id: discussionId,
        share_type: shareType,
        platform: platform,
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error("Error recording share:", error)
    throw new Error("Failed to record share")
  }
}

// Reports
export async function reportContent(
  reporterId: string,
  reason: "spam" | "harassment" | "inappropriate" | "misinformation" | "other",
  description?: string,
  discussionId?: string,
  commentId?: string,
): Promise<void> {
  const { error } = await supabase.from("discussion_reports").insert({
    reporter_id: reporterId,
    discussion_id: discussionId,
    comment_id: commentId,
    reason,
    description,
  })

  if (error) throw error
}

export async function getRelatedDiscussions(
  currentDiscussionId: string,
  categoryId?: string,
  authorId?: string,
  limit: number = 5
): Promise<Discussion[]> {
  const relatedDiscussions: Discussion[] = []

  try {
    // First, try to get discussions from the same category
    if (categoryId && relatedDiscussions.length < limit) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("discussions")
        .select(`
          *,
          author:author_id (id, full_name, avatar_url),
          category:category_id (id, name, color, icon)
        `)
        .eq("category_id", categoryId)
        .eq("is_deleted", false)
        .neq("id", currentDiscussionId)
        .order("vote_score", { ascending: false })
        .limit(limit)

      if (!categoryError && categoryData) {
        relatedDiscussions.push(...categoryData.filter((d) => d.author))
      }
    }

    // If we need more, get discussions from the same author
    if (authorId && relatedDiscussions.length < limit) {
      const remainingLimit = limit - relatedDiscussions.length
      const { data: authorData, error: authorError } = await supabase
        .from("discussions")
        .select(`
          *,
          author:author_id (id, full_name, avatar_url),
          category:category_id (id, name, color, icon)
        `)
        .eq("author_id", authorId)
        .eq("is_deleted", false)
        .neq("id", currentDiscussionId)
        .order("created_at", { ascending: false })
        .limit(remainingLimit)

      if (!authorError && authorData) {
        // Filter out discussions already in relatedDiscussions
        const newAuthorDiscussions = authorData.filter(
          (d) => d.author && !relatedDiscussions.some((rd) => rd.id === d.id)
        )
        relatedDiscussions.push(...newAuthorDiscussions)
      }
    }

    // If we still need more, get popular discussions
    if (relatedDiscussions.length < limit) {
      const remainingLimit = limit - relatedDiscussions.length
      const { data: popularData, error: popularError } = await supabase
        .from("discussions")
        .select(`
          *,
          author:author_id (id, full_name, avatar_url),
          category:category_id (id, name, color, icon)
        `)
        .eq("is_deleted", false)
        .neq("id", currentDiscussionId)
        .order("vote_score", { ascending: false })
        .limit(remainingLimit)

      if (!popularError && popularData) {
        // Filter out discussions already in relatedDiscussions
        const newPopularDiscussions = popularData.filter(
          (d) => d.author && !relatedDiscussions.some((rd) => rd.id === d.id)
        )
        relatedDiscussions.push(...newPopularDiscussions)
      }
    }

    // Return only the requested limit
    return relatedDiscussions.slice(0, limit)
  } catch (error) {
    console.error("Error fetching related discussions:", error)
    return []
  }
}

// Get user's vote for a specific comment
export async function getUserCommentVote(commentId: string, userId: string): Promise<{ vote_type: "up" | "down" } | null> {
  try {
    // Use comment_id field for comment votes
    const { data, error } = await supabase
      .from("discussion_votes")
      .select("vote_type")
      .eq("comment_id", commentId) // Use comment_id for comment votes
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error getting user comment vote:", error)
    return null
  }
}

// Get user's vote for a specific discussion
export async function getUserDiscussionVote(discussionId: string, userId: string): Promise<{ vote_type: "up" | "down" } | null> {
  try {
    const { data, error } = await supabase
      .from("discussion_votes")
      .select("vote_type")
      .eq("discussion_id", discussionId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error getting user discussion vote:", error)
    return null
  }
}

// Get user's bookmark for a discussion
export async function getUserBookmark(discussionId: string, userId: string): Promise<DiscussionBookmark | null> {
  try {
    const { data, error } = await supabase
      .from("discussion_bookmarks")
      .select("*")
      .eq("discussion_id", discussionId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }

    return data
  } catch (error) {
    console.error("Error getting user bookmark:", error)
    throw new Error("Failed to get user bookmark")
  }
}

// Get all bookmarks for a user
export async function getUserBookmarks(userId: string): Promise<Discussion[]> {
  try {
    const { data, error } = await supabase
      .from("discussion_bookmarks")
      .select(`
        discussion_id,
        discussions:discussion_id (
          *,
          author:author_id (id, full_name, avatar_url),
          category:category_id (id, name, color, icon),
          attachments:discussion_attachments!discussion_id(*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    
    // Extract the discussions from the bookmarks and filter valid ones
    const discussions = data
      ?.map((bookmark: any) => bookmark.discussions)
      .filter((discussion: any) => discussion && !discussion.is_deleted) || []
    
    return discussions as Discussion[]
  } catch (error) {
    console.error("Error getting user bookmarks:", error)
    return []
  }
}

export async function recordView(
  discussionId: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase
      .from("discussion_views")
      .insert({
        discussion_id: discussionId,
        user_id: userId || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error("Error recording view:", error)
    throw new Error("Failed to record view")
  }
}