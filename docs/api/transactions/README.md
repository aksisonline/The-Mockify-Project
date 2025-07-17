# Transactions API Documentation

## Overview

The Transactions API manages financial transactions across the   Mockify platform, including points transactions and real money transactions. It provides comprehensive transaction history, payment processing, and financial management capabilities.

## Base URL

```
/api/transactions
```

## Authentication

All transaction endpoints require user authentication:
- Valid session required
- User can only access their own transactions
- Admin endpoints require admin role

## Endpoints

### 1. Transaction Management

#### Get User Transactions

**Endpoint**: `GET /api/transactions`

**Description**: Retrieve transaction history for the authenticated user.

**Authentication**: Required (User)

**Query Parameters**:
- `transactionType` (optional): Filter by type - "points", "real"
- `type` (optional): Filter by transaction type - "earn", "spend"
- `status` (optional): Filter by status - "pending", "completed", "failed", "processing", "refunded", "cancelled"
- `limit` (optional): Number of transactions (default: 10, max: 100)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "transaction_type": "points",
      "amount": 100,
      "type": "earn",
      "reason": "Profile completion bonus",
      "status": "completed",
      "currency": null,
      "payment_method": null,
      "reference_id": "txn-123456",
      "metadata": {
        "category": "general",
        "action": "profile_created"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "transaction_type": "real",
      "amount": 99.99,
      "type": "spend",
      "reason": "Tool purchase - Video Bandwidth Calculator",
      "status": "completed",
      "currency": "USD",
      "payment_method": "credit_card",
      "reference_id": "pay-789012",
      "metadata": {
        "tool_id": "uuid",
        "tool_name": "Video Bandwidth Calculator"
      },
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Create Transaction

**Endpoint**: `POST /api/transactions`

**Description**: Create a new transaction (points or real money).

**Authentication**: Required (User)

**Request Body**:
```json
{
  "transactionType": "points",
  "amount": 50,
  "type": "earn",
  "reason": "Discussion participation",
  "metadata": {
    "category": "community",
    "action": "discussion_created"
  }
}
```

**Real Money Transaction**:
```json
{
  "transactionType": "real",
  "amount": 29.99,
  "type": "spend",
  "reason": "Tool purchase",
  "currency": "USD",
  "paymentMethod": "credit_card",
  "referenceId": "pay-123456",
  "initialStatus": "initiated",
  "metadata": {
    "tool_id": "uuid",
    "tool_name": "BTU Calculator"
  }
}
```

**Response**:
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "transaction_type": "points",
    "amount": 50,
    "type": "earn",
    "reason": "Discussion participation",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Transaction Details

#### Get Transaction by ID

**Endpoint**: `GET /api/transactions/[id]`

**Description**: Get detailed information about a specific transaction.

**Authentication**: Required (User - Transaction Owner)

**Response**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "transaction_type": "real",
    "amount": 99.99,
    "type": "spend",
    "reason": "Tool purchase - Video Bandwidth Calculator",
    "status": "completed",
    "currency": "USD",
    "payment_method": "credit_card",
    "reference_id": "pay-789012",
    "status_history": [
      {
        "status": "initiated",
        "timestamp": "2024-01-01T12:00:00Z",
        "note": "Transaction initiated"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-01T12:01:00Z",
        "note": "Payment processing"
      },
      {
        "status": "completed",
        "timestamp": "2024-01-01T12:02:00Z",
        "note": "Payment successful"
      }
    ],
    "metadata": {
      "tool_id": "uuid",
      "tool_name": "Video Bandwidth Calculator",
      "purchase_type": "tool"
    },
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:02:00Z"
  }
}
```

### 3. Admin Transaction Management

#### Get All Transactions (Admin)

**Endpoint**: `GET /api/admin/transactions`

**Description**: Get all transactions across all users (admin only).

**Authentication**: Required (Admin)

**Query Parameters**:
- `userId` (optional): Filter by specific user
- `type` (optional): Filter by transaction type - "earn", "spend"
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `minAmount` (optional): Minimum amount filter
- `maxAmount` (optional): Maximum amount filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of transactions (default: 20)

**Response**:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "transaction_type": "points",
      "amount": 100,
      "type": "earn",
      "reason": "Profile completion bonus",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## Data Validation

### Transaction Validation Rules

- **transactionType**: Required, must be "points" or "real"
- **amount**: Required, must be positive number
- **type**: Required, must be "earn" or "spend"
- **reason**: Required, maximum 255 characters
- **currency**: Required for real transactions, valid currency code
- **paymentMethod**: Required for real transactions
- **referenceId**: Optional, unique identifier
- **metadata**: Optional, JSON object

### Points Transaction Rules

- **Spend transactions**: User must have sufficient points
- **Category validation**: Category must exist if specified
- **Status**: Automatically set to "pending" initially
- **Verification**: Points balance updated after completion

### Real Transaction Rules

- **Currency**: Must be valid ISO currency code
- **Payment method**: Must be supported payment method
- **Status history**: Automatically tracked
- **Reference ID**: Auto-generated if not provided

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input data or insufficient points |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Transaction not found |
| `409` | Conflict - Transaction already exists |
| `422` | Unprocessable Entity - Invalid transaction state |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Read operations**: 100 requests per minute per user
- **Create operations**: 10 requests per minute per user
- **Admin operations**: 50 requests per minute per admin

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get user transactions
const getUserTransactions = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/transactions?${params}`, {
    credentials: 'include'
  });
  return response.json();
};

// Create points transaction
const createPointsTransaction = async (transactionData) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      transactionType: 'points',
      ...transactionData
    })
  });
  return response.json();
};

// Create real money transaction
const createRealTransaction = async (transactionData) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      transactionType: 'real',
      ...transactionData
    })
  });
  return response.json();
};

// Get transaction details
const getTransactionDetails = async (transactionId: string) => {
  const response = await fetch(`/api/transactions/${transactionId}`, {
    credentials: 'include'
  });
  return response.json();
};

// Get all transactions (admin)
const getAllTransactions = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/transactions?${params}`, {
    credentials: 'include'
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get user transactions
curl -X GET "https://mockify.vercel.app/api/transactions?transactionType=points&limit=20" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Create points transaction
curl -X POST "https://mockify.vercel.app/api/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "transactionType": "points",
    "amount": 50,
    "type": "earn",
    "reason": "Discussion participation",
    "metadata": {
      "category": "community",
      "action": "discussion_created"
    }
  }'

# Create real money transaction
curl -X POST "https://mockify.vercel.app/api/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "transactionType": "real",
    "amount": 29.99,
    "type": "spend",
    "reason": "Tool purchase",
    "currency": "USD",
    "paymentMethod": "credit_card",
    "referenceId": "pay-123456",
    "metadata": {
      "tool_id": "uuid",
      "tool_name": "BTU Calculator"
    }
  }'

# Get transaction details
curl -X GET "https://mockify.vercel.app/api/transactions/TRANSACTION_ID" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Get all transactions (admin)
curl -X GET "https://mockify.vercel.app/api/admin/transactions?type=earn&limit=50" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Database Schema

### `transactions` Table
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('points', 'real')),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('earn', 'spend')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  currency text,
  payment_method text,
  reference_id text,
  category_id uuid REFERENCES points_categories(id),
  status_history jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);
```

## Features

### Transaction Types
- **Points transactions**: Internal platform currency
- **Real money transactions**: Actual financial transactions
- **Hybrid support**: Both types in unified system

### Transaction Management
- Comprehensive transaction history
- Status tracking and updates
- Metadata and categorization
- Reference ID management

### Payment Processing
- Multiple payment methods
- Currency support
- Status history tracking
- Error handling and recovery

### Admin Features
- Full transaction overview
- User-specific filtering
- Date range filtering
- Amount filtering
- Export capabilities

### Security
- User isolation (users can only see their transactions)
- Admin access control
- Transaction verification
- Audit trail

## Business Logic

### Points Transaction Processing

```typescript
// Check points balance for spend transactions
if (options.type === "spend") {
  const { data: pointsData } = await supabase
    .from("points")
    .select("total_points")
    .eq("user_id", userId)
    .single()

  if (pointsData && pointsData.total_points < options.amount) {
    return {
      success: false,
      error: "Insufficient points",
      errorCode: "INSUFFICIENT_POINTS",
    }
  }
}
```

### Real Transaction Processing

```typescript
// Initialize status history for real transactions
const initialStatus: RealTransactionStatus = realOptions.initialStatus || "initiated"
transactionData.status = initialStatus
transactionData.status_history = [
  {
    status: initialStatus,
    timestamp: new Date().toISOString(),
    note: realOptions.statusNote || `Transaction ${initialStatus}`,
  },
]
```

### Transaction Status Flow

1. **Points Transactions**:
   - `pending` → `completed` (automatic)
   - `pending` → `failed` (on error)

2. **Real Transactions**:
   - `initiated` → `processing` → `completed`
   - `initiated` → `processing` → `failed`
   - `initiated` → `cancelled`
   - `completed` → `refunded`

## Integration with Other APIs

### Points API Integration
- Points balance updates
- Category-based transactions
- Points earning rules
- Balance verification

### Payment API Integration
- Payment method validation
- Payment processing
- Currency conversion
- Payment gateway integration

### User API Integration
- User authentication
- User profile data
- Transaction ownership
- User preferences

### Admin API Integration
- Admin authentication
- Transaction monitoring
- Financial reporting
- User management

## Notes

- All transactions are immutable once created
- Points transactions automatically update user balance
- Real transactions require payment processing
- Status history is maintained for audit purposes
- Metadata allows flexible transaction categorization
- Reference IDs provide external system integration
- Currency support for international transactions
- Payment methods are validated against supported options 