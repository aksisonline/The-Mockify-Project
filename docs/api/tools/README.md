# Tools API Documentation

## Overview

The Tools API manages   industry tools and utilities that users can purchase and access. It provides endpoints for browsing tools, purchasing access, and managing tool usage with points-based transactions.

## Base URL

```
/api/tools
```

## Authentication

Most endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Tools

**Endpoint**: `GET /api/tools`

**Description**: Fetch available tools with filtering, pagination, and sorting options.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of tools to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `category_id` (optional): Filter by category UUID
- `price_min` (optional): Minimum price filter
- `price_max` (optional): Maximum price filter
- `featured` (optional): Filter featured tools only (true/false)
- `search` (optional): Search term for tool name and description
- `sort_by` (optional): Sort order - "price", "popularity", "date" (default: "popularity")
- `purchased` (optional): Filter by purchase status - "all", "purchased", "not_purchased"

**Response**:
```json
{
  "tools": [
    {
      "id": "uuid",
      "name": "BTU Calculator",
      "description": "Calculate BTU requirements for   equipment cooling",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Calculators",
        "slug": "calculators"
      },
      "price_points": 100,
      "price_usd": 9.99,
      "image_url": "https://example.com/tool-image.jpg",
      "featured": true,
      "popularity_score": 85,
      "rating": 4.5,
      "review_count": 25,
      "usage_count": 150,
      "demo_available": true,
      "demo_url": "https://example.com/demo",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2. Get Single Tool

**Endpoint**: `GET /api/tools/[id]`

**Description**: Fetch a single tool with full details and purchase status.

**Authentication**: Required

**Response**:
```json
{
  "tool": {
    "id": "uuid",
    "name": "BTU Calculator",
    "description": "Calculate BTU requirements for   equipment cooling",
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Calculators",
      "slug": "calculators"
    },
    "price_points": 100,
    "price_usd": 9.99,
    "image_url": "https://example.com/tool-image.jpg",
    "featured": true,
    "popularity_score": 85,
    "rating": 4.5,
    "review_count": 25,
    "usage_count": 150,
    "demo_available": true,
    "demo_url": "https://example.com/demo",
    "features": [
      "Real-time calculations",
      "Multiple equipment types",
      "Export results"
    ],
    "requirements": [
      "Modern web browser",
      "JavaScript enabled"
    ],
    "created_at": "2024-01-01T00:00:00Z"
  },
  "user_purchase": {
    "purchased": true,
    "purchase_date": "2024-01-15T10:30:00Z",
    "access_expires": null,
    "usage_count": 5,
    "last_used": "2024-01-20T14:30:00Z"
  },
  "related_tools": [
    {
      "id": "uuid",
      "name": "Power Calculator",
      "price_points": 75,
      "image_url": "https://example.com/power-calc.jpg"
    }
  ]
}
```

### 3. Purchase Tool

**Endpoint**: `POST /api/tools/[id]/purchase`

**Description**: Purchase access to a tool.

**Authentication**: Required

**Request Body**:
```json
{
  "payment_method": "points",
  "access_duration": "lifetime"
}
```

**Response**:
```json
{
  "purchase": {
    "id": "uuid",
    "tool_id": "uuid",
    "user_id": "uuid",
    "payment_method": "points",
    "points_spent": 100,
    "access_duration": "lifetime",
    "access_expires": null,
    "purchase_date": "2024-01-15T10:30:00Z",
    "status": "completed"
  },
  "user_points": {
    "total_points": 650,
    "total_earned": 750,
    "total_spent": 100
  },
  "message": "Tool purchased successfully"
}
```

### 4. Get My Purchased Tools

**Endpoint**: `GET /api/tools/purchases`

**Description**: Get user's purchased tools.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of tools (default: 10, max: 50)
- `page` (optional): Page number (default: 1)
- `category_id` (optional): Filter by category UUID
- `search` (optional): Search term for tool name

**Response**:
```json
{
  "purchases": [
    {
      "id": "uuid",
      "tool": {
        "id": "uuid",
        "name": "BTU Calculator",
        "description": "Calculate BTU requirements for   equipment cooling",
        "image_url": "https://example.com/tool-image.jpg",
        "category": {
          "id": "uuid",
          "name": "Calculators"
        }
      },
      "purchase_date": "2024-01-15T10:30:00Z",
      "access_expires": null,
      "usage_count": 5,
      "last_used": "2024-01-20T14:30:00Z",
      "points_spent": 100
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "summary": {
    "total_purchases": 25,
    "total_points_spent": 2500,
    "most_used_tool": "BTU Calculator"
  }
}
```

### 5. Record Tool Usage

**Endpoint**: `POST /api/tools/[id]/usage`

**Description**: Record usage of a tool (for analytics).

**Authentication**: Required

**Request Body**:
```json
{
  "session_duration": 300,
  "features_used": ["calculation", "export"],
  "result_count": 5
}
```

**Response**:
```json
{
  "usage": {
    "id": "uuid",
    "tool_id": "uuid",
    "user_id": "uuid",
    "session_duration": 300,
    "features_used": ["calculation", "export"],
    "result_count": 5,
    "usage_date": "2024-01-20T14:30:00Z"
  },
  "message": "Usage recorded successfully"
}
```

## Tool Categories

### 6. Get Tool Categories

**Endpoint**: `GET /api/tools/categories`

**Description**: Get all tool categories.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Calculators",
      "slug": "calculators",
      "description": "Calculation and measurement tools",
      "icon": "calculator",
      "color": "#3B82F6",
      "tool_count": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Tool Analytics

### 7. Get Tool Analytics (Admin)

**Endpoint**: `GET /api/tools/[id]/analytics`

**Description**: Get analytics for a tool (admin only).

**Authentication**: Required (Admin)

**Response**:
```json
{
  "analytics": {
    "overview": {
      "total_purchases": 150,
      "total_revenue_points": 15000,
      "total_revenue_usd": 1498.50,
      "average_rating": 4.5,
      "total_usage_sessions": 500
    },
    "purchases": {
      "daily": [
        {
          "date": "2024-01-01",
          "count": 5,
          "revenue_points": 500
        }
      ],
      "by_payment_method": {
        "points": 120,
        "usd": 30
      }
    },
    "usage": {
      "daily": [
        {
          "date": "2024-01-01",
          "sessions": 25,
          "total_duration": 7500
        }
      ],
      "by_feature": {
        "calculation": 400,
        "export": 200,
        "import": 100
      }
    },
    "user_engagement": {
      "average_session_duration": 250,
      "most_active_users": 10,
      "retention_rate": 75.5
    }
  }
}
```

## Admin Tool Management

### 8. Create Tool (Admin)

**Endpoint**: `POST /api/tools/admin`

**Description**: Create a new tool (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "New Tool",
  "description": "Tool description...",
  "category_id": "uuid",
  "price_points": 100,
  "price_usd": 9.99,
  "features": [
    "Feature 1",
    "Feature 2"
  ],
  "requirements": [
    "Requirement 1"
  ],
  "demo_available": true,
  "demo_url": "https://example.com/demo",
  "featured": false
}
```

**Response**:
```json
{
  "tool": {
    "id": "uuid",
    "name": "New Tool",
    "description": "Tool description...",
    "category_id": "uuid",
    "price_points": 100,
    "price_usd": 9.99,
    "features": [
      "Feature 1",
      "Feature 2"
    ],
    "requirements": [
      "Requirement 1"
    ],
    "demo_available": true,
    "demo_url": "https://example.com/demo",
    "featured": false,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Tool created successfully"
}
```

### 9. Update Tool (Admin)

**Endpoint**: `PUT /api/tools/admin/[id]`

**Description**: Update an existing tool (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "Updated Tool Name",
  "price_points": 150,
  "featured": true
}
```

**Response**:
```json
{
  "tool": {
    "id": "uuid",
    "name": "Updated Tool Name",
    "price_points": 150,
    "featured": true,
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Tool updated successfully"
}
```

### 10. Get All Purchases (Admin)

**Endpoint**: `GET /api/tools/admin/purchases`

**Description**: Get all tool purchases (admin only).

**Authentication**: Required (Admin)

**Query Parameters**:
- `limit` (optional): Number of purchases (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `tool_id` (optional): Filter by tool UUID
- `user_id` (optional): Filter by user UUID
- `payment_method` (optional): Filter by payment method

**Response**:
```json
{
  "purchases": [
    {
      "id": "uuid",
      "tool": {
        "id": "uuid",
        "name": "BTU Calculator"
      },
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "payment_method": "points",
      "points_spent": 100,
      "purchase_date": "2024-01-15T10:30:00Z",
      "access_expires": null,
      "usage_count": 5
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "summary": {
    "total_purchases": 150,
    "total_revenue_points": 15000,
    "total_revenue_usd": 1498.50,
    "payment_method_breakdown": {
      "points": 120,
      "usd": 30
    }
  }
}
```

## Data Validation

### Tool Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 5-100 characters |
| `description` | string | Yes | 20-1000 characters |
| `category_id` | uuid | Yes | Valid category UUID |
| `price_points` | integer | Yes | Positive integer |
| `price_usd` | number | No | Positive number |
| `features` | array | No | Array of strings |
| `requirements` | array | No | Array of strings |
| `demo_available` | boolean | No | Default: false |
| `demo_url` | string | No | Valid URL |
| `featured` | boolean | No | Default: false |

### Purchase Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `payment_method` | string | Yes | "points" or "usd" |
| `access_duration` | string | No | "lifetime", "monthly", "yearly" |

### Usage Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `session_duration` | integer | Yes | Positive integer (seconds) |
| `features_used` | array | No | Array of strings |
| `result_count` | integer | No | Non-negative integer |

## Error Codes

| Code | Description |
|------|-------------|
| `TOOL_NOT_FOUND` | Tool does not exist |
| `TOOL_NOT_PURCHASED` | User hasn't purchased this tool |
| `INSUFFICIENT_POINTS` | User doesn't have enough points |
| `PURCHASE_EXISTS` | User already purchased this tool |
| `ACCESS_EXPIRED` | Tool access has expired |
| `INSUFFICIENT_PERMISSIONS` | Admin permission required |
| `PURCHASE_FAILED` | Purchase processing failed |

## Rate Limiting

- Tool purchases: 10 per hour
- Usage recording: 100 per hour
- API calls: 200 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get tools with filtering
const getTools = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/tools?${params}`);
  return response.json();
};

// Purchase tool
const purchaseTool = async (toolId, purchaseData) => {
  const response = await fetch(`/api/tools/${toolId}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchaseData)
  });
  return response.json();
};

// Get my purchased tools
const getMyPurchasedTools = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/tools/purchases?${params}`);
  return response.json();
};

// Record tool usage
const recordToolUsage = async (toolId, usageData) => {
  const response = await fetch(`/api/tools/${toolId}/usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usageData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get tools
curl -X GET "https://your-domain.com/api/tools?featured=true&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Purchase tool
curl -X POST "https://your-domain.com/api/tools/tool-uuid/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "points",
    "access_duration": "lifetime"
  }'

# Record tool usage
curl -X POST "https://your-domain.com/api/tools/tool-uuid/usage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_duration": 300,
    "features_used": ["calculation", "export"],
    "result_count": 5
  }'
```

## Notes

1. **Points System**: Tools can be purchased using points or USD with flexible pricing.

2. **Access Management**: Tools can have lifetime or time-limited access periods.

3. **Usage Tracking**: Comprehensive usage analytics for tool performance and user engagement.

4. **Demo Support**: Tools can offer demo versions for preview before purchase.

5. **Category Organization**: Tools are organized by categories for easy discovery.

6. **Admin Tools**: Full tool management capabilities for admins including analytics.

7. **Purchase History**: Complete purchase and usage history tracking.

8. **Feature Analytics**: Track which tool features are most popular and useful.
