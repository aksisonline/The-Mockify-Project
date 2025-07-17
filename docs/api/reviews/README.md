# Reviews API Documentation

## Overview

The Reviews API manages product reviews, brand reviews, and review requests in the   industry. It provides endpoints for users to submit, read, and manage reviews with moderation and rating systems.

## Base URL

```
/api/reviews
```

## Authentication

Most endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Reviews

**Endpoint**: `GET /api/reviews`

**Description**: Fetch reviews with filtering, pagination, and sorting options.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of reviews to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by review type - "product", "brand"
- `product_id` (optional): Filter by product UUID
- `brand_id` (optional): Filter by brand UUID
- `category_id` (optional): Filter by category UUID
- `rating` (optional): Filter by rating (1-5)
- `verified` (optional): Filter verified purchases only (true/false)
- `sort_by` (optional): Sort order - "date", "rating", "helpful" (default: "date")
- `search` (optional): Search term for review content

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "type": "product",
      "product_id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Crestron DM-NVX-350",
        "brand": {
          "id": "uuid",
          "name": "Crestron"
        },
        "category": {
          "id": "uuid",
          "name": "Video Distribution"
        }
      },
      "author_id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "rating": 4,
      "title": "Excellent video distribution solution",
      "content": "This product exceeded my expectations...",
      "pros": ["Easy setup", "Reliable performance"],
      "cons": ["Expensive", "Complex configuration"],
      "verified_purchase": true,
      "helpful_count": 15,
      "not_helpful_count": 2,
      "images": [
        {
          "id": "uuid",
          "url": "https://example.com/review-image.jpg",
          "caption": "Installation setup"
        }
      ],
      "status": "published",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
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

### 2. Create Review

**Endpoint**: `POST /api/reviews`

**Description**: Create a new review for a product or brand.

**Authentication**: Required

**Request Body**:
```json
{
  "type": "product",
  "product_id": "uuid",
  "rating": 4,
  "title": "Excellent video distribution solution",
  "content": "This product exceeded my expectations...",
  "pros": ["Easy setup", "Reliable performance"],
  "cons": ["Expensive", "Complex configuration"],
  "images": [
    {
      "url": "https://example.com/review-image.jpg",
      "caption": "Installation setup"
    }
  ]
}
```

**Response**:
```json
{
  "review": {
    "id": "uuid",
    "type": "product",
    "product_id": "uuid",
    "author_id": "uuid",
    "rating": 4,
    "title": "Excellent video distribution solution",
    "content": "This product exceeded my expectations...",
    "pros": ["Easy setup", "Reliable performance"],
    "cons": ["Expensive", "Complex configuration"],
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Review submitted successfully"
}
```

### 3. Get Single Review

**Endpoint**: `GET /api/reviews/[id]`

**Description**: Fetch a single review with full details.

**Authentication**: Required

**Response**:
```json
{
  "review": {
    "id": "uuid",
    "type": "product",
    "product_id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Crestron DM-NVX-350",
      "brand": {
        "id": "uuid",
        "name": "Crestron"
      },
      "category": {
        "id": "uuid",
        "name": "Video Distribution"
      }
    },
    "author_id": "uuid",
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "rating": 4,
    "title": "Excellent video distribution solution",
    "content": "This product exceeded my expectations...",
    "pros": ["Easy setup", "Reliable performance"],
    "cons": ["Expensive", "Complex configuration"],
    "verified_purchase": true,
    "helpful_count": 15,
    "not_helpful_count": 2,
    "images": [
      {
        "id": "uuid",
        "url": "https://example.com/review-image.jpg",
        "caption": "Installation setup"
      }
    ],
    "status": "published",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "user_vote": "helpful",
  "related_reviews": [
    {
      "id": "uuid",
      "title": "Great alternative option",
      "rating": 5,
      "author": "Jane Smith"
    }
  ]
}
```

### 4. Update Review

**Endpoint**: `PUT /api/reviews/[id]`

**Description**: Update an existing review (author only).

**Authentication**: Required

**Request Body**:
```json
{
  "rating": 5,
  "title": "Updated review title",
  "content": "Updated review content...",
  "pros": ["Updated pros"],
  "cons": ["Updated cons"]
}
```

**Response**:
```json
{
  "review": {
    "id": "uuid",
    "rating": 5,
    "title": "Updated review title",
    "content": "Updated review content...",
    "pros": ["Updated pros"],
    "cons": ["Updated cons"],
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Review updated successfully"
}
```

### 5. Delete Review

**Endpoint**: `DELETE /api/reviews/[id]`

**Description**: Delete a review (author or admin only).

**Authentication**: Required

**Response**:
```json
{
  "message": "Review deleted successfully"
}
```

### 6. Vote on Review

**Endpoint**: `POST /api/reviews/[id]/vote`

**Description**: Vote on whether a review is helpful or not.

**Authentication**: Required

**Request Body**:
```json
{
  "vote": "helpful"
}
```

**Response**:
```json
{
  "helpful_count": 16,
  "not_helpful_count": 2,
  "user_vote": "helpful",
  "message": "Vote recorded successfully"
}
```

## Product Reviews

### 7. Get Product Reviews

**Endpoint**: `GET /api/reviews/products/[productId]`

**Description**: Get all reviews for a specific product.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of reviews (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `rating` (optional): Filter by rating (1-5)
- `sort_by` (optional): Sort order - "date", "rating", "helpful" (default: "date")

**Response**:
```json
{
  "product": {
    "id": "uuid",
    "name": "Crestron DM-NVX-350",
    "brand": {
      "id": "uuid",
      "name": "Crestron"
    },
    "category": {
      "id": "uuid",
      "name": "Video Distribution"
    }
  },
  "reviews": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "rating": 4,
      "title": "Excellent video distribution solution",
      "content": "This product exceeded my expectations...",
      "verified_purchase": true,
      "helpful_count": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "total_reviews": 25,
    "average_rating": 4.2,
    "rating_distribution": {
      "5": 10,
      "4": 8,
      "3": 4,
      "2": 2,
      "1": 1
    }
  },
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Brand Reviews

### 8. Get Brand Reviews

**Endpoint**: `GET /api/reviews/brands/[brandId]`

**Description**: Get all reviews for a specific brand.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of reviews (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `rating` (optional): Filter by rating (1-5)
- `sort_by` (optional): Sort order - "date", "rating", "helpful" (default: "date")

**Response**:
```json
{
  "brand": {
    "id": "uuid",
    "name": "Crestron",
    "logo_url": "https://example.com/logo.png"
  },
  "reviews": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "rating": 4,
      "title": "Reliable brand with great support",
      "content": "Crestron has consistently delivered...",
      "helpful_count": 20,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "total_reviews": 50,
    "average_rating": 4.1,
    "rating_distribution": {
      "5": 20,
      "4": 15,
      "3": 10,
      "2": 3,
      "1": 2
    }
  },
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Review Categories

### 9. Get Review Categories

**Endpoint**: `GET /api/reviews/categories`

**Description**: Get all review categories.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Video Distribution",
      "slug": "video-distribution",
      "description": "Video distribution equipment",
      "icon": "video",
      "color": "#3B82F6",
      "review_count": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Review Requests

### 10. Request Product Review

**Endpoint**: `POST /api/reviews/requests`

**Description**: Request a review for a product that doesn't exist.

**Authentication**: Required

**Request Body**:
```json
{
  "product_name": "New   Product",
  "brand_name": "Unknown Brand",
  "category_id": "uuid",
  "description": "Product description...",
  "reason": "I want to review this product",
  "contact_email": "user@example.com"
}
```

**Response**:
```json
{
  "request": {
    "id": "uuid",
    "user_id": "uuid",
    "product_name": "New   Product",
    "brand_name": "Unknown Brand",
    "category_id": "uuid",
    "description": "Product description...",
    "reason": "I want to review this product",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Review request submitted successfully"
}
```

### 11. Get Review Requests (Admin)

**Endpoint**: `GET /api/reviews/requests`

**Description**: Get all review requests (admin only).

**Authentication**: Required (Admin)

**Query Parameters**:
- `limit` (optional): Number of requests (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status - "pending", "approved", "rejected"

**Response**:
```json
{
  "requests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "product_name": "New   Product",
      "brand_name": "Unknown Brand",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Video Distribution"
      },
      "description": "Product description...",
      "reason": "I want to review this product",
      "status": "pending",
      "admin_notes": "",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### 12. Update Review Request (Admin)

**Endpoint**: `PUT /api/reviews/requests/[id]`

**Description**: Update review request status (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "status": "approved",
  "admin_notes": "Product added to database",
  "product_id": "uuid"
}
```

**Response**:
```json
{
  "request": {
    "id": "uuid",
    "status": "approved",
    "admin_notes": "Product added to database",
    "product_id": "uuid",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Review request updated successfully"
}
```

## Admin Review Management

### 13. Get Reviews for Moderation (Admin)

**Endpoint**: `GET /api/reviews/admin/moderation`

**Description**: Get reviews pending moderation (admin only).

**Authentication**: Required (Admin)

**Query Parameters**:
- `limit` (optional): Number of reviews (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status - "pending", "flagged", "rejected"

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "type": "product",
      "product": {
        "id": "uuid",
        "name": "Crestron DM-NVX-350"
      },
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "rating": 4,
      "title": "Excellent video distribution solution",
      "content": "This product exceeded my expectations...",
      "status": "pending",
      "flags": [],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 14. Moderate Review (Admin)

**Endpoint**: `PUT /api/reviews/admin/[id]/moderate`

**Description**: Moderate a review (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "action": "approve",
  "notes": "Review meets guidelines",
  "moderation_reason": "appropriate_content"
}
```

**Response**:
```json
{
  "review": {
    "id": "uuid",
    "status": "published",
    "moderation_notes": "Review meets guidelines",
    "moderated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Review moderated successfully"
}
```

## Data Validation

### Review Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | string | Yes | "product" or "brand" |
| `product_id` | uuid | Yes (for product reviews) | Valid product UUID |
| `brand_id` | uuid | Yes (for brand reviews) | Valid brand UUID |
| `rating` | integer | Yes | 1-5 |
| `title` | string | Yes | 5-200 characters |
| `content` | string | Yes | 50-2000 characters |
| `pros` | array | No | Array of strings, max 10 items |
| `cons` | array | No | Array of strings, max 10 items |
| `images` | array | No | Array of image objects |

### Review Request Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `product_name` | string | Yes | 2-100 characters |
| `brand_name` | string | Yes | 2-50 characters |
| `category_id` | uuid | Yes | Valid category UUID |
| `description` | string | Yes | 20-500 characters |
| `reason` | string | Yes | 10-200 characters |
| `contact_email` | string | Yes | Valid email format |

## Error Codes

| Code | Description |
|------|-------------|
| `REVIEW_NOT_FOUND` | Review does not exist |
| `PRODUCT_NOT_FOUND` | Product does not exist |
| `BRAND_NOT_FOUND` | Brand does not exist |
| `ALREADY_REVIEWED` | User already reviewed this item |
| `INVALID_RATING` | Rating must be 1-5 |
| `CONTENT_TOO_LONG` | Review content too long |
| `INSUFFICIENT_PERMISSIONS` | Admin permission required |
| `REVIEW_FLAGGED` | Review has been flagged |
| `MODERATION_REQUIRED` | Review requires moderation |

## Rate Limiting

- Review creation: 5 per hour
- Review voting: 20 per hour
- Review requests: 3 per day
- API calls: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get reviews with filtering
const getReviews = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/reviews?${params}`);
  return response.json();
};

// Create new review
const createReview = async (reviewData) => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};

// Vote on review
const voteReview = async (reviewId, voteType) => {
  const response = await fetch(`/api/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote: voteType })
  });
  return response.json();
};

// Get product reviews
const getProductReviews = async (productId, filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/reviews/products/${productId}?${params}`);
  return response.json();
};

// Request product review
const requestProductReview = async (requestData) => {
  const response = await fetch('/api/reviews/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get reviews
curl -X GET "https://your-domain.com/api/reviews?type=product&rating=4" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create review
curl -X POST "https://your-domain.com/api/reviews" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "product",
    "product_id": "product-uuid",
    "rating": 4,
    "title": "Great product!",
    "content": "This product exceeded my expectations..."
  }'

# Vote on review
curl -X POST "https://your-domain.com/api/reviews/review-uuid/vote" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vote": "helpful"}'
```

## Notes

1. **Review Types**: Supports both product and brand reviews with different validation rules.

2. **Moderation System**: All reviews go through moderation before publication.

3. **Voting System**: Users can vote on whether reviews are helpful or not.

4. **Image Support**: Reviews can include images with captions.

5. **Verified Purchases**: Reviews from verified purchases are marked accordingly.

6. **Review Requests**: Users can request reviews for products not in the database.

7. **Admin Tools**: Comprehensive moderation and management tools for admins.

8. **Rating Distribution**: Detailed rating statistics for products and brands. 