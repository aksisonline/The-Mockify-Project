"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Gift, Users, Calendar, Eye, Trash2, Package, Coins, Upload, X, Edit, MessageSquare } from "lucide-react"
import { uploadFile } from "@/lib/file-service"
import RewardPurchaseDetails from "@/components/rewards/RewardPurchaseDetails"

interface Reward {
  id: string
  title: string
  description?: string
  price: string
  category: string
  quantity: number
  image_url?: string
  is_active: boolean
  created_at: string
}

interface RewardPurchase {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar_url?: string
  user_phone?: string
  user_avc_id?: string
  user_address?: string
  user_address_details?: {
    addressline1?: string
    addressline2?: string
    country?: string
    state?: string
    city?: string
    zip_code?: string
    is_indian?: boolean
  }
  reward_id: string
  reward_title: string
  reward_description?: string
  reward_category: string
  quantity: number
  points_spent: number
  purchased_at: string
  transaction_id: string
  transaction_status: string
  purchase_status: string
  seller_name?: string
  seller_email?: string
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [purchases, setPurchases] = useState<RewardPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<RewardPurchase | null>(null)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    image_url: "",
    is_active: true
  })
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    image_url: "",
    is_active: true
  })
  const [statusForm, setStatusForm] = useState({
    status: "",
    notes: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [searchTerm, filterCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch rewards with admin parameter to show all rewards including inactive ones
      const rewardsResponse = await fetch('/api/rewards?admin=true')
      const rewardsData = await rewardsResponse.json()
      
      // Fetch purchases using the rewards service
      const purchasesResponse = await fetch('/api/rewards/purchases')
      const purchasesData = await purchasesResponse.json()
      
      // console.log('Rewards response:', rewardsResponse.status, rewardsData)
      // console.log('Purchases response:', purchasesResponse.status, purchasesData)
      
      if (rewardsResponse.ok) {
        let filteredRewards = rewardsData.rewards || rewardsData || []
        if (filterCategory !== "all") {
          filteredRewards = filteredRewards.filter((reward: Reward) => reward.category === filterCategory)
        }
        // console.log('Setting rewards:', filteredRewards)
        setRewards(filteredRewards)
      } else {
        console.error('Rewards API error:', rewardsData.error)
        toast.error('Failed to fetch rewards')
      }
      
      if (purchasesResponse.ok) {
        const purchases = purchasesData.purchases || purchasesData || []
        // console.log('Setting purchases:', purchases)
        // console.log('Sample purchase data:', purchases[0]) // Log first purchase for debugging
        setPurchases(purchases)
      } else {
        console.error('Purchases API error:', purchasesData.error)
        toast.error('Failed to fetch purchases')
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch rewards data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setAddForm({ ...addForm, image_url: "" })
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setUploading(true)
      
      let imageUrl = addForm.image_url
      
      // Upload image if selected
      if (imageFile) {
        try {
          const uploadResult = await uploadFile(imageFile)
          imageUrl = uploadResult.url
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Failed to upload image')
          return
        }
      }
      
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          image_url: imageUrl
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Reward added successfully')
        setShowAddDialog(false)
        setAddForm({ title: "", description: "", price: "", category: "", quantity: "", image_url: "", is_active: true })
        setImageFile(null)
        setImagePreview("")
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to add reward')
      }
    } catch (error) {
      console.error('Error adding reward:', error)
      toast.error('Failed to add reward')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Reward deleted successfully')
        fetchData()
      } else {
        throw new Error('Failed to delete reward')
      }
    } catch (error) {
      console.error('Error deleting reward:', error)
      toast.error('Failed to delete reward')
    }
  }

  const handleToggleActive = async (rewardId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      })
      
      if (response.ok) {
        toast.success(`Reward ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchData()
      } else {
        throw new Error('Failed to update reward status')
      }
    } catch (error) {
      console.error('Error updating reward status:', error)
      toast.error('Failed to update reward status')
    }
  }

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setEditForm({
      title: reward.title,
      description: reward.description || "",
      price: reward.price.toString(),
      category: reward.category,
      quantity: reward.quantity.toString(),
      image_url: reward.image_url || "",
      is_active: reward.is_active
    })
    setImagePreview(reward.image_url || "")
    setShowEditDialog(true)
  }

  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingReward) return
    
    try {
      setUploading(true)
      
      let imageUrl = editForm.image_url
      
      // Upload image if selected
      if (imageFile) {
        try {
          const uploadResult = await uploadFile(imageFile)
          imageUrl = uploadResult.url
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Failed to upload image')
          return
        }
      }
      
      const response = await fetch(`/api/rewards/${editingReward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          image_url: imageUrl
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Reward updated successfully')
        setShowEditDialog(false)
        setEditingReward(null)
        setEditForm({ title: "", description: "", price: "", category: "", quantity: "", image_url: "", is_active: true })
        setImageFile(null)
        setImagePreview("")
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to update reward')
      }
    } catch (error) {
      console.error('Error updating reward:', error)
      toast.error('Failed to update reward')
    } finally {
      setUploading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'merchandise': 'bg-blue-100 text-blue-800',
      'digital': 'bg-green-100 text-green-800',
      'experiences': 'bg-purple-100 text-purple-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const filteredRewards = rewards.filter((reward) =>
    reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdatePurchaseStatus = async (purchaseId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(purchaseId)
      
      const response = await fetch(`/api/rewards/purchases/${purchaseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`)
        setShowStatusDialog(false)
        setStatusForm({ status: "", notes: "" })
        // Refresh data to show updated status
        await fetchData()
      } else {
        if (response.status === 501) {
          toast.error("Status management not yet available. Database migration needs to be applied.")
        } else {
          throw new Error(data.error || 'Failed to update status')
        }
      }
    } catch (error) {
      console.error('Error updating purchase status:', error)
      toast.error('Failed to update purchase status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleShowStatusDialog = (purchase: RewardPurchase) => {
    setSelectedPurchase(purchase)
    setStatusForm({ status: purchase.purchase_status, notes: "" })
    setShowStatusDialog(true)
  }

  const handleShowDetailsDialog = (purchase: RewardPurchase) => {
    setSelectedPurchase(purchase)
    setShowDetailsDialog(true)
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPurchase && statusForm.status) {
      handleUpdatePurchaseStatus(selectedPurchase.id, statusForm.status, statusForm.notes)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rewards Management</h1>
          <p className="text-muted-foreground">Manage rewards catalog and track purchases</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Reward</DialogTitle>
                <DialogDescription>
                  Create a new reward for users to purchase with points
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddReward} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={addForm.title}
                    onChange={(e) => setAddForm({...addForm, title: e.target.value})}
                    placeholder="Reward title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={addForm.description}
                    onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    placeholder="Reward description"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Points)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={addForm.price}
                      onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                      placeholder="Points required"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={addForm.quantity}
                      onChange={(e) => setAddForm({...addForm, quantity: e.target.value})}
                      placeholder="Available quantity"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={addForm.category} onValueChange={(value) => setAddForm({...addForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merchandise">Merchandise</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="experiences">Experiences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={addForm.is_active}
                    onCheckedChange={(checked) => setAddForm({...addForm, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div>
                  <Label htmlFor="image">Reward Image</Label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Label htmlFor="image-upload" className="cursor-pointer text-sm text-gray-600">
                          Click to upload image or drag and drop
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                    {!imagePreview && (
                      <Input
                        value={addForm.image_url}
                        onChange={(e) => setAddForm({...addForm, image_url: e.target.value})}
                        placeholder="Or enter image URL"
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Adding..." : "Add Reward"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Spent</p>
                <p className="text-2xl font-bold">
                  {purchases.reduce((sum, purchase) => sum + purchase.points_spent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="merchandise">Merchandise</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="experiences">Experiences</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Catalog</CardTitle>
          <CardDescription>
            Available rewards for users to purchase with points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading rewards...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            {reward.image_url ? (
                              <img
                                src={reward.image_url}
                                alt={reward.title}
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{reward.title}</div>
                            {reward.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {reward.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(reward.category)}>
                          {reward.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{reward.price} points</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reward.quantity > 0 ? "default" : "destructive"}>
                          {reward.quantity} available
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={reward.is_active}
                            onCheckedChange={() => handleToggleActive(reward.id, reward.is_active)}
                          />
                          <Badge variant={reward.is_active ? "default" : "secondary"}>
                            {reward.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReward(reward)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReward(reward.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Purchases</CardTitle>
          <CardDescription>
            Recent reward purchases by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {purchases.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reward purchases found</p>
                <p className="text-sm">Purchases will appear here once users start buying rewards</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Points Spent</TableHead>
                    <TableHead>Purchased At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={purchase.user_avatar_url} />
                            <AvatarFallback>
                              {purchase.user_name?.charAt(0) || purchase.user_email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{purchase.user_name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">{purchase.user_email}</div>
                            {purchase.user_phone && (
                              <div className="text-xs text-muted-foreground">{purchase.user_phone}</div>
                            )}
                            {purchase.user_avc_id && (
                              <div className="text-xs text-blue-600 font-medium">AVC: {purchase.user_avc_id}</div>
                            )}
                            {purchase.user_address_details?.city && (
                              <div className="text-xs text-muted-foreground">
                                📍 {purchase.user_address_details.city}
                                {purchase.user_address_details.state && `, ${purchase.user_address_details.state}`}
                                {purchase.user_address_details.is_indian && (
                                  <span className="text-blue-600 ml-1">🇮🇳</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{purchase.reward_title || 'Unknown Reward'}</div>
                        {purchase.reward_description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {purchase.reward_description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(purchase.reward_category || '')}>
                          {purchase.reward_category || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{purchase.points_spent} points</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(purchase.purchase_status || 'pending')}>
                          {purchase.purchase_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowDetailsDialog(purchase)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowStatusDialog(purchase)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Status
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Reward Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>
              Update the reward details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateReward} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Reward title"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Reward description"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (Points)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  placeholder="Points required"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                  placeholder="Available quantity"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchandise">Merchandise</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="experiences">Experiences</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked})}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            
            <div>
              <Label htmlFor="edit-image">Image</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded mt-2" />
              )}
              <Input
                type="url"
                placeholder="Or enter image URL"
                value={editForm.image_url}
                onChange={(e) => setEditForm({...editForm, image_url: e.target.value})}
                className="mt-2"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Updating..." : "Update Reward"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Purchase Status</DialogTitle>
            <DialogDescription>
              Update the status for reward purchase by {selectedPurchase?.user_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={statusForm.status} 
                onValueChange={(value) => setStatusForm({...statusForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={statusForm.notes}
                onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
                placeholder="Add notes about this status change..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingStatus === selectedPurchase?.id}>
                {updatingStatus === selectedPurchase?.id ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Detailed information about this reward purchase
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <RewardPurchaseDetails purchase={selectedPurchase} />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
} 