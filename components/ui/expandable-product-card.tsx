"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShoppingCart, ArrowUpRight, Star } from "lucide-react"
import Link from "next/link"

// Placeholder for use-outside-click hook (assuming it's in @/hooks/use-outside-click)
import type { RefObject } from "react"

function useOutsideClick(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// Placeholder Product type (assuming it's similar to this structure)
export interface Product {
  id: string | number
  image_url?: string
  title: string
  price: number
  condition: string
  is_featured?: boolean
  posted_at: string // ISO date string
  description: string
  seller?: {
    avatar_url?: string
    name?: string
    id?: string | number
  }
  location?: string
  quantity: number
}

interface ExpandableProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onBuyNow: (product: Product) => void
  isDisabled?: boolean
  viewMode?: "grid" | "list"
  cartItems?: Array<{ id: string; product_id: string; quantity: number }>
}

export default function ExpandableProductCard({
  product,
  onAddToCart,
  onBuyNow,
  isDisabled = false,
  viewMode = "grid",
  cartItems = [],
}: ExpandableProductCardProps) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false)
      }
    }
    if (active) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(false))

  // Check if item is already at maximum quantity in cart
  const cartItem = cartItems.find(item => item.product_id === product.id)
  const currentCartQuantity = cartItem?.quantity || 0
  const isAtMaxQuantity = currentCartQuantity >= product.quantity
  const isOutOfStock = product.quantity === 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  const formatPrice = (price: number) => `₹${price.toLocaleString()}`

  // --- Card Layouts ---
  // Collapsed Card
  const CollapsedCard = () => (
    <motion.div
      layoutId={`card-${product.id}-${id}`}
      onClick={() => setActive(true)}
      className={`group cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1 min-w-[280px] ${viewMode === "list" ? "rounded-xl flex flex-row bg-white dark:bg-neutral-900 shadow-lg relative h-[180px]" : "rounded-xl flex flex-col bg-white dark:bg-neutral-900 shadow-lg"}`}
    >
      {viewMode === "list" && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-white text-blue-600 font-bold px-3 py-1 rounded-full shadow-md text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
      )}
      {/* Image Section */}
      <div className={viewMode === "list" ? "relative w-40 h-full flex-shrink-0" : "relative w-full h-[220px]"}>
        <motion.div layoutId={`image-${product.id}-${id}`} className="absolute inset-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className={`object-cover w-full h-full ${viewMode === "list" ? "rounded-l-xl" : "rounded-t-xl"} group-hover:scale-105 transition-transform duration-300 ease-in-out`}
              style={{ height: "100%" }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${viewMode === "list" ? "rounded-l-xl" : "rounded-t-xl"}`}>
                <img
                  src="/mockify-logo-white.png"
                alt=""
                className="w-24 h-auto opacity-60 dark:opacity-40"
              />
            </div>
          )}
        </motion.div>
        {/* For Sale Tag */}
        <div className={viewMode === "list" ? "absolute top-2.5 left-2.5 z-10" : "absolute top-2.5 left-2.5 z-10"}>
          {product.quantity < 5 && product.quantity > 0 ? (
            <span className="bg-yellow-500 text-black px-3 py-1 text-[10px] font-semibold uppercase rounded-full shadow-md">
              Only {product.quantity} left
            </span>
          ) : (
            <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-semibold uppercase rounded-full shadow-md">
              FOR SALE
            </span>
          )}
        </div>
        {/* Price Tag */}
        {!viewMode || viewMode === "grid" ? (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-white text-blue-600 font-bold px-3 py-1 rounded-full shadow-md text-sm">
              {formatPrice(product.price)}
            </span>
          </div>
        ) : null}
        
      </div>

      {/* Details Section */}
      <div className={`flex flex-col flex-1 ${viewMode === "list" ? "p-4 gap-y-1.5" : "p-4"}`}>
        {/* Top content: condition, date, title, description */}
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="text-xs border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            >
              {product.condition}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            >
              Qty: {product.quantity}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(product.posted_at)}</span>
          </div>
          <motion.h3
            layoutId={`title-${product.id}-${id}`}
            className="font-bold text-gray-800 dark:text-white line-clamp-1 mb-1"
            style={{ fontSize: viewMode === "list" ? "1rem" : "1.125rem" }} // Slightly larger for grid
          >
            {product.title}
          </motion.h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        </div>

        {/* Bottom content: seller info and buttons */}
        <div className="mt-auto">
          {viewMode === "list" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={product.seller?.avatar_url || "/placeholder.svg"}
                    alt={product.seller?.name || "Seller"}
                  />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs">
                    {product.seller?.name?.charAt(0).toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {product.seller?.id ? (
                    <Link
                      href={`/${product.seller.id}`}
                      className="text-sm font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer inline-block hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.seller?.name || "Unknown Seller"}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {product.seller?.name || "Unknown Seller"}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.location || "Unknown Location"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="rounded-md h-9 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 focus-visible:ring-blue-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToCart(product)
                  }}
                  disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {isAtMaxQuantity ? "At Max Quantity" : "Add to Cart"}
                  </span>
                </Button>
                <Button
                  className="rounded-md h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBuyNow(product)
                  }}
                  disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Buy Now</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={product.seller?.avatar_url || "/placeholder.svg"}
                    alt={product.seller?.name || "Seller"}
                  />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs">
                    {product.seller?.name?.charAt(0).toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {product.seller?.id ? (
                    <Link
                      href={`/${product.seller.id}`}
                      className="text-sm font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer inline-block hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.seller?.name || "Unknown Seller"}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {product.seller?.name || "Unknown Seller"}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.location || "Unknown Location"}</p>
                </div>
              </div>

              <div className="flex w-full items-center border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex-col gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 w-full rounded-md h-10 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 focus-visible:ring-blue-500 min-w-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToCart(product)
                  }}
                  disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {isAtMaxQuantity ? "At Max Quantity" : "Add to Cart"}
                  </span>
                </Button>
                <Button
                  className="flex-1 w-full rounded-md h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 min-w-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBuyNow(product)
                  }}
                  disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Buy Now</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )

  // --- Expanded Modal View ---
  const ExpandedModal = () => (
    <div
      className="fixed inset-0 grid place-items-center z-[100] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`title-${product.id}-${id}`}
    >
      <motion.button
        key={`close-button-${product.id}-${id}`}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        className="flex absolute top-4 right-4 items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full h-9 w-9 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors z-[101]"
        onClick={() => setActive(false)}
        aria-label="Close product details"
      >
        <CloseIcon />
      </motion.button>
      <motion.div
        layoutId={`card-${product.id}-${id}`}
        ref={ref}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <motion.div 
          layoutId={`image-${product.id}-${id}`} 
          className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <img
                src="/mockify-logo-white.png"
                alt=""
                className="w-32 h-auto opacity-60 dark:opacity-40"
              />
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            {product.quantity < 5 && product.quantity > 0 ? (
              <span className="bg-yellow-500 text-black px-3 py-1 text-xs font-semibold uppercase rounded-full shadow-md">
                Only {product.quantity} left
              </span>
            ) : (
              <span className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold uppercase rounded-full shadow-md">
                FOR SALE
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white text-blue-600 font-bold px-3 py-1 rounded-full shadow-md text-sm">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.condition === "Like New" && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                {product.condition}
              </span>
            </div>
          )}
          {product.is_featured && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-yellow-400 text-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
              <Star className="h-3 w-3 fill-black" /> Featured
            </div>
          )}
        </motion.div>
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-sm border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
              {product.condition}
            </Badge>
            <Badge
              variant="outline"
              className="text-sm border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
              Qty: {product.quantity}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(product.posted_at)}</span>
          </div>
          <motion.h3
            layoutId={`title-${product.id}-${id}`}
            id={`title-${product.id}-${id}`}
            className="font-bold text-2xl lg:text-3xl text-gray-800 dark:text-white mb-3"
          >
            {product.title}
          </motion.h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base">{product.description}</p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={product.seller?.avatar_url || "/placeholder.svg"}
                  alt={product.seller?.name || "Seller"}
                />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300">
                  {product.seller?.name?.charAt(0).toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                {product.seller?.id ? (
                  <Link
                    href={`/${product.seller.id}`}
                    className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer inline-block hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.seller?.name || "Unknown Seller"}
                  </Link>
                ) : (
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {product.seller?.name || "Unknown Seller"}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.location || "Unknown Location"}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-blue-600 border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/50 focus-visible:ring-blue-500"
              onClick={() => {
                onAddToCart(product)
                setActive(false)
              }}
              disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" /> 
              {isAtMaxQuantity ? "At Max Quantity" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500"
              onClick={() => {
                onBuyNow(product)
                setActive(false)
              }}
              disabled={isDisabled || isAtMaxQuantity || isOutOfStock}
            >
              <ArrowUpRight className="h-5 w-5 mr-2" /> Buy Now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm h-full w-full z-50"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{active ? <ExpandedModal /> : null}</AnimatePresence>
      {!active && <CollapsedCard />}
    </>
  )
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5" // Slightly thicker for better visibility
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-gray-700 dark:text-gray-300"
    >
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  )
}

// Sample product data for demonstration
const sampleProduct: Product = {
  id: "1",
  title: "Vintage Leather Sofa",
  description:
    "A beautiful vintage leather sofa, perfect for adding a classic touch to your living room. Comfortable and stylish, with minor wear consistent with age.",
  price: 45000,
  condition: "Used - Good",
  posted_at: new Date().toISOString(),
  image_url: "/placeholder.svg?width=400&height=300",
  seller: {
    name: "Jane Doe",
    avatar_url: "/placeholder.svg?width=40&height=40",
    id: "seller123",
  },
  location: "Mumbai, India",
  is_featured: true,
  quantity: 1,
}

// Example usage (optional, for testing)
export function ProductCardDemo() {
  const handleAddToCart = (product: Product) => {
    // console.log("Added to cart:", product.title)
    // alert(`Added ${product.title} to cart!`);
  }

  const handleBuyNow = (product: Product) => {
    // console.log("Buying now:", product.title)
    // alert(`Proceeding to buy ${product.title}!`);
  }

  return (
    <div className="p-4 md:p-8 bg-slate-100 dark:bg-slate-900 min-h-screen">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-w-6xl mx-auto">
        <ExpandableProductCard
          product={sampleProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          viewMode="grid"
        />
        <ExpandableProductCard
          product={{
            ...sampleProduct,
            id: "2",
            title: "Modern Bookshelf, Like New",
            condition: "Like New",
            image_url: "/placeholder.svg?width=400&height=300",
            is_featured: false,
            quantity: 3,
            seller: {
              id: "seller456",
              name: "John Smith",
              avatar_url: "/placeholder.svg?width=40&height=40",
            },
          }}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          viewMode="grid"
        />
        <ExpandableProductCard
          product={{
            ...sampleProduct,
            id: "3",
            title: "Antique Wooden Chair",
            condition: "Antique",
            image_url: "/placeholder.svg?width=400&height=300",
            price: 8500,
            quantity: 10,
            seller: {
              id: "seller789",
              name: "Alice Johnson",
              avatar_url: "/placeholder.svg?width=40&height=40",
            },
          }}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          viewMode="grid"
        />
      </div>
      <div className="mt-8 max-w-3xl mx-auto space-y-4">
        <ExpandableProductCard
          product={{
            ...sampleProduct,
            id: "4",
            title: "Designer Table Lamp",
            condition: "New",
            image_url: "/placeholder.svg?width=400&height=300",
            price: 12000,
            seller: {
              id: "seller101",
              name: "Bob Wilson",
              avatar_url: "/placeholder.svg?width=40&height=40",
            },
          }}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          viewMode="list"
        />
        <ExpandableProductCard
          product={{
            ...sampleProduct,
            id: "5",
            title: "Set of Ceramic Vases",
            condition: "Used - Fair",
            image_url: "/placeholder.svg?width=400&height=300",
            quantity: 0,
            seller: {
              id: "seller202",
              name: "Carol Davis",
              avatar_url: "/placeholder.svg?width=40&height=40",
            },
          }}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          viewMode="list"
          isDisabled={true} // Example of disabled state
        />
      </div>
    </div>
  )
}
