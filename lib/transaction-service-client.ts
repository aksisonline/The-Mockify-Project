import type { ToolPurchase } from "@/types/supabase"

// Get user tool purchases via API
export async function getUserToolPurchases(userId: string): Promise<ToolPurchase[]> {
  try {
    const response = await fetch(`/api/transactions/tool-purchases?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch tool purchases')
    }

    const data = await response.json()
    return data.purchases || []
  } catch (error) {
    console.error('Error fetching tool purchases:', error)
    return []
  }
}

// Create transaction via API
export async function createTransaction(options: {
  transactionType: string
  amount: number
  type: 'earn' | 'spend'
  reason: string
  metadata?: any
  categoryId?: string
  userId?: string
}): Promise<{ success: boolean; transaction?: any; error?: string; errorCode?: string }> {
  try {
    const response = await fetch('/api/transactions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error,
        errorCode: data.errorCode
      }
    }

    return {
      success: true,
      transaction: data.transaction
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return {
      success: false,
      error: 'Failed to create transaction'
    }
  }
}

// Get user transactions via API
export async function getUserTransactions(options: {
  limit?: number
  offset?: number
  transactionType?: string
  type?: 'earn' | 'spend'
  status?: string
}): Promise<{ transactions: any[]; count: number }> {
  try {
    const params = new URLSearchParams()
    
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.offset) params.set('offset', options.offset.toString())
    if (options.transactionType) params.set('transactionType', options.transactionType)
    if (options.type) params.set('type', options.type)
    if (options.status) params.set('status', options.status)

    const response = await fetch(`/api/transactions?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }

    const data = await response.json()
    return {
      transactions: data.transactions || [],
      count: data.count || 0
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { transactions: [], count: 0 }
  }
}

// Update real transaction status via API
export async function updateRealTransactionStatus(
  transactionId: string, 
  newStatus: string, 
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/transactions/${transactionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        note
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating transaction status:', error)
    return {
      success: false,
      error: 'Failed to update transaction status'
    }
  }
} 