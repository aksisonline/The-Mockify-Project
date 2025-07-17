"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, User, Phone, Mail, MapPin, Download, Archive, Clock, Search, Loader2 } from "lucide-react"
import { generateInvoiceHTML } from "./invoiceUtils"
import Link from "next/link"

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceBuyer {
  name: string;
  email: string;
  phone: string;
}

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  status: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  points_used: number;
  total_amount: number;
}

interface InvoiceData {
  order: InvoiceOrder;
  buyer: InvoiceBuyer;
  items: InvoiceItem[];
}

export default function EkartOrdersManagementCard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/ekart/seller/orders")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load orders")
      }

      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search term
  const filterOrders = useCallback((ordersToFilter: any[]) => {
    if (!debouncedSearch.trim()) {
      return ordersToFilter
    }

    const searchTerm = debouncedSearch.toLowerCase().trim()
    
    return ordersToFilter.filter(order => {
      // Search in buyer name
      const buyerName = order.buyer?.name?.toLowerCase() || ""
      if (buyerName.includes(searchTerm)) {
        return true
      }

      // Search in product names
      const productNames = order.items?.map((item: any) => 
        item.product?.title?.toLowerCase() || ""
      ) || []
      
      return productNames.some((productName: string) => 
        productName.includes(searchTerm)
      )
    })
  }, [debouncedSearch])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      const response = await fetch("/api/ekart/seller/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderId, 
          status: newStatus,
          updateTransaction: newStatus === "delivered" || newStatus === "cancelled" // Add flag for both delivered and cancelled
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to update order status")
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast.success("Order status updated")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500"
      case "processing": return "bg-blue-500"
      case "shipped": return "bg-purple-500"
      case "delivered": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const generateInvoice = (order: any) => {
    // console.log("Original order data:", order);
    
    // Format the order data for invoice generation
    const invoiceData: InvoiceData = {
      order: {
        order_number: order.order_number,
        created_at: order.created_at,
        status: order.status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        subtotal: order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        tax_amount: 0, // Add if available in your schema
        shipping_amount: 0, // Add if available in your schema
        discount_amount: 0, // Add if available in your schema
        points_used: 0, // Add if available in your schema
        total_amount: order.total_amount
      },
      buyer: {
        name: order.buyer?.name || "Unknown",
        email: order.buyer?.email || "",
        phone: order.buyer?.phone || ""
      },
      items: order.items.map((item: any) => ({
        product_name: item.product?.title || "Unknown Product",
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))
    };

    // console.log("Formatted invoice data:", invoiceData);

    // Generate the invoice HTML
    const invoiceHTML = generateInvoiceHTML(invoiceData);

    // Open a new window and show a Print button
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              .print-btn {
                display: block;
                margin: 24px auto 16px auto;
                padding: 12px 32px;
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: background 0.2s;
              }
              .print-btn:hover {
                background: #1d4ed8;
              }
              @media print {
                .print-btn { display: none !important; }
              }
            </style>
          </head>
          <body>
            <button class="print-btn" onclick="window.print()">Print Invoice</button>
            ${invoiceHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Unable to open print window. Please allow popups for this site.');
    }
  }

  // Separate orders into active and archived
  const activeOrders = orders.filter(order => 
    order.status !== "delivered" && order.status !== "cancelled"
  )
  const archivedOrders = orders.filter(order => 
    order.status === "delivered" || order.status === "cancelled"
  )

  // Apply search filter to both active and archived orders
  const filteredActiveOrders = filterOrders(activeOrders)
  const filteredArchivedOrders = filterOrders(archivedOrders)

  const renderOrderCard = (order: any) => (
    <div key={order.id} className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="font-medium">Order #{order.order_number}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateInvoice(order)}
          >
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-md overflow-hidden">
              <img
                src={item.product.image_url}
                alt={item.product.title}
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{item.product.title}</div>
              <div className="text-sm text-muted-foreground">
                {item.quantity} × ₹{item.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-4">
        {/* Buyer Information */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={order.buyer.avatar_url || undefined} alt={order.buyer.name || "Buyer"} />
            <AvatarFallback>
              {order.buyer.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {order.buyer.id ? (
                <Link 
                  href={`/${order.buyer.id}`}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  {order.buyer.name || "Unknown Buyer"}
                </Link>
              ) : (
                order.buyer.name || "Unknown Buyer"
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{order.buyer.email || "No email provided"}</span>
            </div>
            {order.buyer.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{order.buyer.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-2">
          <div className="font-medium">Shipping Information</div>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>{order.shipping_address || "No shipping address provided"}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-2">
          <div className="font-medium">Payment Information</div>
          <div className="text-sm text-muted-foreground">
            <div>Method: {order.payment_method || "Not specified"}</div>
            <div>Total Amount: ₹{order.total_amount}</div>
          </div>
        </div>

        {/* Order Actions - Only show for active orders */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="flex justify-between items-center">
            <div className="font-medium">
              Total: ₹{order.total_amount}
            </div>
            <Select
              value={order.status}
              onValueChange={(value) => updateOrderStatus(order.id, value)}
              disabled={updatingStatus === order.id}
            >
              <SelectTrigger className="w-[220px]">
                {updatingStatus === order.id ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Notification...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Update status" />
                )}
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Show total for archived orders without status update */}
        {(order.status === "delivered" || order.status === "cancelled") && (
          <div className="flex justify-between items-center">
            <div className="font-medium">
              Total: ₹{order.total_amount}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.status === "delivered" ? "Order completed" : "Order cancelled"}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle>My Orders</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or buyer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active ({filteredActiveOrders.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived ({filteredArchivedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-6 mt-6">
            {filteredActiveOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {debouncedSearch.trim() ? "No active orders match your search" : "No active orders"}
                </p>
                <p className="text-sm">
                  {debouncedSearch.trim() 
                    ? "Try adjusting your search terms" 
                    : "Orders will appear here when they are pending, processing, or shipped"
                  }
                </p>
              </div>
            ) : (
              filteredActiveOrders.map(renderOrderCard)
            )}
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-6 mt-6">
            {filteredArchivedOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {debouncedSearch.trim() ? "No archived orders match your search" : "No archived orders"}
                </p>
                <p className="text-sm">
                  {debouncedSearch.trim() 
                    ? "Try adjusting your search terms" 
                    : "Delivered and cancelled orders will appear here"
                  }
                </p>
              </div>
            ) : (
              filteredArchivedOrders.map(renderOrderCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 