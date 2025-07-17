"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, Package, User, Mail, Calendar, Gift } from "lucide-react"

interface RewardPurchaseDetailsProps {
  purchase: {
    id: string
    reward_title: string
    reward_description?: string
    reward_category: string
    quantity: number
    points_spent: number
    purchased_at: string
    purchase_status: string
    seller_name: string
    seller_email: string
    user_name: string
    user_email: string
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
  }
}

export default function RewardPurchaseDetails({ purchase }: RewardPurchaseDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'processing':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Package className="h-4 w-4" />
      case 'delivered':
        return <Gift className="h-4 w-4" />
      case 'cancelled':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Purchase Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Reward Purchase Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{purchase.reward_title}</h3>
              {purchase.reward_description && (
                <p className="text-gray-600 text-sm mb-3">{purchase.reward_description}</p>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{purchase.reward_category}</Badge>
                <Badge variant="secondary">Qty: {purchase.quantity}</Badge>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {purchase.points_spent} points
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Purchased: {format(new Date(purchase.purchased_at), "PPP")}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Buyer: {purchase.user_name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {purchase.user_email}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Current Status</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(purchase.purchase_status)}
                  <Badge className={getStatusColor(purchase.purchase_status)}>
                    {purchase.purchase_status}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <h4 className="font-semibold mb-1">Buyer Information</h4>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{purchase.user_name}</div>
                  <div>{purchase.user_email}</div>
                  {purchase.user_phone && <div>{purchase.user_phone}</div>}
                  {purchase.user_avc_id && <div className="text-xs text-gray-500">AVC ID: {purchase.user_avc_id}</div>}
                  
                  {purchase.user_address_details && (
                    <div className="mt-2 text-left border-t pt-2">
                      <div className="font-medium text-xs text-gray-700 mb-1">Shipping Address:</div>
                      {purchase.user_address_details.addressline1 && (
                        <div className="text-xs">{purchase.user_address_details.addressline1}</div>
                      )}
                      {purchase.user_address_details.addressline2 && (
                        <div className="text-xs">{purchase.user_address_details.addressline2}</div>
                      )}
                      <div className="text-xs">
                        {[
                          purchase.user_address_details.city,
                          purchase.user_address_details.state,
                          purchase.user_address_details.zip_code
                        ].filter(Boolean).join(', ')}
                      </div>
                      {purchase.user_address_details.country && (
                        <div className="text-xs">{purchase.user_address_details.country}</div>
                      )}
                      {purchase.user_address_details.is_indian && (
                        <div className="text-xs text-blue-600 font-medium">Indian Address</div>
                      )}
                    </div>
                  )}
                  
                  {!purchase.user_address_details && purchase.user_address && (
                    <div className="mt-2 text-left border-t pt-2">
                      <div className="font-medium text-xs text-gray-700 mb-1">Address:</div>
                      <div className="text-xs">{purchase.user_address}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 