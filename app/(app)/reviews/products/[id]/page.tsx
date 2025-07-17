"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Users, Clock, ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import AppHeader from "@/components/ui/AppHeader"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { uploadFile } from "@/lib/file-service"

interface ReviewProduct {
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

interface Brand {
  id: string
  name: string
  logo?: string
  description?: string
}

interface ReviewCategory {
  id: string
  name: string
}

interface Review {
  id: string
  title: string
  content: string
  image_url?: string
  product_id?: string
  user_id: string
  category_id?: string
  rating: number
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  product?: ReviewProduct
  category?: ReviewCategory
  comment_count?: number
}

interface ReviewComment {
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<ReviewProduct | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [newComment, setNewComment] = useState("")
  const { user } = useAuth()

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    title: "",
    content: "",
    rating: 5,
    image_url: ""
  })

  // Image upload state
  const [reviewImage, setReviewImage] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Image preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/reviews/products/${id}?sort_by=${sortBy}`)
        
        if (response.ok) {
          const { product: productData, reviews: reviewsData } = await response.json()
          setProduct(productData)
          setReviews(reviewsData)
        }
      } catch (error) {
        console.error('Error fetching product data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, sortBy])

  const fetchComments = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/comments`)
      if (response.ok) {
        const { comments: commentsData } = await response.json()
        setComments(commentsData)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please log in to submit a review")
      return
    }

    if (!reviewForm.title || !reviewForm.content) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewForm,
          product_id: id,
          category_id: product?.category_id
        })
      })

      if (response.ok) {
        toast.success("Review submitted successfully")
        setIsReviewDialogOpen(false)
        setReviewForm({ title: "", content: "", rating: 5, image_url: "" })
        setReviewImage(null)
        // Refresh reviews
        window.location.reload()
      } else {
        toast.error("Failed to submit review")
      }
    } catch (error) {
      toast.error("Error submitting review")
    }
  }

  const handleSubmitComment = async (reviewId: string) => {
    if (!user) {
      toast.error("Please log in to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        toast.success("Comment added successfully")
        setNewComment("")
        fetchComments(reviewId)
      } else {
        toast.error("Failed to add comment")
      }
    } catch (error) {
      toast.error("Error adding comment")
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)
      const result = await uploadFile(file)
      setReviewForm({ ...reviewForm, image_url: result.url })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReviewImage(file)
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setReviewImage(null)
    setReviewForm({ ...reviewForm, image_url: "" })
  }

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsImagePreviewOpen(true)
  }

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false)
    setPreviewImage(null)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Product Details" subtitle="Loading..." />
        <div className="flex min-h-screen">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <div className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Product Not Found" subtitle="The requested product could not be found" />
        <div className="flex min-h-screen">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                <Link href="/reviews">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reviews
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader title={product.name} subtitle={`${product.brand?.name} - Product Reviews`} />
      <div className="flex min-h-screen">
        <div className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Product Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/reviews/brands/${product.brand_id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to {product.brand?.name}
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="relative h-64 w-full lg:w-96 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {product.brand && (
                          <Link href={`/reviews/brands/${product.brand_id}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                              {product.brand.name}
                            </Badge>
                          </Link>
                        )}
                        {product.category && (
                          <Badge variant="secondary">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                      
                      {product.price && (
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                          {product.price}
                        </p>
                      )}
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {product.description || "Professional media solution"}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {product.average_rating && (
                          <div className="flex items-center gap-2">
                            {renderStars(product.average_rating)}
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {product.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{product.review_count || 0} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pros and Cons */}
                  {(product.pros?.length || product.cons?.length) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {product.pros && product.pros.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            Pros
                          </h3>
                          <ul className="space-y-2">
                            {product.pros.map((pro, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {product.cons && product.cons.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                            <ThumbsDown className="h-5 w-5 mr-2" />
                            Cons
                          </h3>
                          <ul className="space-y-2">
                            {product.cons.map((con, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {reviews.length} reviews from verified users
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Write a Review for {product.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title *</label>
                          <Input
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                            placeholder="Brief summary of your experience"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rating *</label>
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-8 w-8 transition-colors ${
                                    star <= reviewForm.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                              {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Review *</label>
                          <Textarea
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                            placeholder="Share your detailed experience with this product..."
                            rows={6}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Image (optional)</label>
                          <div className="space-y-2">
                            {reviewImage ? (
                              <div className="relative">
                                <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                  <Image
                                    src={URL.createObjectURL(reviewImage)}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={removeImage}
                                  className="absolute top-2 right-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                  id="review-image-upload"
                                  disabled={isUploadingImage}
                                />
                                <label
                                  htmlFor="review-image-upload"
                                  className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                  <Upload className="h-8 w-8 text-gray-400" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {isUploadingImage ? "Uploading..." : "Click to upload an image"}
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={handleSubmitReview} 
                          className="w-full"
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? "Uploading..." : "Submit Review"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No reviews yet for this product.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            {review.user?.avatar_url ? (
                              <Image
                                src={review.user.avatar_url}
                                alt={review.user.full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                {review.user?.full_name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {review.user?.full_name || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                        {review.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {review.content}
                      </p>

                      {review.image_url && (
                        <div className="mb-4">
                          <div
                            className="relative cursor-pointer group w-[200px] h-[150px] rounded-lg overflow-hidden"
                            onClick={() => openImagePreview(review.image_url!)}
                          >
                            <Image
                              src={review.image_url}
                              alt="Review image"
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white bg-opacity-90 rounded-full p-2">
                                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review)
                              fetchComments(review.id)
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {review.comment_count || 0} Comments
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {selectedReview?.id === review.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Comments</h4>
                          
                          {comments.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No comments yet.</p>
                          ) : (
                            <div className="space-y-3 mb-4">
                              {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="relative h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                    {comment.user?.avatar_url ? (
                                      <Image
                                        src={comment.user.avatar_url}
                                        alt={comment.user.full_name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                        {comment.user?.full_name?.charAt(0) || "U"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.user?.full_name || "Anonymous"}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {user && (
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-1"
                                rows={2}
                              />
                              <Button
                                onClick={() => handleSubmitComment(review.id)}
                                disabled={!newComment.trim()}
                              >
                                Post
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-0 shadow-none">
          <div className="relative">
            {previewImage && (
              <div className="relative w-full h-[80vh] bg-black flex items-center justify-center">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={closeImagePreview}
                  className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close image preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 