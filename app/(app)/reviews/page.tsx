"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Search, Star, Plus, Filter, Award, ChevronRight, TrendingUp, Users, Clock, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import AppHeader from "@/components/ui/AppHeader"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  product_count?: number
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
  product_count?: number
}

const ITEMS_PER_PAGE = 12

// Card class for both trending and all brands
const BRAND_CARD_CLASS = "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-shadow w-full h-full min-h-[260px]";

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<ReviewProduct[]>([])
  const [trendingBrands, setTrendingBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<ReviewCategory[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ReviewProduct[]>([])
  const [activeTab, setActiveTab] = useState("brands")
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [trendingRow, setTrendingRow] = useState(0);
  const [cardsPerRow, setCardsPerRow] = useState(3);

  // Calculate pagination
  const totalItems = activeTab === "brands" ? filteredBrands.length : filteredProducts.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  // Get current page items
  const currentBrands = filteredBrands.slice(startIndex, endIndex)
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Filter brands/products by selected category
  const filteredBrandsByCategory = selectedCategory === "all"
    ? filteredBrands
    : filteredBrands.filter((brand) =>
        products.some((product) => product.brand_id === brand.id && product.category_id === selectedCategory)
      )
  const filteredProductsByCategory = selectedCategory === "all"
    ? filteredProducts
    : filteredProducts.filter((product) => product.category_id === selectedCategory)

  // Responsive cardsPerRow based on window width
  useEffect(() => {
    function updateCardsPerRow() {
      if (window.innerWidth < 640) {
        setCardsPerRow(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerRow(2);
      } else {
        setCardsPerRow(3);
      }
    }
    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  // Auto-cycle trending brand rows every 5 seconds
  useEffect(() => {
    if (!trendingBrands || trendingBrands.length <= cardsPerRow) return;
    const interval = setInterval(() => {
      setTrendingRow((prev) => (prev + 1) % Math.ceil(trendingBrands.length / cardsPerRow));
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingBrands, cardsPerRow]);

  const handleTrendingPrevRow = () => {
    setTrendingRow((prev) => (prev - 1 + Math.ceil(trendingBrands.length / cardsPerRow)) % Math.ceil(trendingBrands.length / cardsPerRow));
  };
  const handleTrendingNextRow = () => {
    setTrendingRow((prev) => (prev + 1) % Math.ceil(trendingBrands.length / cardsPerRow));
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch brands, products, and categories in parallel
        const [brandsRes, productsRes, trendingRes, categoriesRes] = await Promise.all([
          fetch('/api/reviews?type=brands'),
          fetch('/api/reviews?type=products'),
          fetch('/api/reviews?type=trending&limit=6'),
          fetch('/api/reviews?type=categories')
        ])

        let brandsData = []
        let productsData = []
        let categoriesData = []

        if (brandsRes.ok) {
          brandsData = await brandsRes.json()
        }

        if (productsRes.ok) {
          productsData = await productsRes.json()
        }

        if (categoriesRes.ok) {
          categoriesData = await categoriesRes.json()
        }

        // Calculate product counts for brands
        const brandsWithCounts = brandsData.map((brand: Brand) => {
          const productCount = productsData.filter((product: ReviewProduct) => 
            product.brand_id === brand.id
          ).length
          return { ...brand, product_count: productCount }
        })

        // Calculate product counts for categories
        const categoriesWithCounts = categoriesData.map((category: ReviewCategory) => {
          const productCount = productsData.filter((product: ReviewProduct) => 
            product.category_id === category.id
          ).length
          return { ...category, product_count: productCount }
        })

        setBrands(brandsWithCounts || [])
        setFilteredBrands(brandsWithCounts || [])
        setProducts(productsData || [])
        setFilteredProducts(productsData || [])
        setCategories(categoriesWithCounts || [])

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json()
          setTrendingBrands(trendingData || [])
          // console.log('Trending brands:', trendingData)
        }

        // Fetch user points if logged in
        if (user) {
          try {
            const pointsRes = await fetch('/api/points')
            if (pointsRes.ok) {
              const pointsData = await pointsRes.json()
              setUserPoints(pointsData?.total_points || 0)
            }
          } catch (error) {
            console.error('Error fetching user points:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching reviews data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Filter brands and products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBrands(brands)
      setFilteredProducts(products)
      return
    }

    const filteredBrandsData = brands.filter((brand) => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredBrands(filteredBrandsData)

    const filteredProductsData = products.filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filteredProductsData)
  }, [searchQuery, brands, products])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Render star ratings
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

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className="w-10"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader 
          title="Reviews" 
          subtitle="Explore and share product experiences"
          right={
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 w-40 h-12 animate-pulse"></div>
          }
        />
        <div className="max-w-7xl mx-auto">
          <div className="flex min-h-screen">
            <div className="flex-1 dark:bg-gray-900 min-h-screen">
              <div className="py-8">
                <div className="animate-pulse">
                  {/* Main Content with Sidebar Layout */}
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-24">
                        {/* Categories Skeleton */}
                        <div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                          <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="flex items-center justify-between p-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="flex-1">
                      {/* Search Skeleton */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>

                      {/* Trending Brands Skeleton */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>

                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                                  </div>
                                  <div className="flex flex-wrap gap-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Content Skeleton */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
                              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader 
        title="Reviews" 
        subtitle="Explore and share product experiences"
        right={
          <Link href="/reviews/request-product">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Request New Product
            </Button>
          </Link>
        }
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex min-h-screen">
          <div className="flex-1 dark:bg-gray-900 min-h-screen">
            <div className="py-8">
              {/* Category Selectors (pill-shaped buttons) */}
              <div className="mb-8 flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-5 py-2 text-sm font-medium"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories
                </Button>
                {(categories || []).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full px-5 py-2 text-sm font-medium"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Trending Brands - animated row cycling */}
              {(trendingBrands || []).length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Trending Brands
                    </h2>
                    {(trendingBrands.length > cardsPerRow) && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleTrendingPrevRow} className="h-8 w-8 p-0">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleTrendingNextRow} className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="relative min-h-[260px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={trendingRow + '-' + cardsPerRow}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] absolute w-full`}
                      >
                        {trendingBrands.slice(trendingRow * cardsPerRow, trendingRow * cardsPerRow + cardsPerRow).map((brand) => (
                          <Link href={`/reviews/brands/${brand.id}`} key={brand.id} className="w-full max-w-xs mx-auto">
                            <div className={BRAND_CARD_CLASS}>
                              <div className="relative h-20 w-20 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-4 mx-auto">
                                <Image
                                  src={brand.logo || "/placeholder.svg"}
                                  alt={brand.name}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 text-center">{brand.name}</h3>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center line-clamp-2">{brand.description || "Professional media solutions"}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center mt-2">
                                {brand.rating && (
                                  <div className="flex items-center">{renderStars(brand.rating)}</div>
                                )}
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{brand.review_count || 0} reviews</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeTab === "brands" ? "All Brands" : "All Products"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {totalItems} {activeTab === "brands" ? "brands" : "products"}
                    </span>
                  </div>
                </div>

                {/* Brands Grid - card style (logo on top, info below) */}
                {activeTab === "brands" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {(filteredBrandsByCategory || []).map((brand) => (
                      <Link href={`/reviews/brands/${brand.id}`} key={brand.id} className="w-full max-w-xs mx-auto">
                        <div className={BRAND_CARD_CLASS}>
                          <div className="relative h-20 w-20 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-4">
                            <Image
                              src={brand.logo || "/placeholder.svg"}
                              alt={brand.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 text-center">{brand.name}</h3>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center line-clamp-2">{brand.description || "Professional media solutions"}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center mt-2">
                            {brand.rating && (
                              <div className="flex items-center">{renderStars(brand.rating)}</div>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{brand.review_count || 0} reviews</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products Grid - card style (logo on top, info below) */}
                {activeTab === "products" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(filteredProductsByCategory || []).map((product) => (
                      <Link href={`/reviews/products/${product.id}`} key={product.id}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow"
                        >
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
                          {product.brand && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <Badge variant="secondary" className="text-xs">
                                {product.brand.name}
                              </Badge>
                            </div>
                          )}
                          {product.category && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                {product.category.name}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
