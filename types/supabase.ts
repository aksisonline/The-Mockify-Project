// Database types for all Supabase tables

// User Profile related types
export interface Profile {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  is_public: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  country?: string
  zip_code?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  user_id: string
  name?: string
  completion_id?: string
  url?: string
  validity?: string
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  user_id: string
  institution?: string
  degree?: string
  field_of_study?: string
  start_date?: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Employment {
  id: string
  user_id: string
  company_name?: string
  designation?: string
  work_status?: string
  total_experience_years?: number
  total_experience_months?: number
  start_date?: string
  end_date?: string
  is_indian: boolean
  created_at: string
  updated_at: string
}

export interface SocialLink {
  id: string
  user_id: string
  platform?: string
  url?: string
  created_at: string
  updated_at: string
}

// Points and Rewards related types
export interface Point {
  id: string
  user_id: string
  total_points: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
  last_updated: string
}

export interface PointsCategory {
  id: string
  name: string
  display_name: string
  description?: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPointsByCategory {
  user_id: string
  category_id: string
  category_name: string
  category_display_name: string
  category_icon?: string
  category_color?: string
  total_earned: number
  total_spent: number
  net_points: number
  transaction_count: number
  last_transaction_date?: string
}

export interface PointTransaction {
  id: string
  user_id: string
  points: number
  transaction_type: "earned" | "spent" | "bonus" | "penalty"
  description?: string
  reference_id?: string
  reference_type?: string
  created_at: string
}

export interface ProfileCompletion {
  id: string
  user_id: string
  completion_percentage: number
  last_calculated: string
  created_at: string
  updated_at: string
}

export interface Reward {
  id: string
  title: string
  description: string
  price: number
  quantity: number
  delivery_description?: string
  category: "merchandise" | "digital" | "experiences"
  image_url?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RewardPurchase {
  id: string
  user_id: string
  reward_id: string
  points_spent: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shipping_address?: string
  contact_number?: string
  notes?: string
  purchased_at: string
  updated_at: string
  reward?: Reward
}

// Transaction status history entry
export interface TransactionStatusHistoryEntry {
  status: string
  timestamp: string
  note: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: "earn" | "spend"
  reason: string
  metadata?: any
  transaction_type: "points" | "real"
  status: "pending" | "completed" | "failed" | "initiated" | "processing" | "refunded" | "cancelled"
  
  // Points transaction specific fields
  category_id?: string
  
  // Real transaction specific fields
  currency?: string
  payment_method?: string
  reference_id?: string
  status_history?: TransactionStatusHistoryEntry[]
  
  created_at: string
  updated_at?: string
}

// E-Kart related types
export interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: "New" | "Like New" | "Good" | "Fair" | "For Parts"
  category: string
  location?: string
  image_url?: string
  is_featured: boolean
  is_active: boolean
  quantity: number
  posted_at: string
  updated_at: string
  seller?: {
    id: string
    name?: string
    avatar_url?: string
  }
}

export interface ProductCategory {
  id: string
  name: string
  icon?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  added_at: string
  updated_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  transaction_id?: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  shipping_address: string
  contact_number: string
  payment_method: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product_condition?: string
  created_at: string
}

// Training related types
export interface TrainingProgram {
  id: string
  title: string
  description: string
  topics: string
  duration: string
  mode: string
  fees: string
  image_url?: string
  is_featured: boolean
  is_active: boolean
  weekly_curriculum?: any[]
  hardware_requirements?: string[]
  software_requirements?: string[]
  advantages?: string[]
  learning_outcomes?: string[]
  instructors?: any[]
  created_at: string
  updated_at: string
}

export interface TrainingEnrollment {
  id: string
  program_id: string
  full_name: string
  email: string
  mobile_number: string
  location: string
  working_status: "yes" | "no"
  preferred_mode: "online" | "classroom"
  enrollment_status: "pending" | "confirmed" | "cancelled" | "completed"
  enrolled_at: string
  updated_at: string
  program?: TrainingProgram
}

// Discussion related types
export interface Discussion {
  id: string
  title: string
  content: string
  author_id: string
  category_id?: string
  tags?: string[]
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
  author?: {
    id: string
    full_name?: string
    avatar_url?: string
  }
  category?: DiscussionCategory
}

export interface DiscussionCategory {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DiscussionComment {
  id: string
  discussion_id: string
  parent_id?: string
  author_id: string
  content: string
  upvotes: number
  downvotes: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  author?: {
    id: string
    full_name?: string
    avatar_url?: string
  }
  replies?: DiscussionComment[]
}

export interface DiscussionVote {
  id: string
  user_id: string
  discussion_id?: string
  comment_id?: string
  vote_type: "upvote" | "downvote"
  created_at: string
}

export interface DiscussionBookmark {
  id: string
  user_id: string
  discussion_id: string
  created_at: string
}

export interface DiscussionAttachment {
  id: string
  discussion_id?: string
  comment_id?: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string
  is_deleted: boolean
  created_at: string
}

export interface DiscussionPoll {
  id: string
  discussion_id: string
  question: string
  options: string[]
  votes: number[]
  multiple_choice: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface DiscussionPollVote {
  id: string
  poll_id: string
  user_id: string
  option_index: number
  created_at: string
}

export interface DiscussionShare {
  id: string
  discussion_id: string
  user_id: string
  platform: string
  created_at: string
}

// Events related types
export interface Event {
  id: string
  title: string
  description: string
  content: string
  image_url?: string
  start_date: string
  end_date: string
  location?: string
  category: string
  registration_url?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

// Tool Purchases related types
export interface ToolPurchase {
  id: string
  user_id: string
  tool_id: string | null
  points_spent: number
  purchased_at: string
  status: "active" | "expired" | "cancelled" | "completed"
  expires_at?: string
  created_at: string
  updated_at: string
}

// Job related types
export interface Job {
  id: string
  title: string
  description: string
  company: string
  location?: string
  salary_range?: string
  job_type: "full-time" | "part-time" | "contract" | "internship"
  experience_level: "entry-level" | "mid-level" | "senior-level" | "executive"
  requirements?: string[]
  benefits?: string[]
  posted_by: string
  created_at: string
  updated_at: string
  application_deadline?: string
  is_active: boolean
  category?: string // Add category field
  company_logo?: string
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "accepted"
  cover_letter?: string
  resume_url?: string
  applied_at: string
  updated_at: string
  notes?: string
}

// Views
export interface PublicProfile {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  is_public: boolean
  created_at: string
  updated_at: string
  company_name?: string
  designation?: string
  work_status?: string
  total_experience_years?: number
  total_experience_months?: number
  city?: string
  country?: string
  certifications_count: number
  certifications?: string[]
  social_links?: Record<string, string>
  total_points?: number
  completion_percentage?: number
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
      }
      addresses: {
        Row: Address
        Insert: Omit<Address, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Address, "id" | "created_at" | "updated_at">>
      }
      certifications: {
        Row: Certification
        Insert: Omit<Certification, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Certification, "id" | "created_at" | "updated_at">>
      }
      education: {
        Row: Education
        Insert: Omit<Education, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Education, "id" | "created_at" | "updated_at">>
      }
      employment: {
        Row: Employment
        Insert: Omit<Employment, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Employment, "id" | "created_at" | "updated_at">>
      }
      social_links: {
        Row: SocialLink
        Insert: Omit<SocialLink, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<SocialLink, "id" | "created_at" | "updated_at">>
      }
      points: {
        Row: Point
        Insert: Omit<Point, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Point, "id" | "created_at" | "updated_at">>
      }
      point_transactions: {
        Row: PointTransaction
        Insert: Omit<PointTransaction, "id" | "created_at">
        Update: Partial<Omit<PointTransaction, "id" | "created_at">>
      }
      profile_completion: {
        Row: ProfileCompletion
        Insert: Omit<ProfileCompletion, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ProfileCompletion, "id" | "created_at" | "updated_at">>
      }
      rewards: {
        Row: Reward
        Insert: Omit<Reward, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Reward, "id" | "created_at" | "updated_at">>
      }
      reward_purchases: {
        Row: RewardPurchase
        Insert: Omit<RewardPurchase, "id" | "purchased_at" | "updated_at">
        Update: Partial<Omit<RewardPurchase, "id" | "purchased_at" | "updated_at">>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Transaction, "id" | "created_at" | "updated_at">>
      }
      products: {
        Row: Product
        Insert: Omit<Product, "id" | "posted_at" | "updated_at">
        Update: Partial<Omit<Product, "id" | "posted_at" | "updated_at">>
      }
      product_categories: {
        Row: ProductCategory
        Insert: Omit<ProductCategory, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ProductCategory, "id" | "created_at" | "updated_at">>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, "id" | "added_at" | "updated_at">
        Update: Partial<Omit<CartItem, "id" | "added_at" | "updated_at">>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, "id" | "created_at">
        Update: Partial<Omit<OrderItem, "id" | "created_at">>
      }
      training_programs: {
        Row: TrainingProgram
        Insert: Omit<TrainingProgram, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<TrainingProgram, "id" | "created_at" | "updated_at">>
      }
      training_enrollments: {
        Row: TrainingEnrollment
        Insert: Omit<TrainingEnrollment, "id" | "enrolled_at" | "updated_at">
        Update: Partial<Omit<TrainingEnrollment, "id" | "enrolled_at" | "updated_at">>
      }
      discussions: {
        Row: Discussion
        Insert: Omit<Discussion, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Discussion, "id" | "created_at" | "updated_at">>
      }
      discussion_categories: {
        Row: DiscussionCategory
        Insert: Omit<DiscussionCategory, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<DiscussionCategory, "id" | "created_at" | "updated_at">>
      }
      discussion_comments: {
        Row: DiscussionComment
        Insert: Omit<DiscussionComment, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<DiscussionComment, "id" | "created_at" | "updated_at">>
      }
      discussion_votes: {
        Row: DiscussionVote
        Insert: Omit<DiscussionVote, "id" | "created_at">
        Update: Partial<Omit<DiscussionVote, "id" | "created_at">>
      }
      discussion_bookmarks: {
        Row: DiscussionBookmark
        Insert: Omit<DiscussionBookmark, "id" | "created_at">
        Update: Partial<Omit<DiscussionBookmark, "id" | "created_at">>
      }
      discussion_attachments: {
        Row: DiscussionAttachment
        Insert: Omit<DiscussionAttachment, "id" | "created_at">
        Update: Partial<Omit<DiscussionAttachment, "id" | "created_at">>
      }
      discussion_polls: {
        Row: DiscussionPoll
        Insert: Omit<DiscussionPoll, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<DiscussionPoll, "id" | "created_at" | "updated_at">>
      }
      discussion_poll_votes: {
        Row: DiscussionPollVote
        Insert: Omit<DiscussionPollVote, "id" | "created_at">
        Update: Partial<Omit<DiscussionPollVote, "id" | "created_at">>
      }
      discussion_shares: {
        Row: DiscussionShare
        Insert: Omit<DiscussionShare, "id" | "created_at">
        Update: Partial<Omit<DiscussionShare, "id" | "created_at">>
      }
      events: {
        Row: Event
        Insert: Omit<Event, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Event, "id" | "created_at" | "updated_at">>
      }
      tool_purchases: {
        Row: ToolPurchase
        Insert: Omit<ToolPurchase, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ToolPurchase, "id" | "created_at" | "updated_at">>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Job, "id" | "created_at" | "updated_at">>
      }
      job_applications: {
        Row: JobApplication
        Insert: Omit<JobApplication, "id" | "applied_at" | "updated_at">
        Update: Partial<Omit<JobApplication, "id" | "applied_at" | "updated_at">>
      }
    }
    Views: {
      public_profiles: {
        Row: PublicProfile
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Advertisement {
  id: string
  title: string
  image_url: string
  link?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}
