"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductCategory, CartItem } from "@/types/supabase"

interface UseEkartResult {
  // Products
  products: Product[]
  productCount: number
  isLoadingProducts: boolean
  loadProducts: () => Promise<void>
  getProductById: (id: string) => Promise<Product | null>

  // Categories
  categories: ProductCategory[]
  isLoadingCategories: boolean
  loadCategories: () => Promise<void>

  // Cart
  cartItems: CartItem[]
  cartTotal: number
  cartItemCount: number
  isLoadingCart: boolean
  loadCartItems: () => Promise<void>
  addToCart: (productId: string) => Promise<boolean>
  removeFromCart: (cartItemId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<boolean>
  createOrder: (orderData: {
    shippingAddress: string
    contactNumber: string
    paymentMethod: string
    notes?: string
  }) => Promise<{ success: boolean; orderId?: string; error?: string }>

  // Product posting
  postProduct: (productData: any) => Promise<boolean>

  // New filter function
  applyFilters: (filters: {
    search?: string
    minPrice?: number
    maxPrice?: number
    conditions?: string[]
    sortBy?: string
  }) => void

  // Refresh all data (invalidate cache and reload)
  refreshData: () => Promise<void>

  // Cache invalidation functions
  invalidateProductCache: () => void
  invalidateCategoryCache: () => void
  invalidateAllCaches: () => void
}

const PRODUCT_CACHE_KEY = "ekartProductCache"
const CATEGORY_CACHE_KEY = "ekartCategoryCache"
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export function useEkart(): UseEkartResult {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productCount, setProductCount] = useState(0)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const { toast } = useToast()

  // Cache invalidation functions
  const invalidateProductCache = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(PRODUCT_CACHE_KEY)
    }
  }, [])

  const invalidateCategoryCache = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CATEGORY_CACHE_KEY)
    }
  }, [])

  const invalidateAllCaches = useCallback(() => {
    invalidateProductCache()
    invalidateCategoryCache()
  }, [invalidateProductCache, invalidateCategoryCache])

  // Computed values for cart
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.product && typeof item.product === 'object' && 'price' in item.product) {
        return sum + (Number(item.product.price) * item.quantity)
      }
      return sum
    }, 0)
  }, [cartItems])

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  // Load product categories
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    // Try cache first
    if (typeof window !== "undefined") {
      const cacheRaw = localStorage.getItem(CATEGORY_CACHE_KEY)
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw)
        if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL && Array.isArray(cache.categories)) {
          setCategories(cache.categories)
          setIsLoadingCategories(false)
          return
        }
      }
    }
    try {
      const response = await fetch("/api/products/categories")
      const data = await response.json()
      if (data.success && data.categories) {
        const allCategories = data.categories.sort((a: ProductCategory, b: ProductCategory) => {
          if (a.name === "All") return -1
          if (b.name === "All") return 1
          return a.name.localeCompare(b.name)
        })
        setCategories(allCategories)
        if (typeof window !== "undefined") {
          localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify({ categories: allCategories, timestamp: Date.now() }))
        }
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories([])
    } finally {
      setIsLoadingCategories(false)
    }
  }, [])

  // Load all products (with caching)
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    
    // Try cache first
    if (typeof window !== "undefined") {
      const cacheRaw = localStorage.getItem(PRODUCT_CACHE_KEY)
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw)
        if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL && Array.isArray(cache.products)) {
          const allProducts = cache.products.filter((p: Product) => p.is_active)
          setAllProducts(allProducts)
          setFilteredProducts(allProducts)
          setProductCount(allProducts.length)
          setIsLoadingProducts(false)
          return
        }
      }
    }
    
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      
      if (data.success) {
        const allProducts = (data.products || []).filter((p: Product) => p.is_active)
        
        // Sort by posted_at date (newest first)
        allProducts.sort((a: Product, b: Product) => 
          new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
        )
        
        setAllProducts(allProducts)
        setFilteredProducts(allProducts)
        setProductCount(allProducts.length)
        
        // Cache the products
        if (typeof window !== "undefined") {
          localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({ 
            products: allProducts, 
            timestamp: Date.now() 
          }))
        }
      } else {
        setAllProducts([])
        setFilteredProducts([])
        setProductCount(0)
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setAllProducts([])
      setFilteredProducts([])
      setProductCount(0)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Apply filters to cached products
  const applyFilters = useCallback((filters: {
    search?: string
    minPrice?: number
    maxPrice?: number
    conditions?: string[]
    sortBy?: string
  }) => {
    let filtered = [...allProducts]
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply price filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!)
    }
    
    // Apply condition filter
    if (filters.conditions && filters.conditions.length > 0) {
      filtered = filtered.filter(p => filters.conditions!.includes(p.condition))
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort((a, b) => 
            new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
          )
          break
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        default:
          // Default to newest
          filtered.sort((a, b) => 
            new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
          )
      }
    } else {
      // Default to newest if no sort specified
      filtered.sort((a, b) => 
        new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
      )
    }
    
    setFilteredProducts(filtered)
    setProductCount(filtered.length)
  }, [allProducts])

  // Load cart items
  const loadCartItems = useCallback(async () => {
    setIsLoadingCart(true)

    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      
      if (response.ok && data.items) {
        setCartItems(data.items || [])
        // console.log("Cart items after refresh:", data.items)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error("Error loading cart items:", error)
      setCartItems([])
    } finally {
      setIsLoadingCart(false)
    }
  }, [])

  // Add to cart
  const addToCart = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, quantity: 1 })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Immediately fetch the latest cart from backend for correct structure and keys
          await loadCartItems();
          
          toast({
            title: "Added to cart",
            description: "Item has been added to your cart."
          })
          return true
        } else {
          // Handle quantity limit errors
          if (response.status === 400 && data.error && data.error.includes("Maximum available quantity")) {
            toast({
              title: "Quantity limit reached",
              description: data.error,
              variant: "destructive"
            })
          } else {
            toast({
              title: "Error",
              description: data.error || "Failed to add item to cart",
              variant: "destructive"
            })
          }
          return false
        }
      } catch (error: any) {
        console.error("Error adding to cart:", error)
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        })
        return false
      }
    },
    [toast, loadCartItems],
  )

  // Remove from cart
  const removeFromCart = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/cart?item_id=${cartItemId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Update local cart state immediately
          setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId))
          
          toast({
            title: "Item removed",
            description: "Item has been removed from your cart."
          })
          return true
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to remove item from cart",
            variant: "destructive"
          })
          return false
        }
      } catch (error: any) {
        console.error("Error removing from cart:", error)
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive"
        })
        return false
      }
    },
    [toast],
  )

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local cart state immediately
        setCartItems([])
        
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart."
        })
        return true
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clear cart",
          variant: "destructive"
        })
        return false
      }
    } catch (error: any) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  // Update cart item quantity
  const updateCartItemQuantity = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      try {
        const response = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: cartItemId, quantity })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Update local cart state immediately
          setCartItems(prevItems => 
            prevItems.map(item => 
              item.id === cartItemId 
                ? { ...item, quantity } 
                : item
            )
          )
          
          toast({
            title: "Cart updated",
            description: "Item quantity has been updated."
          })
          return true
        } else {
          // Handle quantity limit errors
          if (response.status === 400 && data.error && data.error.includes("Maximum available quantity")) {
            toast({
              title: "Quantity limit reached",
              description: data.error,
              variant: "destructive"
            })
          } else {
            toast({
              title: "Error",
              description: data.error || "Failed to update item quantity",
              variant: "destructive"
            })
          }
          return false
        }
      } catch (error: any) {
        console.error("Error updating cart item quantity:", error)
        toast({
          title: "Error",
          description: "Failed to update item quantity",
          variant: "destructive"
        })
        return false
      }
    },
    [toast],
  )

  // Create order
  const createOrder = useCallback(
    async (orderData: { 
      shippingAddress: string
      contactNumber: string
      paymentMethod: string
      notes?: string 
    }) => {
      try {
        if (cartItems.length === 0) {
          return {
            success: false,
            error: "Your cart is empty",
          }
        }

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shipping_address: orderData.shippingAddress,
            contact_number: orderData.contactNumber,
            payment_method: orderData.paymentMethod,
            notes: orderData.notes,
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Invalidate product cache since quantities may have changed
          invalidateProductCache()
          
          toast({
            title: "Order placed",
            description: "Your order has been placed successfully."
          })
          
          return {
            success: true,
            orderId: data.order?.id?.toString(),
          }
        } else {
          return {
            success: false,
            error: data.error || "Failed to create order",
          }
        }
      } catch (error: any) {
        console.error("Error creating order:", error)
        return {
          success: false,
          error: "Failed to create order",
        }
      }
    },
    [cartItems, toast, invalidateProductCache],
  )

  // Get product by ID
  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.product || null
      }
      return null
    } catch (error) {
      console.error("Error getting product:", error)
      return null
    }
  }, [])

  // Post a product
  const postProduct = async (productData: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Invalidate product cache since new product was added
        invalidateProductCache()
        
        toast({
          title: "Product posted",
          description: "Your product has been posted successfully.",
        })
        // Reload products after posting
        await loadProducts()
        return true
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to post product",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error posting product:", error)
      toast({
        title: "Error",
        description: "Failed to post product",
        variant: "destructive",
      })
      return false
    }
  }

  // Refresh all data (invalidate cache and reload)
  const refreshData = useCallback(async () => {
    invalidateAllCaches()
    await Promise.all([
      loadCategories(),
      loadProducts(),
      loadCartItems()
    ])
  }, [invalidateAllCaches, loadCategories, loadProducts, loadCartItems])

  // Load data on mount
  useEffect(() => {
    loadCategories()
    loadProducts()
    loadCartItems()
  }, [loadCategories, loadProducts, loadCartItems])

  return {
    products: filteredProducts,
    productCount,
    categories,
    cartItems,
    cartTotal,
    cartItemCount,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingCart,
    loadProducts,
    loadCategories,
    loadCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQuantity,
    createOrder,
    postProduct,
    getProductById,
    applyFilters,
    refreshData,
    invalidateProductCache,
    invalidateCategoryCache,
    invalidateAllCaches,
  }
}
