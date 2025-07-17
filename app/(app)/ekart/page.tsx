"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Tag,
  Grid,
  List,
  ArrowUpRight,
  Award,
  Camera,
  Headphones,
  Projector,
  Video,
  Lightbulb,
  Cable,
  ShoppingBag,
  DollarSign,
  Minus,
  Trash2,
  User,
  MapPin,
  Package,
  RefreshCw,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { useEkart } from "@/hooks/use-ekart"
// import { usePoints } from "@/hooks/use-points"
import ContentWrapper from "@/components/ContentWrapper"
import { uploadFile, getPublicUrl } from "@/lib/file-service"
import { useAuth } from "@/contexts/auth-context"
import { validateProfileForPosting } from "@/lib/profile-validation"
import ExpandableProductCard from "@/components/ui/expandable-product-card"
import AppHeader from "@/components/ui/AppHeader"


// Add product types array
const PRODUCT_TYPES = [
  { name: "New", id: "New" },
  { name: "Like New", id: "Like New" },
  { name: "Good", id: "Good" },
  { name: "Fair", id: "Fair" },
  { name: "For Parts", id: "For Parts" },
]

const EkartPage = () => {
  const { user } = useAuth()

  const {
    products,
    productCount,
    categories,
    isLoadingProducts,
    loadProducts,
    cartItems,
    cartItemCount,
    cartTotal,
    isLoadingCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    loadCartItems,
    applyFilters,
    refreshData,
  } = useEkart()


  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [notifications, setNotifications] = useState(2)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Add priceRange state for filter UI
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  // Add selectedConditions state for filter UI
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  // Add selected product types state
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([])

  // Add sort state
  const [sortBy, setSortBy] = useState("newest")

  // New product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Good",
    location: "",
    image_url: "/placeholder.svg?height=300&width=400",
    quantity: "1",
  })

  // Checkout form state
  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    shippingAddress: "",
    email: "",
    contactNumber: "",
    paymentMethod: "cod",
    notes: "",
  })

  // Image upload state
  const [uploading, setUploading] = useState(false)

  // Add price validation state
  const [priceError, setPriceError] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Apply filters when search or filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      // Convert price range strings to numbers
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : undefined
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : undefined

      // Combine all selected conditions
      const allConditions = [...selectedConditions, ...selectedProductTypes]

      applyFilters({
        search: searchQuery || undefined,
        minPrice,
        maxPrice,
        conditions: allConditions.length > 0 ? allConditions : undefined,
        sortBy,
      })
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, priceRange, selectedConditions, selectedProductTypes, sortBy, applyFilters])

  // Refresh data when page becomes visible (handles page refresh and navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data to ensure cache is up to date
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshData])

  // Helper to check if all required fields are filled and image is uploaded
  const isPostItemFormValid =
    newProduct.title.trim() !== "" &&
    newProduct.description.trim() !== "" &&
    newProduct.price.trim() !== "" &&
    newProduct.condition.trim() !== "" &&
    newProduct.location.trim() !== "" &&
    newProduct.quantity.trim() !== "" &&
    newProduct.image_url &&
    !newProduct.image_url.startsWith("/placeholder")

  const handlePostItemClick = async () => {
    if (!user?.id) {
      toast.error("Please log in to post an item")
      return
    }

    const isProfileValid = await validateProfileForPosting(user.id)
    if (isProfileValid) {
      setShowPostDialog(true)
    }
  }

  // Handle posting a new product
  const handlePostProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // Create a clean object with only the necessary data
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        condition: newProduct.condition,
        location: newProduct.location,
        image_url: newProduct.image_url,
        quantity: parseInt(newProduct.quantity),
        is_featured: false,
        is_active: true,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product")
      }

      // Award points for posting (50 points per post)
      const pointsEarned = 50

      // Show success message
      toast.success(`Product posted successfully! You earned ${pointsEarned} points for your listing.`)

      // Reset form and close dialog
      setNewProduct({
        title: "",
        description: "",
        price: "",
        condition: "Good",
        location: "",
        image_url: "/placeholder.svg?height=300&width=400",
        quantity: "1",
      })
      setShowPostDialog(false)

      // Reload products
      loadProducts()
    } catch (error: any) {
      console.error("Error posting product:", error)
      toast.error(error.message || "Failed to post product")
    }
  }

  // Add to cart functionality
  const handleAddToCart = async (product: any) => {
    const success = await addToCart(product.id);
    if (success) setIsCartOpen(true);
  }

  // Buy Now functionality - Clear cart, add item, and checkout
  const handleBuyNow = async (product: any) => {
    try {
      // First, clear the current cart
      await clearCart()
      
      // Then add the selected item to cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reload cart items to get the updated cart
        await loadCartItems()
        
        // Proceed to checkout
        setShowCheckoutDialog(true)
        
        toast.success("Item added to cart and proceeding to checkout")
      } else {
        toast.error(data.error || "Failed to add item to cart")
      }
    } catch (error: any) {
      console.error("Error in handleBuyNow:", error)
      toast.error("Failed to process buy now request")
    }
  }

  // Update cart item quantity
  const handleUpdateCartItemQuantity = async (cartItemId: string, newQuantity: number) => {
    // console.log('Updating cart item quantity:', { cartItemId, newQuantity })
    
    if (newQuantity < 1) {
      await removeFromCart(cartItemId)
      return
    }

    const success = await updateCartItemQuantity(cartItemId, newQuantity)
    // console.log('Update result:', success)
  }

  // Proceed to checkout
  const proceedToCheckout = () => {
    setIsCartOpen(false)
    setShowCheckoutDialog(true)
  }

  // Complete checkout
  const completeCheckout = async () => {
    // Validate checkout form
    if (!checkoutData.fullName || !checkoutData.shippingAddress || !checkoutData.contactNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const result = await createOrder({
        shippingAddress: checkoutData.shippingAddress,
        contactNumber: checkoutData.contactNumber,
        paymentMethod: checkoutData.paymentMethod,
        notes: checkoutData.notes,
      })

      if (result.success) {
        // Clear cart after successful order
        await clearCart()
        
        // Reset checkout form
        setCheckoutData({
          fullName: "",
          shippingAddress: "",
          email: "",
          contactNumber: "",
          paymentMethod: "cod",
          notes: "",
        })
        setShowCheckoutDialog(false)
        
        // Reload products and cart
        await refreshData()
        
        toast.success("Order placed successfully!")
      }
    } catch (error: any) {
      console.error("Error completing checkout:", error)
      toast.error(error.message || "Failed to complete checkout")
    }
  }

  // Handle image file selection and upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 5MB")
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadFile(file)
      setNewProduct((prev) => ({ ...prev, image_url: url }))
      toast.success("Your image was uploaded successfully.")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.")
    } finally {
      setUploading(false)
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("")
    setPriceRange({ min: "", max: "" })
    setSelectedConditions([])
    setSelectedProductTypes([])
    setSortBy("newest")
  }

  return (
    <ContentWrapper>
      <div className="px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Custom Header with points display */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="mr-4">
                  <Image
                    src="/mockify-logo.png"
                    alt="Mockify Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain dark:hidden"
                  />
                </Link>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>
              </div>

              {/* Page Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kart</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Buy and sell   equipment within the community</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* Cart Button */}
              <style>{`
                .custom-sheet-overlay { z-index: 40 !important; }
                .custom-sheet-content { z-index: 50 !important; }
              `}</style>
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="custom-sheet-content w-full sm:max-w-md flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Your Cart ({cartItemCount})</SheetTitle>
                    <SheetDescription>Review your items before proceeding to checkout</SheetDescription>
                  </SheetHeader>

                  {cartItems.length > 0 ? (
                    <div className="flex-1 overflow-auto py-4">
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4"
                          >
                            <div className="w-16 h-16 relative flex-shrink-0">
                              <img
                                src={item.product?.image_url || "/placeholder.svg"}
                                alt={item.product?.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.product?.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Seller: {item.product?.seller?.name || "Unknown"}
                              </p>
                              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                ₹{item.product?.price?.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-gray-500">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= (item.product?.quantity || 1)}
                                  title={item.quantity >= (item.product?.quantity || 1) ? "Maximum quantity reached" : "Increase quantity"}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                        Looks like you haven't added any items to your cart yet.
                      </p>
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  )}

                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
                      <div className="flex justify-between mb-6">
                        <span className="text-base font-medium">Total</span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={clearCart}>
                          Clear Cart
                        </Button>
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={proceedToCheckout}
                        >
                          Checkout
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* Post Item Button */}
              <Button onClick={() => setShowPostDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Post Item
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Section */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
              {/* Clear Filters Button */}
              {(searchQuery || priceRange.min || priceRange.max || selectedConditions.length > 0 || selectedProductTypes.length > 0 || sortBy !== "newest") && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearAllFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Product Type Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  <h2 className="text-lg font-semibold">Product Type</h2>
                </div>

                <div className="space-y-3">
                  {PRODUCT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type.id} 
                        checked={selectedProductTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProductTypes([...selectedProductTypes, type.id])
                          } else {
                            setSelectedProductTypes(selectedProductTypes.filter(t => t !== type.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={type.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <h2 className="text-lg font-semibold">Price Range</h2>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="text-sm font-medium">Min Price (₹)</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-sm font-medium">Max Price (₹)</Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="∞"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Quick price range buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange({ min: "0", max: "1000" })}
                      className="text-xs"
                    >
                      Under ₹1,000
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange({ min: "1000", max: "5000" })}
                      className="text-xs"
                    >
                      ₹1,000 - ₹5,000
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange({ min: "5000", max: "" })}
                      className="text-xs"
                    >
                      Over ₹5,000
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Search and Filter Bar - Only visible on mobile */}
            <div className="lg:hidden w-full mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search for   equipment..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsFilterOpen(true)}>
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{productCount} Products</div>
                  <Tabs defaultValue={viewMode} onValueChange={setViewMode} className="h-8">
                    <TabsList className="bg-white dark:bg-gray-800 h-8">
                      <TabsTrigger
                        value="grid"
                        className="h-8 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                      >
                        <Grid className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="list"
                        className="h-8 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                      >
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Price Range</Label>
                        <div className="mt-2 space-y-2">
                          <Input
                            type="number"
                            placeholder="Min Price (₹)"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, min: e.target.value })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max Price (₹)"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, max: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Condition</Label>
                        <div className="mt-2 space-y-2">
                          {["New", "Like New", "Good", "Fair", "For Parts"].map((condition) => (
                            <div key={condition} className="flex items-center space-x-2">
                              <Checkbox
                                id={`condition-${condition}`}
                                checked={selectedConditions.includes(condition)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedConditions([...selectedConditions, condition])
                                  } else {
                                    setSelectedConditions(
                                      selectedConditions.filter((c) => c !== condition)
                                    )
                                  }
                                }}
                              />
                              <Label htmlFor={`condition-${condition}`}>{condition}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearAllFilters()
                      setIsFilterOpen(false)
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Main Content - Product Listings */}
            <div className="flex-1">
              {/* Desktop Product Header - Only visible on desktop */}
              <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <div className="mb-4 md:mb-0 pb-0">
                    <h2 className="text-2xl font-bold">{productCount} Products Available</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Showing results based on your preferences</p>
                    
                    {/* Active Filters Summary */}
                    {(searchQuery || priceRange.min || priceRange.max || selectedConditions.length > 0 || selectedProductTypes.length > 0 || sortBy !== "newest") && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {searchQuery && (
                          <Badge variant="secondary" className="text-xs">
                            Search: "{searchQuery}"
                          </Badge>
                        )}
                        {(priceRange.min || priceRange.max) && (
                          <Badge variant="secondary" className="text-xs">
                            Price: ₹{priceRange.min || "0"} - ₹{priceRange.max || "∞"}
                          </Badge>
                        )}
                        {selectedConditions.map(condition => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {selectedProductTypes.map(type => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {sortBy !== "newest" && (
                          <Badge variant="secondary" className="text-xs">
                            Sort: {sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : "Newest"}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search for   equipment..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Tabs defaultValue={viewMode} onValueChange={setViewMode}>
                      <TabsList className="bg-white dark:bg-gray-800">
                        <TabsTrigger
                          value="grid"
                          className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                        >
                          <Grid className="h-4 w-4" />
                        </TabsTrigger>
                        <TabsTrigger
                          value="list"
                          className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                        >
                          <List className="h-4 w-4" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Products grid/list using ExpandableProductCard */}
              {isLoadingProducts ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading products...</h3>
                  <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the latest items.</p>
                </div>
              ) : products.length > 0 ? (
                <div
                  className={`${
                    viewMode === "grid" ? "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6" : "space-y-4"
                  } mb-8`}
                >
                  {products.map((product) => (
                    <ExpandableProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      viewMode={viewMode as "grid" | "list"}
                      cartItems={cartItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Item Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post an Item for Sale</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Sony 4K Camcorder"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                className="min-h-[100px]"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="e.g., 2499"
                  value={newProduct.price}
                  className={priceError ? 'border-red-500 focus:border-red-500' : ''}
                  onChange={(e) => {
                    let value = e.target.value
                    // Remove all non-digit and non-dot characters, and allow only one dot
                    value = value.replace(/[^\d.]/g, '')
                    const parts = value.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }
                    setNewProduct({ ...newProduct, price: value })
                    setPriceError("")
                  }}
                />
                {priceError && (
                  <span className="text-red-500 text-xs mt-1 block">{priceError}</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={newProduct.condition}
                  onValueChange={(value) => setNewProduct({ ...newProduct, condition: value })}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="For Parts">For Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter your location"
                value={newProduct.location}
                onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
              />
            </div>

            {/* Category selection - Temporarily removed, will be integrated later
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(category => category.name !== "All")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            */}

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="image">Upload Images</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop images here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                {newProduct.image_url && !newProduct.image_url.startsWith("/placeholder") && (
                  <div className="mt-4 flex flex-col items-center">
                    <img src={newProduct.image_url} alt="Preview" className="max-h-32 rounded" />
                    <span className="text-xs text-gray-500 mt-1">Image Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                You'll earn 50 points for posting this item!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePostProduct} disabled={!isPostItemFormValid}>
              Post Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b">
                  <h3 className="font-medium">Order Summary ({cartItemCount} items)</h3>
                </div>
                <div className="p-4 max-h-[200px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <img
                          src={item.product?.image_url || "/placeholder.svg"}
                          alt={item.product?.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="checkout-name">Full Name</Label>
                <Input
                  id="checkout-name"
                  placeholder="Enter your full name"
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="checkout-address">Shipping Address</Label>
                <Textarea
                  id="checkout-address"
                  placeholder="Enter your complete shipping address..."
                  className="min-h-[80px]"
                  value={checkoutData.shippingAddress}
                  onChange={(e) => setCheckoutData({ ...checkoutData, shippingAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    placeholder="your@email.com"
                    value={checkoutData.email}
                    onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="checkout-phone">Phone Number</Label>
                  <Input
                    id="checkout-phone"
                    placeholder="e.g., +91 98765 43210"
                    value={checkoutData.contactNumber}
                    onChange={(e) => setCheckoutData({ ...checkoutData, contactNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="checkout-payment">Payment Method</Label>
                <Select
                  value={checkoutData.paymentMethod}
                  onValueChange={(value) => setCheckoutData({ ...checkoutData, paymentMethod: value })}
                >
                  <SelectTrigger id="checkout-payment">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    {/* <SelectItem value="card">Credit/Debit Card</SelectItem> */}
                    <SelectItem value="upi">UPI Payment</SelectItem>
                    {/* <SelectItem value="bank">Bank Transfer</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="checkout-notes">Notes (Optional)</Label>
                <Textarea
                  id="checkout-notes"
                  placeholder="Any special instructions..."
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  You'll earn {Math.floor(cartTotal / 20)} points for this purchase!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={completeCheckout}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentWrapper>
  )
}

export default EkartPage
