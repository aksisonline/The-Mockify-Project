# Rewards API Documentation

## Overview

The Rewards API manages the points-based rewards system for the   Mockify platform. It allows users to redeem their earned points for various rewards including merchandise, digital products, and experiences.

## Base URL

```
/api/rewards
```

## Authentication

- **Read operations**: Not required (public rewards catalog)
- **Purchase operations**: Required (User authentication)
- **Admin operations**: Required (Admin role)

## Endpoints

### 1. Rewards Management

#### Get All Rewards

**Endpoint**: `GET /api/rewards`

**Description**: Retrieve all available rewards with filtering options.

**Authentication**: Not required

**Query Parameters**:
- `category` (optional): Filter by category - "merchandise", "digital", "experiences"
- `featured` (optional): Filter featured rewards only
- `limit` (optional): Number of rewards (default: 20)
- `offset` (optional): Offset for pagination
- `admin` (optional): Show all rewards including inactive (admin only)

**Response**:
```json
{
  "rewards": [
    {
      "id": "uuid",
      "title": "  Mockify T-Shirt",
      "description": "Premium cotton t-shirt with   Mockify logo",
      "price": 500,
      "category": "merchandise",
      "image_url": "https://example.com/tshirt.jpg",
      "is_active": true,
      "is_featured": true,
      "quantity": 50,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 25,
  "success": true
}
```

#### Get Reward by ID

**Endpoint**: `GET /api/rewards/[id]`

**Description**: Get detailed information about a specific reward.

**Authentication**: Not required

**Response**:
```json
{
  "reward": {
    "id": "uuid",
    "title": "  Mockify T-Shirt",
    "description": "Premium cotton t-shirt with   Mockify logo",
    "price": 500,
    "category": "merchandise",
    "image_url": "https://example.com/tshirt.jpg",
    "is_active": true,
    "is_featured": true,
    "quantity": 50,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Purchase Reward

**Endpoint**: `POST /api/rewards/[id]/purchase`

**Description**: Purchase a reward using points.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "quantity": 1
}
```

**Response**:
```json
{
  "success": true,
  "purchase": {
    "id": "uuid",
    "user_id": "uuid",
    "reward_id": "uuid",
    "quantity": 1,
    "points_spent": 500,
    "transaction_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "remaining_points": 1250
}
```

### 2. Rewards Dashboard

#### Get Rewards Dashboard

**Endpoint**: `GET /api/rewards/dashboard`

**Description**: Get comprehensive rewards data including user-specific information.

**Authentication**: Not required (enhanced data for authenticated users)

**Response**:
```json
{
  "rewards": [...],
  "featuredRewards": [...],
  "count": 25,
  "userPoints": 1750,
  "purchasedRewards": [...],
  "success": true
}
```

## Data Validation

### Reward Validation Rules

- **title**: Required, maximum 255 characters
- **description**: Required, maximum 1000 characters
- **price**: Required, must be positive integer
- **category**: Required, must be "merchandise", "digital", or "experiences"
- **image_url**: Required, valid URL format
- **is_active**: Boolean, defaults to true
- **is_featured**: Boolean, defaults to false
- **quantity**: Optional, must be positive integer or null (unlimited)

### Purchase Validation Rules

- **quantity**: Required, must be positive integer, minimum 1
- **User points**: Must have sufficient points for purchase
- **Reward availability**: Reward must be active and have sufficient quantity

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input data or insufficient points |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Admin access required |
| `404` | Not Found - Reward not found |
| `409` | Conflict - Insufficient quantity available |
| `500` | Internal Server Error - Server error |

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get all rewards
const getRewards = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/rewards?${params}`);
  return response.json();
};

// Purchase a reward
const purchaseReward = async (rewardId: string, quantity: number = 1) => {
  const response = await fetch(`/api/rewards/${rewardId}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quantity })
  });
  return response.json();
};

// Get rewards dashboard
const getRewardsDashboard = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/rewards/dashboard?${params}`, {
    credentials: 'include'
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get all rewards
curl -X GET "https://mockify.vercel.app/api/rewards?category=merchandise&featured=true"

# Purchase a reward
curl -X POST "https://mockify.vercel.app/api/rewards/REWARD_ID/purchase" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"quantity": 1}'

# Get rewards dashboard
curl -X GET "https://mockify.vercel.app/api/rewards/dashboard?featured=true" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Database Schema

### `rewards` Table
```sql
CREATE TABLE rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  category text NOT NULL CHECK (category IN ('merchandise', 'digital', 'experiences')),
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  quantity integer CHECK (quantity > 0 OR quantity IS NULL),
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `reward_purchases` Table
```sql
CREATE TABLE reward_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  points_spent integer NOT NULL CHECK (points_spent > 0),
  transaction_id uuid REFERENCES transactions(id),
  created_at timestamp with time zone DEFAULT now()
);
```

## Features

### Reward Management
- Comprehensive reward catalog
- Category-based organization
- Featured rewards highlighting
- Quantity management
- Admin CRUD operations

### Purchase System
- Points-based redemption
- Quantity validation
- Transaction integration
- Purchase history tracking
- Balance verification

### User Experience
- Dashboard with personalized data
- Featured rewards display
- Purchase history
- Points balance integration
- Category filtering

## Business Logic

### Purchase Process

1. **Reward Validation**: Check if reward exists and is active
2. **Quantity Check**: Verify sufficient quantity available
3. **Points Verification**: Check user has enough points
4. **Transaction Creation**: Create points spend transaction
5. **Purchase Record**: Create reward purchase record
6. **Quantity Update**: Update reward inventory

### Points Integration

- Points balance verification
- Transaction creation
- Balance updates
- Points earning rules

## Integration with Other APIs

### Points API Integration
- Points balance verification
- Transaction creation
- Balance updates

### Transactions API Integration
- Purchase transaction creation
- Transaction status tracking
- Payment processing

### User API Integration
- User authentication
- Purchase history
- Points balance

## Notes

- Rewards are automatically filtered by active status for public access
- Purchase operations require sufficient points balance
- Quantity is automatically decremented on purchase
- Digital rewards may have different fulfillment processes
- Featured rewards are highlighted in the dashboard
- All purchases create corresponding points transactions
- Purchase history is maintained for user reference 