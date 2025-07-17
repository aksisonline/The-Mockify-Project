# Products API Documentation

## Overview

The Products API manages   products, their details, categories, and related data. It provides endpoints for browsing, searching, and retrieving product information, as well as managing product categories and brands.

## Base URL

```
/api/products
```

## Authentication

Most endpoints are public, but some require authentication (e.g., for admin actions).

## Endpoints

### 1. Get Products

**Endpoint**: `GET /api/products`

**Description**: Fetch products with filtering, pagination, and sorting options.

**Authentication**: Not required

**Query Parameters**:
- `limit` (optional): Number of products to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `category_id` (optional): Filter by category UUID
- `brand_id` (optional): Filter by brand UUID
- `search` (optional): Search term for product name, model, or description
- `sort_by` (optional): Sort order - "name", "popularity", "date" (default: "name")
- `featured` (optional): Filter featured products only (true/false)

**Response**:
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Crestron DM-NVX-350",
      "model": "DM-NVX-350",
      "brand_id": "uuid",
      "brand": {
        "id": "uuid",
        "name": "Crestron",
        "logo_url": "https://example.com/crestron-logo.png"
      },
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Video Distribution",
        "slug": "video-distribution"
      },
      "description": "High-performance   over IP encoder/decoder",
      "image_url": "https://example.com/product-image.jpg",
      "featured": true,
      "review_count": 25,
      "average_rating": 4.2,
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

### 2. Get Single Product

**Endpoint**: `GET /api/products/[id]`

**Description**: Fetch a single product with full details.

**Authentication**: Not required

**Response**:
```json
{
  "product": {
    "id": "uuid",
    "name": "Crestron DM-NVX-350",
    "model": "DM-NVX-350",
    "brand_id": "uuid",
    "brand": {
      "id": "uuid",
      "name": "Crestron",
      "logo_url": "https://example.com/crestron-logo.png"
    },
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Video Distribution",
      "slug": "video-distribution"
    },
    "description": "High-performance   over IP encoder/decoder",
    "image_url": "https://example.com/product-image.jpg",
    "featured": true,
    "review_count": 25,
    "average_rating": 4.2,
    "specifications": {
      "inputs": 2,
      "outputs": 2,
      "resolution": "4K UHD",
      "network": "1GbE"
    },
    "documents": [
      {
        "type": "datasheet",
        "url": "https://example.com/datasheet.pdf"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  },
  "related_products": [
    {
      "id": "uuid",
      "name": "Crestron DM-NVX-351",
      "model": "DM-NVX-351"
    }
  ]
}
```

### 3. Get Product Reviews

**Endpoint**: `GET /api/products/[id]/reviews`

**Description**: Get all reviews for a specific product.

**Authentication**: Not required

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
    "name": "Crestron DM-NVX-350"
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

### 4. Get Product Categories

**Endpoint**: `GET /api/products/categories`

**Description**: Get all product categories.

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
      "product_count": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5. Get Brands

**Endpoint**: `GET /api/products/brands`

**Description**: Get all product brands.

**Authentication**: Not required

**Response**:
```json
{
  "brands": [
    {
      "id": "uuid",
      "name": "Crestron",
      "logo_url": "https://example.com/crestron-logo.png",
      "description": "Leading   manufacturer",
      "product_count": 50,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Data Validation

### Product Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 2-100 characters |
| `model` | string | Yes | 2-50 characters |
| `brand_id` | uuid | Yes | Valid brand UUID |
| `category_id` | uuid | Yes | Valid category UUID |
| `description` | string | Yes | 10-1000 characters |
| `image_url` | string | No | Valid URL |
| `featured` | boolean | No | Default: false |

## Error Codes

| Code | Description |
|------|-------------|
| `PRODUCT_NOT_FOUND` | Product does not exist |
| `CATEGORY_NOT_FOUND` | Category does not exist |
| `BRAND_NOT_FOUND` | Brand does not exist |
| `INVALID_PRODUCT_DATA` | Invalid product data |
| `INSUFFICIENT_PERMISSIONS` | Admin permission required |

## Rate Limiting

- Product queries: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get products with filtering
const getProducts = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/products?${params}`);
  return response.json();
};

// Get product details
const getProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`);
  return response.json();
};

// Get product reviews
const getProductReviews = async (productId, filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/products/${productId}/reviews?${params}`);
  return response.json();
};
```

### cURL Examples

```bash
# Get products
curl -X GET "https://your-domain.com/api/products?category_id=uuid&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get product details
curl -X GET "https://your-domain.com/api/products/product-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. **Product Data**: Products are organized by categories and brands for easy discovery.

2. **Review Integration**: Product endpoints are integrated with the reviews system.

3. **Brand Management**: Brands are managed separately and linked to products.

4. **Category Organization**: Products are organized by categories for better navigation.

5. **Admin Tools**: Admins can manage products, categories, and brands via dedicated endpoints. 