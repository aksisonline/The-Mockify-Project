"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Download,
  Plus,
  Minus,
  MoreHorizontal,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCircle,
  Award,
  User,
  Calendar,
  Upload,
  MessageSquare,
  ShoppingCart,
  Star,
  GraduationCap,
  Users,
  Briefcase,
  Tool
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  getAllTransactions,
  getAllUsers,
  getTransactionStats,
  adminUpdateUserPoints,
  type UserPointsData,
  type TransactionStats,
  fetchAllUsers,
  awardPointsToUser,
} from "@/lib/admin-service"
import type { PointsTransaction } from "@/lib/points-service"
import { revalidatePath } from "next/cache"
import { getPointsCategories } from "@/lib/points-category-service"
import type { PointsCategory } from "@/types/supabase"

// Admin secret key - in a real app, this would be stored securely
const ADMIN_SECRET = "admin-secret-key"

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'earn' | 'spend'
  reason: string
  status: string
  metadata?: any
  created_at: string
  transaction_type: string
  category_id?: string
  user?: {
    full_name: string
    email: string
    avatar_url?: string
  }
  category?: {
    id: string
    name: string
    display_name: string
  }
}

interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

export default function AdminPointsPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showAwardDialog, setShowAwardDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    type: 'all', // 'all', 'current', 'custom'
    startDate: '',
    endDate: '',
    rowCount: 1000
  })
  const [awardForm, setAwardForm] = useState({
    userId: "",
    amount: "",
    reason: "",
    category: ""
  })
  const [awardingPoints, setAwardingPoints] = useState(false)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkUploadCategory, setBulkUploadCategory] = useState("")
  const [bulkUploadReason, setBulkUploadReason] = useState("")
  const [categories, setCategories] = useState<PointsCategory[]>([])

  const itemsPerPage = 10

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when searching
    }, 500) // Increased debounce time to 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    fetchData()
  }, [currentPage, debouncedSearchTerm, filterType, filterCategory])

  const fetchData = async (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
    }

    try {
      setLoading(true)
      setSearchLoading(true)
      
      const params = new URLSearchParams({
        page: resetPage ? '1' : currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        type: filterType,
        category: filterCategory
      })
      
      const response = await fetch(`/api/points/admin?${params.toString()}`)
      const data = await response.json()
      
      // console.log('Points API Response:', data) // Debug log
      
      if (response.ok) {
        setAllTransactions(data.transactions || [])
        setTotalPages(data.totalPages || 1)
        setTotalTransactions(data.total || 0)
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to fetch transactions',
          variant: "destructive",
        })
      }
      
      // Fetch users for award form - maybe only when dialog is opened
      if (users.length === 0) {
        const usersResponse = await fetch('/api/admin/users')
        const usersData = await usersResponse.json()
        if (usersResponse.ok) {
          setUsers(usersData.users || [])
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: 'Failed to fetch points data',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setAwardingPoints(true)
    try {
      const response = await fetch('/api/points/admin/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: awardForm.userId,
          amount: parseInt(awardForm.amount),
          reason: awardForm.reason,
          category: awardForm.category,
          adminKey: ADMIN_SECRET
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: 'Points awarded successfully',
        })
        setShowAwardDialog(false)
        setAwardForm({ 
          userId: "", 
          amount: "", 
          reason: "", 
          category: categories.length > 0 ? categories[0].name : "" 
        })
        fetchData(true) // Refreshes the table to the first page
      } else {
        throw new Error(data.error || 'Failed to award points')
      }
    } catch (error: any) {
      console.error('Error awarding points:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to award points',
        variant: "destructive",
      })
    } finally {
      setAwardingPoints(false)
    }
  }

  const exportTransactions = async () => {
    try {
      setLoading(true)
      
      // Handle current page export locally
      if (exportOptions.type === 'current') {
        const csvContent = [
          ['User', 'Amount', 'Type', 'Category', 'Reason', 'Date'],
          ...allTransactions.map((tx: Transaction) => [
            tx.user?.full_name || tx.user?.email || tx.user_id || 'Unknown User',
            tx.amount,
            tx.type,
            tx.category?.display_name || tx.category?.name || 'General',
            tx.reason,
            new Date(tx.created_at).toLocaleString()
          ])
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `points-transactions-current-page-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: 'Export completed successfully',
        })
        setShowExportDialog(false)
        return
      }
      
      // Handle other export types via API
      const params = new URLSearchParams({
        type: exportOptions.type,
        search: debouncedSearchTerm,
        filterType: filterType,
        filterCategory: filterCategory,
        startDate: exportOptions.startDate,
        endDate: exportOptions.endDate,
        rowCount: exportOptions.rowCount.toString()
      })
      
      const response = await fetch(`/api/points/admin/export?${params.toString()}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `points-transactions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: 'Export completed successfully',
        })
        setShowExportDialog(false)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Export failed')
      }
    } catch (error: any) {
      console.error('Error exporting transactions:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to export transactions',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === 'earn' ? <Award className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4 text-red-500" />
  }

  const getTransactionColor = (type: string) => {
    return type === 'earn' ? 'text-green-600' : 'text-red-600'
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bulkUploadFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      })
      return
    }

    setBulkUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', bulkUploadFile)
      formData.append('category', bulkUploadCategory)
      formData.append('reason', bulkUploadReason)

      const response = await fetch('/api/points/admin/bulk-upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully processed ${data.processed} records. ${data.errors.length} errors.`,
        })
        setShowBulkUploadDialog(false)
        setBulkUploadFile(null)
        setBulkUploadCategory(categories.length > 0 ? categories[0].name : "")
        setBulkUploadReason("")
        fetchData(true)
      } else {
        throw new Error(data.error || 'Failed to process bulk upload')
      }
    } catch (error: any) {
      console.error('Error processing bulk upload:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to process bulk upload',
        variant: "destructive",
      })
    } finally {
      setBulkUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "Email,Points\nuser@example.com,100\nanother@example.com,50"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_points_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    getPointsCategories().then((categories) => {
      setCategories(categories)
      // Set initial category values if categories are available
      if (categories.length > 0) {
        setAwardForm(prev => ({ ...prev, category: categories[0].name }))
        setBulkUploadCategory(categories[0].name)
      }
    })
  }, [])

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Points Management</h1>
          <p className="text-muted-foreground">Manage user points and view transaction history</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Points Transactions</DialogTitle>
                <DialogDescription>
                  Choose what data to export based on your current filters and search.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Export Type</Label>
                  <Select 
                    value={exportOptions.type} 
                    onValueChange={(value) => setExportOptions({...exportOptions, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data (No Limits)</SelectItem>
                      <SelectItem value="current">Current Page Only ({allTransactions.length} rows)</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportOptions.type === 'custom' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={exportOptions.startDate}
                          onChange={(e) => setExportOptions({...exportOptions, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={exportOptions.endDate}
                          onChange={(e) => setExportOptions({...exportOptions, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rowCount">Max Rows</Label>
                      <Input
                        id="rowCount"
                        type="number"
                        min="1"
                        max="100000"
                        value={exportOptions.rowCount}
                        onChange={(e) => setExportOptions({...exportOptions, rowCount: parseInt(e.target.value) || 1000})}
                        placeholder="1000"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum 100,000 rows for performance reasons
                      </p>
                    </div>
                  </>
                )}

                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  <strong>Current Filters:</strong><br />
                  Search: {debouncedSearchTerm || 'None'}<br />
                  Type: {filterType === 'all' ? 'All Types' : filterType}<br />
                  Category: {filterCategory === 'all' ? 'All Categories' : filterCategory}
                  {exportOptions.type === 'custom' && (
                    <>
                      <br />Date Range: {exportOptions.startDate || 'No start'} to {exportOptions.endDate || 'No end'}
                      <br />Max Rows: {exportOptions.rowCount.toLocaleString()}
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={exportTransactions} disabled={loading || (
                  exportOptions.type === 'custom' && 
                  exportOptions.startDate && 
                  exportOptions.endDate && 
                  exportOptions.startDate > exportOptions.endDate
                )}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    'Export Data'
                  )}
                </Button>
                {exportOptions.type === 'custom' && 
                 exportOptions.startDate && 
                 exportOptions.endDate && 
                 exportOptions.startDate > exportOptions.endDate && (
                  <p className="text-xs text-red-500 mt-2">
                    Start date cannot be after end date
                  </p>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Award Points
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Award Points to User</DialogTitle>
                <DialogDescription>
                  Award points to a specific user for their contributions or achievements.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAwardPoints} className="space-y-4">
                <div>
                  <Label htmlFor="userId">User</Label>
                  <Select value={awardForm.userId} onValueChange={(value) => setAwardForm({...awardForm, userId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.full_name || user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Points Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={awardForm.amount}
                    onChange={(e) => setAwardForm({...awardForm, amount: e.target.value})}
                    placeholder="Enter points amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={awardForm.category} onValueChange={(value) => setAwardForm({...awardForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={awardForm.reason}
                    onChange={(e) => setAwardForm({...awardForm, reason: e.target.value})}
                    placeholder="Reason for awarding points"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAwardDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={awardingPoints}>
                    {awardingPoints ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Awarding Points...
                      </>
                    ) : (
                      'Award Points'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setShowBulkUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
                {searchTerm !== debouncedSearchTerm && searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            <Select value={filterType} onValueChange={(value) => {
              setFilterType(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="earn">Earned</SelectItem>
                <SelectItem value="spend">Spent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={(value) => {
              setFilterCategory(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                setSearchTerm("")
                setDebouncedSearchTerm("")
                setFilterType("all")
                setFilterCategory("all")
                setCurrentPage(1)
              }} 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Points Transactions</CardTitle>
              <CardDescription>
                Showing {totalTransactions > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
              </CardDescription>
            </div>
            {/* Pagination */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              {totalPages > 1 ? (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {(() => {
                      const items = [];
                      const pageWindow = 2; // Show 2 pages before and after current page, plus first and last.

                      // First page
                      if (totalPages > 0) {
                        items.push(
                          <PaginationItem key={1}>
                            <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1} className="cursor-pointer">
                              1
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Ellipsis after first
                      if (currentPage > pageWindow + 1) {
                        items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
                      }

                      // Pages in between
                      const startPage = Math.max(2, currentPage - pageWindow + 1);
                      const endPage = Math.min(totalPages - 1, currentPage + pageWindow - 1);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        if ((currentPage < pageWindow + 1 && i > pageWindow * 2) || (currentPage > totalPages - pageWindow && i < totalPages - pageWindow * 2 + 1)) {
                          continue;
                        }
                          items.push(
                            <PaginationItem key={i}>
                              <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i} className="cursor-pointer">
                                {i}
                              </PaginationLink>
                            </PaginationItem>
                          );
                      }
                      
                      // Ellipsis before last
                      if (currentPage < totalPages - pageWindow) {
                         items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
                      }

                      // Last page
                      if (totalPages > 1) {
                        items.push(
                          <PaginationItem key={totalPages}>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages} className="cursor-pointer">
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // This is a bit of a hack to remove duplicate page numbers that can appear with this logic
                      const uniqueItems = [];
                      const seenKeys = new Set();
                      for(const item of items) {
                        if(!seenKeys.has(item.key)) {
                          uniqueItems.push(item);
                          seenKeys.add(item.key);
                        }
                      }

                      return uniqueItems;
                    })()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading transactions...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.length > 0 ? (
                      allTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={transaction.user?.avatar_url} />
                                <AvatarFallback>
                                  {transaction.user?.full_name?.charAt(0) || transaction.user?.email?.charAt(0) || <User className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{transaction.user?.full_name || 'Unknown User'}</div>
                                <div className="text-sm text-muted-foreground">{transaction.user?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'earn' ? 'default' : 'secondary'}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.category?.display_name || transaction.category?.name || 'General'}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {transaction.reason}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Points Upload</DialogTitle>
            <DialogDescription>
              Upload a CSV file to award points to multiple users. Download the template first.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Download Template</Label>
              <Button type="button" variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-file">CSV File</Label>
              <Input
                id="bulk-file"
                type="file"
                accept=".csv"
                onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-category">Category</Label>
              <Select value={bulkUploadCategory} onValueChange={setBulkUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-reason">Reason</Label>
              <Input
                id="bulk-reason"
                value={bulkUploadReason}
                onChange={(e) => setBulkUploadReason(e.target.value)}
                placeholder="Reason for awarding points"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBulkUploadDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkUploading}>
                {bulkUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upload & Process'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
