"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Star, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/file-service"

interface Brand {
  id: string
  name: string
  logo?: string
  description?: string
  rating?: number
  review_count?: number
  featured?: boolean
  trending?: boolean
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
}

interface ReviewCategory {
  id: string
  name: string
  created_at: string
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
}

interface ReviewRequest {
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

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<ReviewProduct[]>([])
  const [categories, setCategories] = useState<ReviewCategory[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [requests, setRequests] = useState<ReviewRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Dialog states
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null)

  // Edit dialog states
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [editingProduct, setEditingProduct] = useState<ReviewProduct | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Product edit additional states
  const [productImage, setProductImage] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showNewBrandForm, setShowNewBrandForm] = useState(false)
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newBrandInProduct, setNewBrandInProduct] = useState({ name: "", description: "", logo: "" })
  const [newCategoryInProduct, setNewCategoryInProduct] = useState({ name: "" })

  // Add product additional states
  const [addProductImage, setAddProductImage] = useState<File | null>(null)
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false)
  const [showNewBrandFormAdd, setShowNewBrandFormAdd] = useState(false)
  const [showNewCategoryFormAdd, setShowNewCategoryFormAdd] = useState(false)
  const [newBrandInAddProduct, setNewBrandInAddProduct] = useState({ name: "", description: "", logo: "" })
  const [newCategoryInAddProduct, setNewCategoryInAddProduct] = useState({ name: "" })

  // Form states
  const [newBrand, setNewBrand] = useState({ name: "", description: "", logo: "" })
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    brand_id: "", 
    category_id: "", 
    price: "", 
    description: "",
    features: [] as string[],
    pros: [] as string[],
    cons: [] as string[],
    image: ""
  })
  const [newCategory, setNewCategory] = useState({ name: "" })

  // Edit form states
  const [editBrand, setEditBrand] = useState({ name: "", description: "", logo: "" })
  const [editProduct, setEditProduct] = useState({ 
    name: "", 
    brand_id: "", 
    category_id: "", 
    price: "", 
    description: "",
    features: [] as string[],
    pros: [] as string[],
    cons: [] as string[],
    image: ""
  })
  const [editReview, setEditReview] = useState({ 
    title: "", 
    content: "", 
    rating: 5,
    category_id: "" 
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [brandsRes, productsRes, categoriesRes, reviewsRes, requestsRes] = await Promise.all([
        fetch('/api/reviews?type=brands').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/reviews?type=products').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/reviews?type=categories').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/reviews?type=reviews').catch(() => ({ ok: false, json: () => [] })),
        fetch('/api/reviews/requests').catch(() => ({ ok: false, json: () => [] }))
      ])

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setBrands(brandsData || [])
      } else {
        console.error('Failed to fetch brands')
        setBrands([])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData || [])
      } else {
        console.error('Failed to fetch products')
        setProducts([])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData?.categories || [])
      } else {
        console.error('Failed to fetch categories')
        setCategories([])
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData || [])
      } else {
        console.error('Failed to fetch reviews')
        setReviews([])
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData || [])
      } else {
        console.error('Failed to fetch requests')
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
      // Set empty arrays to prevent crashes
      setBrands([])
      setProducts([])
      setCategories([])
      setReviews([])
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = async () => {
    try {
      const response = await fetch('/api/admin/reviews/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand)
      })

      if (response.ok) {
        toast.success('Brand added successfully')
        setIsAddBrandOpen(false)
        setNewBrand({ name: "", description: "", logo: "" })
        fetchData()
      } else {
        toast.error('Failed to add brand')
      }
    } catch (error) {
      toast.error('Error adding brand')
    }
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/reviews/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (response.ok) {
        toast.success('Product added successfully')
        setIsAddProductOpen(false)
        setNewProduct({ name: "", brand_id: "", category_id: "", price: "", description: "", features: [], pros: [], cons: [], image: "" })
        setAddProductImage(null)
        setShowNewBrandFormAdd(false)
        setShowNewCategoryFormAdd(false)
        setNewBrandInAddProduct({ name: "", description: "", logo: "" })
        setNewCategoryInAddProduct({ name: "" })
        fetchData()
      } else {
        toast.error('Failed to add product')
      }
    } catch (error) {
      toast.error('Error adding product')
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/admin/reviews/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })

      if (response.ok) {
        toast.success('Category added successfully')
        setIsAddCategoryOpen(false)
        setNewCategory({ name: "" })
        fetchData()
      } else {
        toast.error('Failed to add category')
      }
    } catch (error) {
      toast.error('Error adding category')
    }
  }

  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/reviews/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Request ${status}`)
        fetchData()
      } else {
        toast.error('Failed to update request status')
      }
    } catch (error) {
      toast.error('Error updating request status')
    }
  }

  // Edit handlers
  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setEditBrand({
      name: brand.name,
      description: brand.description || "",
      logo: brand.logo || ""
    })
    setIsEditBrandOpen(true)
  }

  const handleUpdateBrand = async () => {
    if (!editingBrand) return
    
    try {
      const response = await fetch(`/api/admin/reviews/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBrand)
      })

      if (response.ok) {
        toast.success('Brand updated successfully')
        setIsEditBrandOpen(false)
        setEditingBrand(null)
        setEditBrand({ name: "", description: "", logo: "" })
        fetchData()
      } else {
        toast.error('Failed to update brand')
      }
    } catch (error) {
      toast.error('Error updating brand')
    }
  }

  const handleEditProduct = (product: ReviewProduct) => {
    setEditingProduct(product)
    setEditProduct({
      name: product.name,
      brand_id: product.brand_id,
      category_id: product.category_id || "",
      price: product.price || "",
      description: product.description || "",
      features: product.features || [],
      pros: product.pros || [],
      cons: product.cons || [],
      image: product.image || ""
    })
    setIsEditProductOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    try {
      const response = await fetch(`/api/admin/reviews/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct)
      })

      if (response.ok) {
        toast.success('Product updated successfully')
        setIsEditProductOpen(false)
        setEditingProduct(null)
        setEditProduct({ name: "", brand_id: "", category_id: "", price: "", description: "", features: [], pros: [], cons: [], image: "" })
        setProductImage(null)
        setShowNewBrandForm(false)
        setShowNewCategoryForm(false)
        setNewBrandInProduct({ name: "", description: "", logo: "" })
        setNewCategoryInProduct({ name: "" })
        fetchData()
      } else {
        toast.error('Failed to update product')
      }
    } catch (error) {
      toast.error('Error updating product')
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setEditReview({
      title: review.title,
      content: review.content,
      rating: review.rating,
      category_id: review.category_id || ""
    })
    setIsEditReviewOpen(true)
  }

  const handleUpdateReview = async () => {
    if (!editingReview) return
    
    try {
      const response = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editReview)
      })

      if (response.ok) {
        toast.success('Review updated successfully')
        setIsEditReviewOpen(false)
        setEditingReview(null)
        setEditReview({ title: "", content: "", rating: 5, category_id: "" })
        fetchData()
      } else {
        toast.error('Failed to update review')
      }
    } catch (error) {
      toast.error('Error updating review')
    }
  }

  // Helper functions for array fields
  const addArrayItem = (field: 'features' | 'pros' | 'cons', value: string) => {
    if (!value.trim()) return
    setEditProduct(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }))
  }

  const removeArrayItem = (field: 'features' | 'pros' | 'cons', index: number) => {
    setEditProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'features' | 'pros' | 'cons', index: number, value: string) => {
    setEditProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)
      const result = await uploadFile(file)
      setEditProduct(prev => ({ ...prev, image: result.url }))
      setProductImage(null)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Create new brand from product dialog
  const handleCreateBrandFromProduct = async () => {
    try {
      const response = await fetch('/api/admin/reviews/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrandInProduct)
      })

      if (response.ok) {
        const { brand } = await response.json()
        setEditProduct(prev => ({ ...prev, brand_id: brand.id }))
        setBrands(prev => [...prev, brand])
        setShowNewBrandForm(false)
        setNewBrandInProduct({ name: "", description: "", logo: "" })
        toast.success('Brand created successfully')
      } else {
        toast.error('Failed to create brand')
      }
    } catch (error) {
      toast.error('Error creating brand')
    }
  }

  // Create new category from product dialog
  const handleCreateCategoryFromProduct = async () => {
    try {
      const response = await fetch('/api/admin/reviews/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategoryInProduct)
      })

      if (response.ok) {
        const { category } = await response.json()
        setEditProduct(prev => ({ ...prev, category_id: category.id }))
        setCategories(prev => [...prev, category])
        setShowNewCategoryForm(false)
        setNewCategoryInProduct({ name: "" })
        toast.success('Category created successfully')
      } else {
        toast.error('Failed to create category')
      }
    } catch (error) {
      toast.error('Error creating category')
    }
  }

  // Helper functions for add product dialog
  const addArrayItemAdd = (field: 'features' | 'pros' | 'cons', value: string) => {
    if (!value.trim()) return
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }))
  }

  const removeArrayItemAdd = (field: 'features' | 'pros' | 'cons', index: number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItemAdd = (field: 'features' | 'pros' | 'cons', index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  // Image upload handler for add product
  const handleImageUploadAdd = async (file: File) => {
    try {
      setIsUploadingAddImage(true)
      const result = await uploadFile(file)
      setNewProduct(prev => ({ ...prev, image: result.url }))
      setAddProductImage(null)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingAddImage(false)
    }
  }

  // Create new brand from add product dialog
  const handleCreateBrandFromAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/reviews/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrandInAddProduct)
      })

      if (response.ok) {
        const { brand } = await response.json()
        setNewProduct(prev => ({ ...prev, brand_id: brand.id }))
        setBrands(prev => [...prev, brand])
        setShowNewBrandFormAdd(false)
        setNewBrandInAddProduct({ name: "", description: "", logo: "" })
        toast.success('Brand created successfully')
      } else {
        toast.error('Failed to create brand')
      }
    } catch (error) {
      toast.error('Error creating brand')
    }
  }

  // Create new category from add product dialog
  const handleCreateCategoryFromAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/reviews/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategoryInAddProduct)
      })

      if (response.ok) {
        const { category } = await response.json()
        setNewProduct(prev => ({ ...prev, category_id: category.id }))
        setCategories(prev => [...prev, category])
        setShowNewCategoryFormAdd(false)
        setNewCategoryInAddProduct({ name: "" })
        toast.success('Category created successfully')
      } else {
        toast.error('Failed to create category')
      }
    } catch (error) {
      toast.error('Error creating category')
    }
  }

  const filteredReviews = (reviews || []).filter(review => {
    const matchesSearch = !searchQuery || 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || !selectedCategory || review.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredRequests = (requests || []).filter(request => {
    const matchesStatus = selectedStatus === "all" || !selectedStatus || request.status === selectedStatus
    return matchesStatus
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(brands || []).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(products || []).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(reviews || []).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(requests || []).filter(r => r.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(reviews || []).slice(0, 5).map((review) => (
                    <div key={review.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{review.title}</p>
                        <p className="text-sm text-gray-500">by {review.user?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">{review.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(brands || [])
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-sm text-gray-500">{brand.review_count || 0} reviews</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {brand.rating && renderStars(brand.rating)}
                          <span className="text-sm text-gray-500">{brand.rating?.toFixed(1)}/5</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Brands</CardTitle>
                <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Brand
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Brand</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input
                          id="brand-name"
                          value={newBrand.name}
                          onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand-description">Description</Label>
                        <Textarea
                          id="brand-description"
                          value={newBrand.description}
                          onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand-logo">Logo URL</Label>
                        <Input
                          id="brand-logo"
                          value={newBrand.logo}
                          onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddBrand} className="w-full">Add Brand</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.description || "-"}</TableCell>
                      <TableCell>
                        {brand.rating ? (
                          <div className="flex items-center gap-2">
                            {renderStars(brand.rating)}
                            <span>{brand.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{brand.review_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {brand.featured && <Badge>Featured</Badge>}
                          {brand.trending && <Badge variant="secondary">Trending</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBrand(brand)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Products</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-name">Product Name *</Label>
                          <Input
                            id="product-name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-price">Price</Label>
                          <Input
                            id="product-price"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            placeholder="$999"
                          />
                        </div>
                      </div>

                      {/* Brand Selection */}
                      <div>
                        <Label htmlFor="product-brand">Brand *</Label>
                        <div className="flex gap-2">
                          <Select value={newProduct.brand_id} onValueChange={(value) => setNewProduct({ ...newProduct, brand_id: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNewBrandFormAdd(!showNewBrandFormAdd)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {showNewBrandFormAdd && (
                          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium mb-3">Create New Brand</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="new-brand-name-add">Brand Name</Label>
                                <Input
                                  id="new-brand-name-add"
                                  value={newBrandInAddProduct.name}
                                  onChange={(e) => setNewBrandInAddProduct({ ...newBrandInAddProduct, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-brand-description-add">Description</Label>
                                <Textarea
                                  id="new-brand-description-add"
                                  value={newBrandInAddProduct.description}
                                  onChange={(e) => setNewBrandInAddProduct({ ...newBrandInAddProduct, description: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-brand-logo-add">Logo URL</Label>
                                <Input
                                  id="new-brand-logo-add"
                                  value={newBrandInAddProduct.logo}
                                  onChange={(e) => setNewBrandInAddProduct({ ...newBrandInAddProduct, logo: e.target.value })}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleCreateBrandFromAddProduct} size="sm">
                                  Create Brand
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowNewBrandFormAdd(false)} 
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Category Selection */}
                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <div className="flex gap-2">
                          <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNewCategoryFormAdd(!showNewCategoryFormAdd)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {showNewCategoryFormAdd && (
                          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium mb-3">Create New Category</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="new-category-name-add">Category Name</Label>
                                <Input
                                  id="new-category-name-add"
                                  value={newCategoryInAddProduct.name}
                                  onChange={(e) => setNewCategoryInAddProduct({ ...newCategoryInAddProduct, name: e.target.value })}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleCreateCategoryFromAddProduct} size="sm">
                                  Create Category
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowNewCategoryFormAdd(false)} 
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label>Product Image</Label>
                        <div className="space-y-3">
                          {newProduct.image && (
                            <div className="relative">
                              <img 
                                src={newProduct.image} 
                                alt="Product" 
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                onClick={() => setNewProduct({ ...newProduct, image: "" })}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setAddProductImage(file)
                                  handleImageUploadAdd(file)
                                }
                              }}
                              disabled={isUploadingAddImage}
                            />
                            {isUploadingAddImage && (
                              <div className="flex items-center text-sm text-gray-500">
                                Uploading...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea
                          id="product-description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      {/* Features */}
                      <div>
                        <Label>Features</Label>
                        <div className="space-y-2">
                          {newProduct.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => updateArrayItemAdd('features', index, e.target.value)}
                                placeholder="Enter feature"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItemAdd('features', index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new feature"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addArrayItemAdd('features', e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                addArrayItemAdd('features', input.value)
                                input.value = ''
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Pros */}
                      <div>
                        <Label>Pros</Label>
                        <div className="space-y-2">
                          {newProduct.pros.map((pro, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={pro}
                                onChange={(e) => updateArrayItemAdd('pros', index, e.target.value)}
                                placeholder="Enter pro"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItemAdd('pros', index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new pro"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addArrayItemAdd('pros', e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                addArrayItemAdd('pros', input.value)
                                input.value = ''
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Cons */}
                      <div>
                        <Label>Cons</Label>
                        <div className="space-y-2">
                          {newProduct.cons.map((con, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={con}
                                onChange={(e) => updateArrayItemAdd('cons', index, e.target.value)}
                                placeholder="Enter con"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItemAdd('cons', index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new con"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addArrayItemAdd('cons', e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                addArrayItemAdd('cons', input.value)
                                input.value = ''
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleAddProduct} className="w-full">
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand?.name || "-"}</TableCell>
                      <TableCell>{product.category?.name || "-"}</TableCell>
                      <TableCell>{product.price || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Manage Reviews</CardTitle>
              <div className="flex gap-4">
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.title}</TableCell>
                      <TableCell>{review.user?.full_name || "-"}</TableCell>
                      <TableCell>{review.category?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span>{review.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditReview(review)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Requests</CardTitle>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.user?.full_name || "-"}</TableCell>
                      <TableCell className="max-w-md truncate">{request.content}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="text-sm">{selectedRequest.user?.full_name} ({selectedRequest.user?.email})</p>
              </div>
              <div>
                <Label>Content</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.content}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={
                  selectedRequest.status === 'approved' ? 'default' :
                  selectedRequest.status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditBrandOpen} onOpenChange={setIsEditBrandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-brand-name">Brand Name</Label>
              <Input
                id="edit-brand-name"
                value={editBrand.name}
                onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-brand-description">Description</Label>
              <Textarea
                id="edit-brand-description"
                value={editBrand.description}
                onChange={(e) => setEditBrand({ ...editBrand, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-brand-logo">Logo URL</Label>
              <Input
                id="edit-brand-logo"
                value={editBrand.logo}
                onChange={(e) => setEditBrand({ ...editBrand, logo: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdateBrand} className="w-full">Update Brand</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-product-name">Product Name *</Label>
                <Input
                  id="edit-product-name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-product-price">Price</Label>
                <Input
                  id="edit-product-price"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  placeholder="$999"
                />
              </div>
            </div>

            {/* Brand Selection */}
            <div>
              <Label htmlFor="edit-product-brand">Brand *</Label>
              <div className="flex gap-2">
                <Select value={editProduct.brand_id} onValueChange={(value) => setEditProduct({ ...editProduct, brand_id: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewBrandForm(!showNewBrandForm)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {showNewBrandForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Create New Brand</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-brand-name">Brand Name</Label>
                      <Input
                        id="new-brand-name"
                        value={newBrandInProduct.name}
                        onChange={(e) => setNewBrandInProduct({ ...newBrandInProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-brand-description">Description</Label>
                      <Textarea
                        id="new-brand-description"
                        value={newBrandInProduct.description}
                        onChange={(e) => setNewBrandInProduct({ ...newBrandInProduct, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-brand-logo">Logo URL</Label>
                      <Input
                        id="new-brand-logo"
                        value={newBrandInProduct.logo}
                        onChange={(e) => setNewBrandInProduct({ ...newBrandInProduct, logo: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateBrandFromProduct} size="sm">
                        Create Brand
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewBrandForm(false)} 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <Label htmlFor="edit-product-category">Category</Label>
              <div className="flex gap-2">
                <Select value={editProduct.category_id} onValueChange={(value) => setEditProduct({ ...editProduct, category_id: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {showNewCategoryForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Create New Category</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-category-name">Category Name</Label>
                      <Input
                        id="new-category-name"
                        value={newCategoryInProduct.name}
                        onChange={(e) => setNewCategoryInProduct({ ...newCategoryInProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCategoryFromProduct} size="sm">
                        Create Category
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewCategoryForm(false)} 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <Label>Product Image</Label>
              <div className="space-y-3">
                {editProduct.image && (
                  <div className="relative">
                    <img 
                      src={editProduct.image} 
                      alt="Product" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => setEditProduct({ ...editProduct, image: "" })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setProductImage(file)
                        handleImageUpload(file)
                      }
                    }}
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && (
                    <div className="flex items-center text-sm text-gray-500">
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="edit-product-description">Description</Label>
              <Textarea
                id="edit-product-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                {editProduct.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateArrayItem('features', index, e.target.value)}
                      placeholder="Enter feature"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new feature"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('features', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addArrayItem('features', input.value)
                      input.value = ''
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Pros */}
            <div>
              <Label>Pros</Label>
              <div className="space-y-2">
                {editProduct.pros.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={pro}
                      onChange={(e) => updateArrayItem('pros', index, e.target.value)}
                      placeholder="Enter pro"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('pros', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new pro"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('pros', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addArrayItem('pros', input.value)
                      input.value = ''
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Cons */}
            <div>
              <Label>Cons</Label>
              <div className="space-y-2">
                {editProduct.cons.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={con}
                      onChange={(e) => updateArrayItem('cons', index, e.target.value)}
                      placeholder="Enter con"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('cons', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new con"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('cons', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addArrayItem('cons', input.value)
                      input.value = ''
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleUpdateProduct} className="w-full">
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditReviewOpen} onOpenChange={setIsEditReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-review-title">Title</Label>
              <Input
                id="edit-review-title"
                value={editReview.title}
                onChange={(e) => setEditReview({ ...editReview, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-review-content">Content</Label>
              <Textarea
                id="edit-review-content"
                value={editReview.content}
                onChange={(e) => setEditReview({ ...editReview, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-review-rating">Rating</Label>
              <Select value={editReview.rating.toString()} onValueChange={(value) => setEditReview({ ...editReview, rating: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-review-category">Category</Label>
              <Select value={editReview.category_id} onValueChange={(value) => setEditReview({ ...editReview, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateReview} className="w-full">Update Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 