"use client"

import { useState } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, DollarSign, Coins } from "lucide-react"

export function TransactionHistory() {
  const [activeTab, setActiveTab] = useState("all")
  const { transactions, pagination, isLoading, fetchTransactions } = useTransactions()

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchTransactions(
      newPage,
      pagination.limit,
      activeTab === "points" ? "points" : activeTab === "real" ? "real" : undefined,
    )
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchTransactions(1, pagination.limit, value === "points" ? "points" : value === "real" ? "real" : undefined)
  }

  // Format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      case "processing":
        return "bg-blue-500"
      case "refunded":
        return "bg-purple-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your transaction history across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="real">Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderTransactions()}
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            {renderTransactions()}
          </TabsContent>

          <TabsContent value="real" className="space-y-4">
            {renderTransactions()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  function renderTransactions() {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center p-4 border rounded-lg mb-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-6 w-[100px]" />
          </div>
        ))
    }

    if (transactions.length === 0) {
      return <div className="text-center py-8 text-gray-500">No transactions found</div>
    }

    return (
      <>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="mr-4 mt-1">
                {transaction.transaction_type === "points" ? (
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-green-100 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{transaction.reason}</h4>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${transaction.type === "earn" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                      {transaction.transaction_type === "points"
                        ? `${transaction.amount} points`
                        : formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-1 text-sm text-gray-500">
                  <span>{format(new Date(transaction.created_at), "MMM d, yyyy h:mm a")}</span>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>

                {transaction.transaction_type === "real" && transaction.payment_method && (
                  <div className="mt-1 text-sm text-gray-500">
                    Payment Method: {transaction.payment_method}
                    {transaction.reference_id && ` • Ref: ${transaction.reference_id}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }
}
