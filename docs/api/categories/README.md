# Categories API Documentation

## Overview

The Categories API provides category management functionality for various content types in the   Mockify platform, including job categories, product categories, review categories, and discussion categories.

## Base URL

```
/api/categories
```

## Authentication

Most category endpoints do not require authentication for reading, but admin operations require authentication and appropriate permissions.

## Endpoints

### 1. General Categories

#### Get All Categories

**Endpoint**: `GET /api/categories`

**Description**: Get all available categories for jobs.

**Authentication**: Not required

**Response**:
```json
[
  {
    "id": "all",
    "name": "All",
    "icon": "bi-briefcase",
    "count": 6
  },
  {
    "id": " -engineer",
    "name": "  Engineer",
    "icon": "bi-tools",
    "count": 2
  },
  {
    "id": " -designer",
    "name": "  Designer",
    "icon": "bi-palette",
    "count": 1
  }
]
```

### 2. Job Categories

#### Get Job Categories with Counts

**Endpoint**: `GET /api/jobs/categories`

**Description**: Get job categories with accurate job counts from the database.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "all",
      "name": "All",
      "icon": "bi-briefcase",
      "count": 25
    },
    {
      "id": " -engineer",
      "name": "  Engineer",
      "icon": "bi-tools",
      "count": 8
    },
    {
      "id": " -designer",
      "name": "  Designer",
      "icon": "bi-palette",
      "count": 5
    }
  ],
  "jobTypes": [
    {
      "id": "full-time",
      "name": "Full Time",
      "count": 15
    },
    {
      "id": "part-time",
      "name": "Part Time",
      "count": 5
    },
    {
      "id": "contract",
      "name": "Contract",
      "count": 5
    }
  ],
  "experienceLevels": [
    {
      "id": "entry",
      "name": "Entry Level",
      "count": 8
    },
    {
      "id": "mid",
      "name": "Mid Level",
      "count": 12
    },
    {
      "id": "senior",
      "name": "Senior Level",
      "count": 5
    }
  ],
  "totalJobs": 25,
  "categoryCounts": {
    " -engineer": 8,
    " -designer": 5,
    "cad-engineer": 3,
    "pre-sales": 4,
    " -support": 2,
    " -events": 2,
    " -project": 1
  }
}
```

### 3. Product Categories

#### Get Product Categories

**Endpoint**: `GET /api/products/categories`

**Description**: Get all product categories for the e-commerce platform.

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "categories": [
    {
      "id": "all",
      "name": "All",
      "icon": "ShoppingBag",
      "description": "All products",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Video Distribution",
      "icon": "Video",
      "description": "Video distribution and switching equipment",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Audio Systems",
      "icon": "Volume2",
      "description": "Professional audio equipment and systems",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. Review Categories

#### Get Review Categories

**Endpoint**: `GET /api/reviews/categories`

**Description**: Get all review categories for products and brands.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Audio Equipment",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Video Systems",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Control Systems",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Review Category (Admin)

**Endpoint**: `POST /api/admin/reviews/categories`

**Description**: Create a new review category (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "Lighting Systems"
}
```

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "name": "Lighting Systems",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Discussion Categories

#### Get Discussion Categories

**Endpoint**: `GET /api/discussions/categories`

**Description**: Get all discussion categories for the forum.

**Authentication**: Not required

**Response**:
```json
[
  {
    "id": "general",
    "name": "General Discussion",
    "description": "General   industry discussions",
    "icon": "MessageCircle",
    "color": "blue",
    "post_count": 25
  },
  {
    "id": "technical",
    "name": "Technical Support",
    "description": "Technical questions and support",
    "icon": "Wrench",
    "color": "green",
    "post_count": 15
  },
  {
    "id": "projects",
    "name": "Project Showcase",
    "description": "Showcase your   projects",
    "icon": "Image",
    "color": "purple",
    "post_count": 8
  }
]
```

## Data Validation

### Category Validation Rules

- **name**: Required, maximum 100 characters, unique within type
- **description**: Optional, maximum 500 characters
- **icon**: Optional, valid icon identifier
- **color**: Optional, valid color identifier
- **is_active**: Boolean, defaults to true

### Job Category Validation Rules

- **id**: Must be one of predefined job category IDs
- **count**: Automatically calculated from database
- **icon**: Bootstrap icon class name

### Product Category Validation Rules

- **name**: Required, unique within product categories
- **description**: Optional, maximum 255 characters
- **is_active**: Boolean, controls visibility

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Admin access required |
| `404` | Not Found - Category not found |
| `409` | Conflict - Category name already exists |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Read operations**: 100 requests per minute
- **Admin operations**: 20 requests per minute per admin
- **Category creation**: 10 requests per minute per admin

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get job categories
const getJobCategories = async () => {
  const response = await fetch('/api/jobs/categories');
  return response.json();
};

// Get product categories
const getProductCategories = async () => {
  const response = await fetch('/api/products/categories');
  return response.json();
};

// Get review categories
const getReviewCategories = async () => {
  const response = await fetch('/api/reviews/categories');
  return response.json();
};

// Get discussion categories
const getDiscussionCategories = async () => {
  const response = await fetch('/api/discussions/categories');
  return response.json();
};

// Create review category (admin)
const createReviewCategory = async (name: string) => {
  const response = await fetch('/api/admin/reviews/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name })
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get job categories
curl -X GET "https://mockify.vercel.app/api/jobs/categories"

# Get product categories
curl -X GET "https://mockify.vercel.app/api/products/categories"

# Get review categories
curl -X GET "https://mockify.vercel.app/api/reviews/categories"

# Get discussion categories
curl -X GET "https://mockify.vercel.app/api/discussions/categories"

# Create review category (admin)
curl -X POST "https://mockify.vercel.app/api/admin/reviews/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"name": "Lighting Systems"}'
```

## Database Schema

### Job Categories (Static Data)
```typescript
export const jobCategories: JobCategory[] = [
  { id: "all", name: "All", icon: "bi-briefcase", count: 0 },
  { id: " -engineer", name: "  Engineer", icon: "bi-tools", count: 0 },
  { id: " -designer", name: "  Designer", icon: "bi-palette", count: 0 },
  { id: "cad-engineer", name: "CAD Engineer", icon: "bi-layers", count: 0 },
  { id: "pre-sales", name: "Pre-Sales", icon: "bi-graph-up", count: 0 },
  { id: " -support", name: "  Support", icon: "bi-headset", count: 0 },
  { id: " -events", name: "  Events", icon: "bi-calendar-event", count: 0 },
  { id: " -project", name: "  Project", icon: "bi-kanban", count: 0 },
  { id: "top", name: "Top", icon: "bi-trophy", count: 0 }
]
```

### Product Categories Table
```sql
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Review Categories Table
```sql
CREATE TABLE review_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## Features

### Category Management
- Hierarchical category structure
- Dynamic count calculation
- Category filtering and search
- Admin category creation

### Job Categories
- Predefined job categories
- Real-time job count updates
- Category-based job filtering
- Icon and visual representation

### Product Categories
- Flexible product categorization
- Active/inactive status control
- Category-based product browsing
- Icon and description support

### Review Categories
- Product and brand categorization
- Admin-managed categories
- Category-based review filtering
- Simple name-based structure

### Discussion Categories
- Forum-style categorization
- Color-coded categories
- Post count tracking
- Icon and description support

## Business Logic

### Category Count Calculation

1. **Job Categories**:
   ```typescript
   // Get counts for each category
   const { data: categoryCounts } = await supabase
     .from("jobs")
     .select("category")
     .eq("is_active", true)
     .not("category", "is", null)

   // Create counts map
   const countsMap = new Map<string, number>()
   categoryCounts?.forEach((item: any) => {
     const currentCount = countsMap.get(item.category) || 0
     countsMap.set(item.category, currentCount + 1)
   })

   // Update categories with real counts
   const updatedCategories = jobCategories.map(category => ({
     ...category,
     count: countsMap.get(category.id) || 0
   }))
   ```

2. **Product Categories**:
   - Counts calculated on-demand
   - Includes active products only
   - Cached for performance

### Category Filtering

1. **Job Filtering**:
   ```typescript
   // Apply category filter
   if (category && category !== "all") {
     query = query.eq("category", category)
   }
   ```

2. **Product Filtering**:
   ```typescript
   // Apply category filter
   if (category && category !== "all") {
     query = query.eq("category_id", category)
   }
   ```

## Integration with Other APIs

### Job API Integration
- Categories used for job filtering
- Real-time count updates
- Category validation in job creation

### Product API Integration
- Categories used for product organization
- Category-based product browsing
- Category filtering in search

### Review API Integration
- Categories used for review organization
- Category-based review filtering
- Admin category management

### Discussion API Integration
- Categories used for forum organization
- Category-based post filtering
- Category-specific permissions

## Notes

- Job categories are predefined and static
- Product categories are dynamic and admin-managed
- Review categories are simple name-based
- Discussion categories include visual elements
- All categories support count tracking
- Categories are used for filtering and organization
- Admin operations require proper authentication
- Category names must be unique within their type 