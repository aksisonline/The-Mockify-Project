"use client"

import { useState, useEffect, useCallback } from "react"
import { use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Users, Clock, ArrowLeft, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import AppHeader from "@/components/ui/AppHeader"

interface Brand {
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

interface ReviewCategory {
  id: string
  name: string
  created_at: string
}

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<ReviewProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<ReviewCategory[]>([])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [brandRes, categoriesRes] = await Promise.all([
          fetch(`/api/reviews/brands/${id}?search=${debouncedSearchQuery}&limit=50`),
          fetch('/api/reviews?type=categories')
        ])

        if (brandRes.ok) {
          const { brand: brandData, products: productsData } = await brandRes.json()
          setBrand(brandData)
          setProducts(productsData)
        }

        if (categoriesRes.ok) {
          const { categories: categoriesData } = await categoriesRes.json()
          setCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('Error fetching brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, debouncedSearchQuery])

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
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
    return matchesCategory
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Brand Details" subtitle="Loading..." />
        <div className="flex min-h-screen">
          <div className="flex-1 min-h-screen">
            <div className="py-8">
              {/* Brand Header Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative h-24 w-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg p-3" />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Products Section Skeleton */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4">
                        <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md p-3 mb-4" />
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Brand Not Found" subtitle="The requested brand could not be found" />
        <div className="flex min-h-screen">
          <div className="flex-1  min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brand Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">The brand you're looking for doesn't exist or has been removed.</p>
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
      <AppHeader title={brand.name} subtitle="Product reviews and information" />
      <div className="flex min-h-screen">
        <div className="flex-1  min-h-screen">
          <div className="py-8">
            {/* Brand Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/reviews">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reviews
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-24 w-24 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{brand.name}</h1>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {brand.description || "Professional media solutions"}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {brand.rating && (
                          <div className="flex items-center gap-2">
                            {renderStars(brand.rating)}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{brand.review_count || 0} reviews</span>
                        </div>
                        {brand.recent_activity && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{brand.recent_activity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {brand.featured && <Badge>Featured</Badge>}
                      {brand.trending && <Badge variant="secondary">Trending</Badge>}
                      {brand.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={brand.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Brand Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {brand.year_founded && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Founded</p>
                        <p className="text-sm text-gray-900 dark:text-white">{brand.year_founded}</p>
                      </div>
                    )}
                    {brand.headquarters && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Headquarters</p>
                        <p className="text-sm text-gray-900 dark:text-white">{brand.headquarters}</p>
                      </div>
                    )}
                    {brand.employees && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Employees</p>
                        <p className="text-sm text-gray-900 dark:text-white">{brand.employees}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {products.length} products available for review
                  </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories && categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link href={`/reviews/products/${product.id}`} key={product.id}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="relative h-32 w-full bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {product.description || "Professional media solution"}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {product.average_rating && (
                                <div className="flex items-center">
                                  {renderStars(product.average_rating)}
                                </div>
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {product.review_count || 0} reviews
                              </span>
                            </div>
                            
                            {product.price && (
                              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
                                {product.price}
                              </Badge>
                            )}
                          </div>

                          {product.category && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <Badge variant="secondary" className="text-xs">
                                {product.category.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 