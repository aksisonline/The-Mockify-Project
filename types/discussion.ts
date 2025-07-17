// Discussion system types
export interface DiscussionCategory {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Discussion {
  id: string
  title: string
  content?: string
  content_type: "text" | "poll" | "link" | "image"
  author_id: string
  category_id?: string
  is_pinned: boolean
  is_locked: boolean
  is_archived: boolean
  is_deleted: boolean
  view_count: number
  comment_count: number
  vote_score: number
  share_count: number
  slug?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  last_activity_at: string

  // Joined fields
  author?: {
    id: string
    full_name?: string
    avatar_url?: string
    role?: string
  }
  category?: DiscussionCategory
  attachments?: DiscussionAttachment[]
  poll?: DiscussionPoll
}

export interface DiscussionComment {
  id: string
  discussion_id: string
  parent_id?: string
  author_id: string
  content: string
  is_deleted: boolean
  is_edited: boolean
  vote_score: number
  reply_count: number
  depth: number
  path?: string
  created_at: string
  updated_at: string

  // Joined fields
  author?: {
    id: string
    full_name?: string
    avatar_url?: string
    role?: string
  }
  replies?: DiscussionComment[]
  attachments?: DiscussionAttachment[]
}

export interface DiscussionPoll {
  id: string
  discussion_id: string
  question: string
  description?: string
  is_multiple_choice: boolean
  is_anonymous: boolean
  expires_at?: string
  total_votes: number
  created_at: string
  updated_at: string

  // Joined fields
  options: DiscussionPollOption[]
  userVotes?: string[] // Option IDs that the current user has voted for
}

export interface DiscussionPollOption {
  id: string
  poll_id: string
  option_text: string
  vote_count: number
  display_order: number
  created_at: string

  // UI fields (parsed from option_text JSON)
  text?: string // Parsed text from JSON
  emoji?: string // Parsed emoji from JSON
}

export interface DiscussionPollVote {
  id: string
  poll_id: string
  option_id: string
  user_id: string
  created_at: string
}

export interface DiscussionAttachment {
  id: string
  discussion_id?: string
  comment_id?: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  mime_type?: string
  alt_text?: string
  is_deleted: boolean
  uploaded_by: string
  created_at: string
}

export interface DiscussionVote {
  id: string
  user_id: string
  discussion_id?: string
  comment_id?: string
  vote_type: "up" | "down"
  created_at: string
  updated_at: string
}

export interface DiscussionBookmark {
  id: string
  user_id: string
  discussion_id?: string
  comment_id?: string
  created_at: string
}

export interface DiscussionShare {
  id: string
  user_id: string
  discussion_id?: string
  comment_id?: string
  share_type: "link" | "embed" | "social"
  platform?: string
  created_at: string
}

export interface DiscussionView {
  id: string
  user_id?: string
  discussion_id: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface DiscussionReport {
  id: string
  reporter_id: string
  discussion_id?: string
  comment_id?: string
  reason: "spam" | "harassment" | "inappropriate" | "misinformation" | "other"
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

// UI-specific types
export interface FileAttachment {
  id: string
  file: File
  type: "image" | "document"
  previewUrl?: string
}

export interface PollOption {
  emoji: string
  text: string
  votes?: number
}

export interface Poll {
  question: string
  options: {
    emoji: string
    text: string
    votes: number
  }[]
  allowMultiple: boolean
  totalVotes: number
}

// For the discussions list component
export interface DiscussionProps {
  id: string
  title: string
  preview: string
  author: {
    name: string
    avatar: string
    role?: string
  }
  timestamp: string
  commentCount: number
  likeCount: number
  view_count?: number
  tags?: string[]
  isNew?: boolean
  hasPoll?: boolean
  poll?: Poll
}
