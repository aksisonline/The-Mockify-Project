import { createServerClient } from "@/lib/supabase/server"

export interface Brand {
  id: string
  name: string
  logo?: string
  description?: string
  rating?: number
  review_count?: number
  featured?: boolean
  trending?: boolean
  recent_activity?: string
  year_founded?: number
  headquarters?: string
  website?: string
  employees?: string
  created_at: string
}

export interface ReviewProduct {
  id: string
  name: string
  brand_id: string
  image?: string
  category_id?: string
  price?: string
  description?: string
  features?: string[]
  pros?: string[]
  cons?: string[]
  last_reviewed?: string
  created_at: string
  brand?: Brand
  category?: ReviewCategory
  review_count?: number
  average_rating?: number
}

export interface ReviewCategory {
  id: string
  name: string
  created_at: string
  product_count?: number
}

export interface Review {
  id: string
  title: string
  content: string
  image_url?: string
  product_id?: string
  user_id: string
  category_id?: string
  rating: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  product?: ReviewProduct
  category?: ReviewCategory
  comment_count?: number
}

export interface ReviewComment {
  id: string
  review_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface ReviewRequest {
  id: string
  user_id: string
  product_id?: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user?: {
    id: string
    full_name: string
    email: string
  }
}

// Get all brands with aggregated stats
export async function getBrands(): Promise<Brand[]> {
  const supabase = await createServerClient()
  
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching brands:', error)
    throw new Error('Failed to fetch brands')
  }

  // Calculate aggregated stats for each brand
  const brandsWithStats = await Promise.all(
    brands.map(async (brand) => {
      // Get products for this brand
      const { data: products } = await supabase
        .from('review_products')
        .select('id')
        .eq('brand_id', brand.id)

      if (!products || products.length === 0) {
        return {
          ...brand,
          rating: 0,
          review_count: 0
        }
      }

      // Get reviews for all products of this brand
      const productIds = products.map(p => p.id)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('product_id', productIds)

      const avgRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0
    
      return {
        ...brand,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews?.length || 0
      }
    })
  )

  return brandsWithStats
}

// Get all products with pagination and filters
export async function getAllProducts(search?: string, limit = 20, offset = 0) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('review_products')
    .select(`
      *,
      brand:brands(*),
      category:review_categories(*)
    `)
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }

  // Calculate review statistics for each product
  const productsWithStats = await Promise.all(
    (products || []).map(async (product) => {
      // Get reviews for this product
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id)

      if (reviewsError) {
        console.error('Error fetching reviews for product:', product.id, reviewsError)
        return {
          ...product,
          review_count: 0,
          average_rating: 0
        }
      }

      const reviewCount = reviews?.length || 0
      const averageRating = reviewCount > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
        : 0

      return {
        ...product,
        review_count: reviewCount,
        average_rating: Math.round(averageRating * 10) / 10
      }
    })
  )

  return productsWithStats
}

// Get products by brand
export async function getProductsByBrand(brandId: string, search?: string, limit = 20, offset = 0) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('review_products')
    .select(`
      *,
      brand:brands(*),
      category:review_categories(*)
    `)
    .eq('brand_id', brandId)
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }

  // Calculate review statistics for each product
  const productsWithStats = await Promise.all(
    (products || []).map(async (product) => {
      // Get reviews for this product
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id)

      if (reviewsError) {
        console.error('Error fetching reviews for product:', product.id, reviewsError)
        return {
          ...product,
          review_count: 0,
          average_rating: 0
        }
      }

      const reviewCount = reviews?.length || 0
      const averageRating = reviewCount > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
        : 0

      return {
        ...product,
        review_count: reviewCount,
        average_rating: Math.round(averageRating * 10) / 10
      }
    })
  )

  return productsWithStats
}

// Get reviews with pagination and filters
export async function getReviews({
  productId,
  categoryId,
  userId,
  search,
  sortBy = 'newest',
  limit = 10,
  offset = 0
}: {
  productId?: string
  categoryId?: string
  userId?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'rating' | 'popular'
  limit?: number
  offset?: number
}) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url),
      category:review_categories(*)
    `)
    .range(offset, offset + limit - 1)

  if (productId) {
    // Since product_id in reviews is uuid but review_products.id is text,
    // we need to handle this carefully. For now, we'll try to match as string
    query = query.eq('product_id', productId)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'popular':
      // This would need a more complex query with comment counts
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: reviews, error } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
    throw new Error('Failed to fetch reviews')
  }

  // If we have reviews, fetch the related product data separately
  if (reviews && reviews.length > 0) {
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        let product = null
        let commentCount = 0

        // Fetch product data if product_id exists
        if (review.product_id) {
          const { data: productData } = await supabase
            .from('review_products')
            .select(`
              *,
              brand:brands(*)
            `)
            .eq('id', review.product_id.toString())
            .single()
          
          product = productData
        }

        // Fetch comment count
        const { count } = await supabase
          .from('review_comments')
          .select('*', { count: 'exact', head: true })
          .eq('review_id', review.id)

        commentCount = count || 0

        return {
          ...review,
          product,
          comment_count: commentCount
        }
      })
    )

    return reviewsWithProducts
  }

  return reviews || []
}

// Get review comments
export async function getReviewComments(reviewId: string, limit = 20, offset = 0) {
  const supabase = await createServerClient()
  
  const { data: comments, error } = await supabase
    .from('review_comments')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching review comments:', error)
    throw new Error('Failed to fetch review comments')
  }

  return comments
}

// Create a new review
export async function createReview(data: {
  title: string
  content: string
  image_url?: string
  product_id?: string
  category_id?: string
  rating: number
  user_id: string
}) {
  const supabase = await createServerClient()
  
  const { data: review, error } = await supabase
    .from('reviews')
    .insert(data)
    .select(`
      *,
      user:profiles(id, full_name, avatar_url),
      category:review_categories(*)
    `)
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw new Error('Failed to create review')
  }

  // Fetch product data separately if product_id exists
  if (review.product_id) {
    const { data: productData } = await supabase
      .from('review_products')
      .select(`
        *,
        brand:brands(*)
      `)
      .eq('id', review.product_id.toString())
      .single()
    
    return {
      ...review,
      product: productData
    }
  }

  return review
}

// Create a review comment
export async function createReviewComment(data: {
  review_id: string
  user_id: string
  content: string
}) {
  const supabase = await createServerClient()
  
  const { data: comment, error } = await supabase
    .from('review_comments')
    .insert(data)
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating review comment:', error)
    throw new Error('Failed to create review comment')
  }

  return comment
}

// Get review categories
export async function getReviewCategories() {
  const supabase = await createServerClient()
  
  const { data: categories, error } = await supabase
    .from('review_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching review categories:', error)
    throw new Error('Failed to fetch review categories')
  }

  return categories
}

// Get trending brands (brands with recent activity)
export async function getTrendingBrands(limit: number = 6): Promise<Brand[]> {
  const supabase = await createServerClient()
  
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .eq('trending', true)
    .order('name')
    .limit(limit)

  if (error) {
    console.error('Error fetching trending brands:', error)
    throw new Error('Failed to fetch trending brands')
  }

  // Calculate aggregated stats and sort by recent activity
  const brandsWithStats = await Promise.all(
    brands.map(async (brand) => {
      // Get products for this brand
      const { data: products } = await supabase
        .from('review_products')
        .select('id')
        .eq('brand_id', brand.id)

      if (!products || products.length === 0) {
        return {
          ...brand,
          rating: 0,
          review_count: 0,
          recent_review_count: 0
        }
      }

      // Get reviews for all products of this brand
      // Convert product IDs to strings for the query
      const productIds = products.map(p => p.id.toString())
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .in('product_id', productIds)

      const avgRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0
    
      // Calculate recent activity (reviews in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentReviews = reviews?.filter(review => 
        new Date(review.created_at) > thirtyDaysAgo
      ) || []
      
      return {
        ...brand,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews?.length || 0,
        recent_review_count: recentReviews.length
      }
    })
  )

  // Sort by recent activity, then by rating
  return brandsWithStats.sort((a, b) => {
    if (a.recent_review_count !== b.recent_review_count) {
      return b.recent_review_count - a.recent_review_count
    }
    return b.rating - a.rating
  })
}

// Get user's review activity
export async function getUserReviewActivity(userId: string) {
  const supabase = await createServerClient()
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      category:review_categories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user review activity:', error)
    throw new Error('Failed to fetch user review activity')
  }

  // Fetch product data separately for each review
  if (reviews && reviews.length > 0) {
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        let product = null

        if (review.product_id) {
          const { data: productData } = await supabase
            .from('review_products')
            .select(`
              name,
              brand:brands(name)
            `)
            .eq('id', review.product_id.toString())
            .single()
          
          product = productData
        }

        return {
          ...review,
          product
        }
      })
    )

    return reviewsWithProducts
  }

  return reviews || []
}

// Create review request
export async function createReviewRequest(data: {
  user_id: string
  product_id?: string
  content: string
}) {
  const supabase = await createServerClient()
  
  const { data: request, error } = await supabase
    .from('review_requests')
    .insert({
      ...data,
      status: 'pending'
    })
    .select(`
      *,
      user:profiles(id, full_name, email)
    `)
    .single()

  if (error) {
    console.error('Error creating review request:', error)
    throw new Error('Failed to create review request')
  }

  return request
}

// Admin functions
export async function getReviewRequests(status?: string) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('review_requests')
    .select(`
      *,
      user:profiles(id, full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: requests, error } = await query

  if (error) {
    console.error('Error fetching review requests:', error)
    throw new Error('Failed to fetch review requests')
  }

  return requests
}

// Update review request status
export async function updateReviewRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected') {
  const supabase = await createServerClient()
  
  const { data: request, error } = await supabase
    .from('review_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('Error updating review request status:', error)
    throw new Error('Failed to update review request status')
  }

  return request
} 