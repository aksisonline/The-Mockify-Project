import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"]

export default function EkartOrdersManagementCard() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    // Fetch products posted by the current user, including their orders
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch("/api/ekart/seller-orders")
        const data = await res.json()
        setProducts(data.products || [])
      } catch (e) {
        toast({ title: "Error", description: "Failed to load your products/orders", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch("/api/ekart/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          status: newStatus,
          updateTransaction: newStatus === "delivered" || newStatus === "cancelled"
        }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast({ title: "Order status updated" })
      // Refresh the data to show updated status
      window.location.reload()
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update status", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Manage Your Product Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : products.length === 0 ? (
          <div>You have not posted any products yet.</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="mb-8">
              <div className="font-semibold mb-2">{product.title}</div>
              {product.orders && product.orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.buyer_name || order.user_id}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                            disabled={updating === order.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-gray-500">No orders for this product yet.</div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 