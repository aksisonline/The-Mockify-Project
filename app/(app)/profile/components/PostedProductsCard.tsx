"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Package, Tag, MapPin, Pencil, Trash2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { validateProfileForPosting } from "@/lib/profile-validation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { uploadFile } from "@/lib/file-service"

// Add product types array
const PRODUCT_TYPES = [
  { name: "New", id: "New" },
  { name: "Like New", id: "Like New" },
  { name: "Good", id: "Good" },
  { name: "Fair", id: "Fair" },
  { name: "For Parts", id: "For Parts" },
]

export default function PostedProductsCard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deletingProduct, setDeletingProduct] = useState<any>(null)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    quantity: "1",
  })

  // New product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Good",
    location: "Bangalore",
    image_url: "/placeholder.svg?height=300&width=400",
    quantity: "1",
  })

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

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/ekart/seller/products")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products")
      }

      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const { url } = await uploadFile(file)
      setNewProduct(prev => ({ ...prev, image_url: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

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
        location: "Bangalore",
        image_url: "/placeholder.svg?height=300&width=400",
        quantity: "1",
      })
      setShowPostDialog(false)

      // Refresh products list
      fetchProducts()
    } catch (error: any) {
      console.error("Error posting product:", error)
      toast.error(error.message || "Failed to post product")
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/ekart/seller/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product status")
      }

      setProducts(products.map(product => 
        product.id === productId ? { ...product, is_active: !currentStatus } : product
      ))
      toast.success(`Product ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error("Error updating product status:", error)
      toast.error("Failed to update product status")
    }
  }

  const handleEditClick = (product: any) => {
    setEditingProduct(product)
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      location: product.location,
      quantity: product.quantity.toString(),
    })
  }

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/ekart/seller/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: parseFloat(editForm.price),
          location: editForm.location,
          quantity: parseInt(editForm.quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product")
      }

      setProducts(products.map(product => 
        product.id === editingProduct.id ? {
          ...product,
          title: editForm.title,
          description: editForm.description,
          price: parseFloat(editForm.price),
          location: editForm.location,
          quantity: parseInt(editForm.quantity),
        } : product
      ))
      toast.success("Product updated successfully")
      setEditingProduct(null)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/ekart/seller/products/${deletingProduct.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product")
      }

      setProducts(products.filter(product => product.id !== deletingProduct.id))
      toast.success("Product deleted successfully")
      setDeletingProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Posted Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading products...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Posted Products</CardTitle>
          <Button onClick={handlePostItemClick}>
            <Plus className="mr-2 h-4 w-4" />
            Post an Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">{product.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(product.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(product.is_active)}>
                      {product.is_active ? "Active" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => toggleProductStatus(product.id, product.is_active)}
                    />
                  </div>
                </div>

                <div className="relative h-48 rounded-md overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>₹{product.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Qty: {product.quantity}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(product)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Post Item Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post a New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newProduct.title}
                onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter item title"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={newProduct.condition}
                  onValueChange={(value) => setNewProduct(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your location"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="flex-1"
                />
                {newProduct.image_url && !newProduct.image_url.startsWith("/placeholder") && (
                  <div className="relative w-20 h-20">
                    <img
                      src={newProduct.image_url}
                      alt="Preview"
                      className="object-cover rounded-lg w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePostProduct} disabled={!isPostItemFormValid || uploading}>
              {uploading ? "Uploading..." : "Post Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price">Price (₹)</label>
              <Input
                id="price"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity">Quantity</label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location">Location</label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from your listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 