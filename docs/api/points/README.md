# Points API Documentation

## Overview

The Points API manages the gamification system in   Mockify, including points earning, spending, transactions, and rewards. Users can earn points through various activities and spend them on rewards and premium features.

## Base URL

```
/api/points
```

## Authentication

All endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get User Points

**Endpoint**: `GET /api/points`

**Description**: Fetch current user's points balance and transaction history.

**Authentication**: Required

**Query Parameters**:
- `transactions` (optional): Include transaction history (true/false, default: false)
- `limit` (optional): Number of transactions to return (default: 10, max: 50)
- `page` (optional): Page number for transactions (default: 1)
- `type` (optional): Filter by transaction type ("earn" or "spend")
- `category` (optional): Filter by points category UUID

**Response**:
```json
{
  "points": {
    "user_id": "uuid",
    "total_points": 150,
    "total_earned": 200,
    "total_spent": 50,
    "last_updated": "2024-01-01T00:00:00Z"
  },
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 10,
      "type": "earn",
      "reason": "Profile completion",
      "status": "completed",
      "metadata": {
        "action": "profile_created",
        "category": "general"
      },
      "reference_id": "profile_123",
      "created_at": "2024-01-01T00:00:00Z"
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

### 2. Create Transaction

**Endpoint**: `POST /api/points`

**Description**: Create a new points transaction (earn or spend).

**Authentication**: Required

**Request Body**:
```json
{
  "type": "earn",
  "amount": 10,
  "reason": "Profile completion",
  "metadata": {
    "action": "profile_created",
    "category": "general"
  },
  "reference_id": "profile_123"
}
```

**Response**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 10,
    "type": "earn",
    "reason": "Profile completion",
    "status": "completed",
    "metadata": {
      "action": "profile_created",
      "category": "general"
    },
    "reference_id": "profile_123",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "points": {
    "user_id": "uuid",
    "total_points": 160,
    "total_earned": 210,
    "total_spent": 50,
    "last_updated": "2024-01-01T00:00:00Z"
  },
  "message": "Points earned successfully"
}
```

### 3. Get Points Categories

**Endpoint**: `GET /api/points/categories`

**Description**: Get all available points categories with user's points in each category.

**Authentication**: Required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "general",
      "display_name": "General Points",
      "description": "General activity points",
      "icon": "star",
      "color": "#3B82F6",
      "is_active": true,
      "user_points": {
        "total_points": 50,
        "total_earned": 60,
        "total_spent": 10
      },
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "community",
      "display_name": "Community Points",
      "description": "Points for community engagement",
      "icon": "users",
      "color": "#10B981",
      "is_active": true,
      "user_points": {
        "total_points": 30,
        "total_earned": 40,
        "total_spent": 10
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. Get Leaderboard

**Endpoint**: `GET /api/points/leaderboard`

**Description**: Get points leaderboard with top users.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of users to return (default: 10, max: 100)
- `category` (optional): Filter by points category UUID
- `period` (optional): Time period - "all", "month", "week" (default: "all")

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "total_points": 500,
      "total_earned": 600,
      "total_spent": 100,
      "category_points": {
        "general": 200,
        "community": 300
      }
    }
  ],
  "user_rank": {
    "rank": 15,
    "total_points": 150,
    "total_earned": 200,
    "total_spent": 50
  },
  "period": "all",
  "last_updated": "2024-01-01T00:00:00Z"
}
```

## Admin Points Endpoints

### 5. Award Points (Admin)

**Endpoint**: `POST /api/points/admin/award`

**Description**: Award points to a user (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "user_id": "uuid",
  "amount": 50,
  "reason": "Special achievement",
  "category_id": "uuid",
  "metadata": {
    "admin_action": "manual_award",
    "notes": "Awarded for exceptional contribution"
  }
}
```

**Response**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 50,
    "type": "earn",
    "reason": "Special achievement",
    "status": "completed",
    "category_id": "uuid",
    "metadata": {
      "admin_action": "manual_award",
      "notes": "Awarded for exceptional contribution"
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Points awarded successfully"
}
```

### 6. Revoke Points (Admin)

**Endpoint**: `POST /api/points/admin/revoke`

**Description**: Revoke points from a user (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "user_id": "uuid",
  "amount": 25,
  "reason": "Points adjustment",
  "category_id": "uuid",
  "metadata": {
    "admin_action": "manual_revoke",
    "notes": "Adjustment for incorrect award"
  }
}
```

**Response**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 25,
    "type": "spend",
    "reason": "Points adjustment",
    "status": "completed",
    "category_id": "uuid",
    "metadata": {
      "admin_action": "manual_revoke",
      "notes": "Adjustment for incorrect award"
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Points revoked successfully"
}
```

### 7. Export Points Data (Admin)

**Endpoint**: `GET /api/points/admin/export`

**Description**: Export points data for analysis (admin only).

**Authentication**: Required (Admin)

**Query Parameters**:
- `format` (optional): Export format - "csv", "json" (default: "csv")
- `start_date` (optional): Start date for data range
- `end_date` (optional): End date for data range
- `category_id` (optional): Filter by category
- `user_id` (optional): Filter by specific user

**Response**:
```json
{
  "export_url": "https://example.com/exports/points_20240101.csv",
  "expires_at": "2024-01-02T00:00:00Z",
  "record_count": 1500,
  "message": "Export generated successfully"
}
```

## Points Categories Management

### 8. Create Points Category (Admin)

**Endpoint**: `POST /api/points/admin/categories`

**Description**: Create a new points category (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "training",
  "display_name": "Training Points",
  "description": "Points earned from training activities",
  "icon": "graduation-cap",
  "color": "#8B5CF6",
  "is_active": true
}
```

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "name": "training",
    "display_name": "Training Points",
    "description": "Points earned from training activities",
    "icon": "graduation-cap",
    "color": "#8B5CF6",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Category created successfully"
}
```

### 9. Update Points Category (Admin)

**Endpoint**: `PUT /api/points/admin/categories/[id]`

**Description**: Update a points category (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "display_name": "Updated Training Points",
  "description": "Updated description",
  "color": "#7C3AED",
  "is_active": true
}
```

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "display_name": "Updated Training Points",
    "description": "Updated description",
    "color": "#7C3AED",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Category updated successfully"
}
```

## Points Rules and Configuration

### 10. Get Points Rules

**Endpoint**: `GET /api/points/rules`

**Description**: Get current points earning rules and rates.

**Authentication**: Required

**Response**:
```json
{
  "rules": [
    {
      "action": "profile_created",
      "points": 10,
      "category": "general",
      "description": "Complete your profile",
      "max_per_day": 1,
      "max_total": 1
    },
    {
      "action": "discussion_created",
      "points": 5,
      "category": "community",
      "description": "Create a discussion",
      "max_per_day": 10,
      "max_total": null
    },
    {
      "action": "comment_added",
      "points": 2,
      "category": "community",
      "description": "Add a comment",
      "max_per_day": 20,
      "max_total": null
    },
    {
      "action": "review_submitted",
      "points": 15,
      "category": "community",
      "description": "Submit a product review",
      "max_per_day": 5,
      "max_total": null
    }
  ],
  "categories": {
    "general": {
      "name": "General Points",
      "description": "Basic activity points"
    },
    "community": {
      "name": "Community Points",
      "description": "Community engagement points"
    }
  }
}
```

## Transaction History

### 11. Get Transaction History

**Endpoint**: `GET /api/points/transactions`

**Description**: Get detailed transaction history with filtering.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of transactions (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `type` (optional): Transaction type - "earn", "spend"
- `category_id` (optional): Filter by category UUID
- `start_date` (optional): Start date for filtering
- `end_date` (optional): End date for filtering
- `status` (optional): Transaction status - "pending", "completed", "failed"

**Response**:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 10,
      "type": "earn",
      "reason": "Profile completion",
      "status": "completed",
      "metadata": {
        "action": "profile_created",
        "category": "general"
      },
      "reference_id": "profile_123",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "general",
        "display_name": "General Points"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "summary": {
    "total_earned": 200,
    "total_spent": 50,
    "net_points": 150
  }
}
```

## Data Validation

### Transaction Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | string | Yes | "earn" or "spend" |
| `amount` | integer | Yes | Positive integer, max 10000 |
| `reason` | string | Yes | 5-200 characters |
| `metadata` | object | No | JSON object |
| `reference_id` | string | No | 1-100 characters |
| `category_id` | uuid | No | Valid category UUID |

### Points Category Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 3-50 characters, lowercase, no spaces |
| `display_name` | string | Yes | 3-100 characters |
| `description` | string | No | 0-500 characters |
| `icon` | string | No | Valid icon name |
| `color` | string | No | Valid hex color code |
| `is_active` | boolean | No | Default: true |

## Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_POINTS` | User doesn't have enough points |
| `INVALID_AMOUNT` | Invalid points amount |
| `INVALID_TRANSACTION_TYPE` | Invalid transaction type |
| `CATEGORY_NOT_FOUND` | Points category not found |
| `USER_NOT_FOUND` | User not found |
| `TRANSACTION_LIMIT_EXCEEDED` | Daily or total limit exceeded |
| `INSUFFICIENT_PERMISSIONS` | Admin permission required |
| `TRANSACTION_FAILED` | Transaction processing failed |

## Rate Limiting

- Points earning: 100 transactions per hour
- Points spending: 50 transactions per hour
- Admin operations: 20 operations per minute
- API calls: 200 per minute

## Points Earning Activities

### Automatic Points Awards

1. **Profile Completion**: 10 points (one-time)
2. **Discussion Creation**: 5 points (up to 10/day)
3. **Comment Addition**: 2 points (up to 20/day)
4. **Review Submission**: 15 points (up to 5/day)
5. **Event Registration**: 5 points (up to 5/day)
6. **Training Completion**: 25 points (per course)
7. **Daily Login**: 1 point (once per day)
8. **Content Moderation**: 3 points (up to 10/day)

### Manual Points Awards (Admin)

- Special achievements
- Contest winners
- Compensation for issues
- Promotional campaigns

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get user points
const getUserPoints = async (includeTransactions = false) => {
  const params = new URLSearchParams({
    transactions: includeTransactions.toString()
  });
  const response = await fetch(`/api/points?${params}`);
  return response.json();
};

// Award points (admin)
const awardPoints = async (userId, amount, reason) => {
  const response = await fetch('/api/points/admin/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      amount: amount,
      reason: reason,
      category_id: 'general-category-uuid'
    })
  });
  return response.json();
};

// Get leaderboard
const getLeaderboard = async (limit = 10, period = 'all') => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    period: period
  });
  const response = await fetch(`/api/points/leaderboard?${params}`);
  return response.json();
};

// Get transaction history
const getTransactions = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/points/transactions?${params}`);
  return response.json();
};
```

### cURL Examples

```bash
# Get user points
curl -X GET "https://your-domain.com/api/points?transactions=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Award points (admin)
curl -X POST "https://your-domain.com/api/points/admin/award" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "amount": 50,
    "reason": "Special achievement",
    "category_id": "category-uuid"
  }'

# Get leaderboard
curl -X GET "https://your-domain.com/api/points/leaderboard?limit=20&period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. **Points Persistence**: Points are permanent and don't expire unless manually revoked.

2. **Transaction Limits**: Daily and total limits prevent abuse of the points system.

3. **Category System**: Points are organized by categories for better tracking and management.

4. **Admin Controls**: Admins can manually award/revoke points and manage categories.

5. **Leaderboard**: Real-time leaderboard shows top users and current user's rank.

6. **Export Functionality**: Admins can export points data for analysis and reporting.

7. **Audit Trail**: All transactions are logged with metadata for transparency.

8. **Rate Limiting**: Prevents spam and abuse of the points system. 