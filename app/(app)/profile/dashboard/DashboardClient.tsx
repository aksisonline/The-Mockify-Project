"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow, format } from "date-fns"
import { ArrowLeft, Clock, ExternalLink, Package, Download, Gift } from "lucide-react"
import DashboardPage from "@/app/(app)/profile/components/dashboardpage"
import ContentWrapper from "@/components/ContentWrapper"
import { generateInvoiceHTML, generateRewardInvoiceHTML } from "@/app/(app)/profile/components/invoiceUtils"
import { getInvoiceHeader, getInvoiceFooter } from "../components/invoiceTemplate"
import dynamic from "next/dynamic"

// @ts-ignore: No types for html2pdf.js
// eslint-disable-next-line

export default function DashboardClient({ profile, points, transactions, purchasedTools, tools }: any) {
  const router = useRouter()
  const [isLoadingTools, setIsLoadingTools] = useState(false)
  const [retry, setRetry] = useState(0)
  const [timedOut, setTimedOut] = useState(false)
  const [pointsTransactionsLimit, setPointsTransactionsLimit] = useState(15)
  const [rewardPurchases, setRewardPurchases] = useState([])
  const [loadingRewards, setLoadingRewards] = useState(true)

  // Loading state for tools (simulate if needed)
  // const [tools, setTools] = useState<ToolMetadata[]>(props.tools || [])
  // If you want to re-fetch tools, you can implement here

  const isPageLoading = isLoadingTools

  // Retry every 2 seconds while loading
  useEffect(() => {
    if (isPageLoading && !timedOut) {
      const timer = setTimeout(() => {
        setRetry(r => r + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isPageLoading, timedOut])

  // Timeout after 10 seconds
  useEffect(() => {
    if (isPageLoading && !timedOut) {
      const timeout = setTimeout(() => setTimedOut(true), 10000)
      return () => clearTimeout(timeout)
    }
  }, [isPageLoading, timedOut])

  // Fetch reward purchases
  useEffect(() => {
    const fetchRewardPurchases = async () => {
      try {
        setLoadingRewards(true)
        const response = await fetch('/api/rewards/purchases')
        if (response.ok) {
          const data = await response.json()
          setRewardPurchases(data.purchases || [])
        }
      } catch (error) {
        console.error('Error fetching reward purchases:', error)
      } finally {
        setLoadingRewards(false)
      }
    }

    fetchRewardPurchases()
  }, [])

  // Filter transactions to only show real transactions
  const filteredRealTransactions = transactions?.filter((tx: any) => tx.transaction_type === "real") || []
  
  // Filter transactions to only show points transactions for the points history section
  const filteredPointsTransactions = transactions?.filter((tx: any) => tx.transaction_type === "points") || []
  
  // Get paginated points transactions
  const paginatedPointsTransactions = filteredPointsTransactions.slice(0, pointsTransactionsLimit)
  
  // Function to load more transactions
  const loadMoreTransactions = () => {
    setPointsTransactionsLimit(prev => prev + 15)
  }

  if (timedOut) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">Loading is taking longer than expected. Please refresh the page or try again later.</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    )
  }

  if (isPageLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const purchasedToolsWithDetails = purchasedTools
    .map((purchase: any) => {
      const toolDetails = tools.find((tool: any) => tool.id === purchase.tool_id)
      return {
        ...purchase,
        details: toolDetails,
      }
    })
    .filter((item: any) => item.details)
    .sort((a: any, b: any) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime())

  // --- Points & Transactions Card ---
  const totalPoints = points?.total_points || 0;
  const totalEarned = points?.total_earned || 0;
  const totalSpent = points?.total_spent || 0;

  // Helper to wait for all images to load in a container
  function waitForImagesToLoad(container: HTMLElement) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if ((img as HTMLImageElement).complete) return Promise.resolve();
      return new Promise(resolve => {
        (img as HTMLImageElement).onload = (img as HTMLImageElement).onerror = resolve;
      });
    });
    return Promise.all(promises);
  }

  async function downloadInvoicePDF(purchase: any) {
    const meta = purchase.metadata || {};
    const invoiceData = {
      order: {
        order_number: meta.order_number || purchase.id,
        created_at: purchase.created_at || meta.order_date || new Date().toISOString(),
        status: purchase.status || meta.status || "Processing",
        shipping_address: meta.shipping_address || meta.address || "",
        payment_method: meta.payment_method || purchase.payment_method || "",
        payment_status: purchase.status || meta.payment_status || "Processing",
        subtotal: meta.subtotal || purchase.amount || 0,
        tax_amount: meta.tax_amount || 0,
        shipping_amount: meta.shipping_amount || 0,
        discount_amount: meta.discount_amount || 0,
        points_used: meta.points_used || 0,
        total_amount: purchase.amount || meta.total_amount || 0,
      },
      buyer: {
        name: meta.buyer_name || purchase.buyer_name || purchase.user_name || profile?.full_name || "",
        email: meta.buyer_email || purchase.buyer_email || purchase.user_email || profile?.email || "",
        phone: meta.buyer_phone || purchase.buyer_phone || profile?.phone_number || "",
      },
      items: (meta.items && Array.isArray(meta.items)) ? meta.items.map((item: any) => ({
        product_name: item.product_name || item.title || item.name || "Product",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price || 0,
        total_price: (item.unit_price || item.price || 0) * (item.quantity || 1),
      })) : [
        {
          product_name: meta.product_name || purchase.reason || meta.order_number || purchase.id || "Product",
          quantity: meta.quantity || 1,
          unit_price: meta.unit_price || purchase.amount || 0,
          total_price: (meta.unit_price || purchase.amount || 0) * (meta.quantity || 1),
        }
      ],
    };
    const html = generateInvoiceHTML(invoiceData);
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
            ${html}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Unable to open print window. Please allow popups for this site.');
    }
  }

  async function downloadRewardInvoicePDF(purchase: any) {
    const invoiceData = {
      order: {
        order_number: `RWD-${purchase.id.slice(0, 8).toUpperCase()}`,
        created_at: purchase.purchased_at || new Date().toISOString(),
        status: purchase.purchase_status || purchase.status || "pending",
        shipping_address: "mockify Rewards Center",
        payment_method: "Points Redemption",
        payment_status: purchase.purchase_status || purchase.status || "pending",
        subtotal: purchase.points_spent,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        points_used: purchase.points_spent,
        total_amount: purchase.points_spent,
      },
      buyer: {
        name: purchase.user_name || profile?.full_name || "",
        email: purchase.user_email || profile?.email || "",
        phone: profile?.phone_number || "",
      },
      seller: {
        name: "MOCKIFY LLP",
        address: "H.No- 362, 12th Main Road, Sector 5, HSR Layout, Bangalore-560102",
        phone: "+91 9966416417",
        email: "hello@mockify.vercel.app",
      },
      items: [
        {
          product_name: purchase.reward_title || "Reward",
          quantity: purchase.quantity || 1,
          unit_price: purchase.points_spent / (purchase.quantity || 1),
          total_price: purchase.points_spent,
        }
      ],
    };
    const html = generateRewardInvoiceHTML(invoiceData);
    // Open a new window and show a Print button
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Reward Invoice</title>
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
            ${html}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Unable to open print window. Please allow popups for this site.');
    }
  }

  // Combine all purchases for the main purchases table
  const allPurchases = [
    // Tool purchases
    ...purchasedToolsWithDetails.map((purchase: any) => ({
      ...purchase,
      type: 'tool',
      displayName: purchase.details?.name,
      date: purchase.purchased_at,
      amount: `${purchase.points_spent} points`,
      status: 'Completed',
      statusClass: 'bg-green-100 text-green-800',
      action: () => router.push(`/tools/${purchase.tool_id}`),
      actionText: 'Open Tool',
      actionIcon: ExternalLink,
    })),
    // Real transactions
    ...filteredRealTransactions.map((purchase: any) => ({
      ...purchase,
      type: 'transaction',
      displayName: purchase.reason || purchase.metadata?.order_number || purchase.id,
      date: purchase.created_at,
      amount: `₹${purchase.amount}`,
      status: purchase.status || "Processing",
      statusClass: purchase.status === "pending" 
        ? "bg-yellow-100 text-yellow-800"
        : purchase.status === "completed"
        ? "bg-green-100 text-green-800"
        : purchase.status === "failed"
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800",
      action: () => downloadInvoicePDF(purchase),
      actionText: 'Invoice',
      actionIcon: Download,
    })),
    // Reward purchases
    ...rewardPurchases.map((purchase: any) => ({
      ...purchase,
      type: 'reward',
      displayName: purchase.reward_title,
      date: purchase.purchased_at,
      amount: `${purchase.points_spent} points`,
      status: purchase.purchase_status || purchase.status || 'pending',
      statusClass: purchase.purchase_status === 'pending' 
        ? 'bg-yellow-100 text-yellow-800'
        : purchase.purchase_status === 'processing'
        ? 'bg-blue-100 text-blue-800'
        : purchase.purchase_status === 'shipped'
        ? 'bg-purple-100 text-purple-800'
        : purchase.purchase_status === 'delivered'
        ? 'bg-green-100 text-green-800'
        : purchase.purchase_status === 'cancelled'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-800',
      action: () => downloadRewardInvoicePDF(purchase),
      actionText: 'Invoice',
      actionIcon: Download,
    }))
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <ContentWrapper>
      <div className="container max-w-5xl py-4">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>

        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Purchases</CardTitle>
            <CardDescription>
              You have {allPurchases.length} purchase{allPurchases.length !== 1 ? "s" : ""} across tools, transactions, and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Item</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Amount</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPurchases.map((purchase: any) => (
                    <tr key={`${purchase.type}-${purchase.id}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {purchase.type === 'tool' && <Package className="h-4 w-4 text-blue-500" />}
                          {purchase.type === 'transaction' && <ExternalLink className="h-4 w-4 text-green-500" />}
                          {purchase.type === 'reward' && <Gift className="h-4 w-4 text-purple-500" />}
                          <span className="capitalize">{purchase.type}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-medium">{purchase.displayName}</div>
                          {purchase.type === 'reward' && purchase.reward_description && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                              {purchase.reward_description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">{purchase.date ? format(new Date(purchase.date), "dd/MM/yyyy") : "-"}</td>
                      <td className="py-2 px-3">{purchase.amount}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${purchase.statusClass}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-32" 
                          onClick={purchase.action}
                        >
                          {purchase.actionText}
                          <purchase.actionIcon className="ml-2 h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Points & Transactions Section */}
        <div className="mb-8 mt-4">
          <h2 className="text-xl font-bold mb-4">Points & Transactions</h2>
          <Card className="mb-6">
            <CardHeader className="pb-2 flex flex-col items-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-xl">
              <div className="flex flex-col items-center w-full">
                <Button className="mb-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-md" size="lg" disabled>
                  <span className="flex items-center gap-2 text-white">
                    Your Points
                  </span>
                </Button>
                <div className="text-5xl font-bold text-white mb-1">{totalPoints}</div>
                <div className="flex gap-8 mt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-200">Total Earned</span>
                    <span className="text-green-300 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      {totalEarned}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-orange-100">Total Spent</span>
                    <span className="text-orange-200 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      {totalSpent}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
              {(!filteredPointsTransactions || filteredPointsTransactions.length === 0) ? (
                <div className="text-center text-gray-400 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>No points transactions yet.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="py-2 px-2 text-left">Date</th>
                        <th className="py-2 px-2 text-left">Type</th>
                        <th className="py-2 px-2 text-left">Amount</th>
                        <th className="py-2 px-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPointsTransactions.map((txn: any) => (
                        <tr key={txn.id} className="border-b last:border-0">
                          <td className="py-2 px-2 whitespace-nowrap">{format(new Date(txn.created_at), "PPP p")}</td>
                          <td className="py-2 px-2">
                            <span className={`font-medium ${txn.type === "earn" ? "text-green-600" : "text-orange-500"}`}>
                              {txn.type === "earn" ? "Earned" : "Spent"}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className={`font-semibold ${txn.type === "earn" ? "text-green-700" : "text-orange-600"}`}>
                              {txn.type === "earn" ? "+" : "-"}{txn.amount}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-gray-700">{txn.reason || txn.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Show More Button */}
              {filteredPointsTransactions.length > pointsTransactionsLimit && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={loadMoreTransactions}
                    className="px-6"
                  >
                    Show More ({filteredPointsTransactions.length - pointsTransactionsLimit} remaining)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DashboardPage />
      </div>
    </ContentWrapper>
  )
} 