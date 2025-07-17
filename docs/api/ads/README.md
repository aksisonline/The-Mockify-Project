# Advertisements API Documentation

## Overview

The Advertisements API manages sponsored content and promotional advertisements displayed throughout the   Mockify platform. It provides endpoints for retrieving active advertisements and admin management functionality.

## Base URL

```
/api/ads
```

## Authentication

- **Read operations**: Not required (public advertisements)
- **Admin operations**: Required (Admin role)

## Endpoints

### 1. Advertisement Retrieval

#### Get Active Advertisements

**Endpoint**: `GET /api/ads`

**Description**: Retrieve all active advertisements for display.

**Authentication**: Not required

**Response**:

```json
[
  {
    "id": "uuid",
    "title": "Professional   Training",
    "image_url": "https://example.com/ad-image.jpg",
    "link": "https://example.com/training",
    "is_active": true,
    "display_order": 1,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "description": "Enhance your   skills with professional training",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  {
    "id": "uuid",
    "title": "Latest   Equipment",
    "image_url": "https://example.com/equipment-ad.jpg",
    "link": "https://example.com/equipment",
    "is_active": true,
    "display_order": 2,
    "start_date": null,
    "end_date": null,
    "description": "Discover the latest in   technology",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

## Data Validation

### Advertisement Validation Rules

- **title**: Required, maximum 255 characters
- **image_url**: Required, valid URL format
- **link**: Optional, valid URL format
- **is_active**: Boolean, controls visibility
- **display_order**: Integer, determines display sequence
- **start_date**: Optional, ISO date string
- **end_date**: Optional, ISO date string
- **description**: Optional, maximum 500 characters

### Date Validation Rules

- **start_date**: Must be in the past or null
- **end_date**: Must be in the future or null
- **Date range**: If both dates provided, end_date must be after start_date

## Error Codes

| Code    | Description                            |
| ------- | -------------------------------------- |
| `400` | Bad Request - Invalid input data       |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Admin access required      |
| `404` | Not Found - Advertisement not found    |
| `500` | Internal Server Error - Server error   |

## Rate Limiting

- **Read operations**: 100 requests per minute
- **Admin operations**: 20 requests per minute per admin

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get active advertisements
const getActiveAds = async () => {
  const response = await fetch('/api/ads');
  return response.json();
};

// Create advertisement (admin)
const createAd = async (adData) => {
  const response = await fetch('/api/admin/ads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(adData)
  });
  return response.json();
};

// Update advertisement (admin)
const updateAd = async (id: string, adData) => {
  const response = await fetch(`/api/admin/ads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(adData)
  });
  return response.json();
};

// Delete advertisement (admin)
const deleteAd = async (id: string) => {
  const response = await fetch(`/api/admin/ads/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get active advertisements
curl -X GET "https://mockify.vercel.app/api/ads"

# Create advertisement (admin)
curl -X POST "https://mockify.vercel.app/api/admin/ads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Professional   Training",
    "image_url": "https://example.com/ad-image.jpg",
    "link": "https://example.com/training",
    "is_active": true,
    "display_order": 1,
    "description": "Enhance your   skills"
  }'

# Update advertisement (admin)
curl -X PUT "https://mockify.vercel.app/api/admin/ads/AD_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Updated Training Ad",
    "is_active": false
  }'

# Delete advertisement (admin)
curl -X DELETE "https://mockify.vercel.app/api/admin/ads/AD_ID" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Database Schema

### `advertisements` Table

```sql
CREATE TABLE advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_advertisements_active ON advertisements(is_active);
CREATE INDEX idx_advertisements_display_order ON advertisements(display_order);
CREATE INDEX idx_advertisements_dates ON advertisements(start_date, end_date);
```

## Features

### Advertisement Management

- Active/inactive status control
- Date-based scheduling
- Display order management
- Image and link support
- Description and metadata

### Display Logic

- Automatic filtering of active ads
- Date range validation
- Ordered display sequence
- Fallback handling

### Admin Features

- CRUD operations for advertisements
- Image upload and management
- Bulk operations
- Preview functionality

### Scheduling

- Start and end date support
- Automatic activation/deactivation
- Timezone handling
- Overlapping date management

## Business Logic

### Active Advertisement Filtering

```typescript
export async function getActiveAdvertisements(): Promise<Advertisement[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching advertisements:", error)
    return []
  }
  return data || []
}
```

### Date Validation

1. **Start Date**: Must be in the past or null
2. **End Date**: Must be in the future or null
3. **Date Range**: If both dates provided, end_date must be after start_date
4. **Current Time**: Advertisements are filtered based on current time

### Display Order

1. **Ordering**: Advertisements are displayed in `display_order` sequence
2. **Default Order**: New ads get the next available order number
3. **Reordering**: Admin can manually adjust display order
4. **Fallback**: If order is the same, creation date is used

## Integration with Other APIs

### File Service Integration

- Image upload and management
- Public URL generation
- File validation and processing
- Storage optimization

### Admin API Integration

- Admin authentication and authorization
- CRUD operations
- Bulk management
- Audit logging

### Frontend Integration

- Advertisement display components
- Image optimization
- Link handling
- Responsive design

## Admin Management

### Advertisement Creation

1. **Form Validation**:

   - Required fields validation
   - Image upload processing
   - Date range validation
   - URL format validation
2. **Processing**:

   - Image upload to storage
   - Database record creation
   - Order number assignment
   - Status initialization
3. **Response**:

   - Created advertisement data
   - Success confirmation
   - Error details if validation fails

### Advertisement Updates

1. **Validation**:

   - Existing advertisement verification
   - Admin permission check
   - Input data validation
   - Image update processing
2. **Processing**:

   - Database record update
   - Image replacement if provided
   - Order adjustment if needed
   - Status change handling
3. **Response**:

   - Updated advertisement data
   - Success confirmation
   - Error details if update fails

### Advertisement Deletion

1. **Validation**:

   - Advertisement existence check
   - Admin permission verification
   - Dependency validation
2. **Processing**:

   - Database record deletion
   - Associated image cleanup
   - Order rebalancing
   - Cache invalidation
3. **Response**:

   - Deletion confirmation
   - Success message
   - Error details if deletion fails

## Security Considerations

### Access Control

- Public read access for active advertisements
- Admin-only write operations
- Role-based permissions
- Session validation

### Data Protection

- Input validation and sanitization
- Image upload security
- URL validation
- SQL injection prevention

### Content Management

- Image format validation
- File size limits
- Malicious content detection
- Safe URL handling

## Performance Optimization

### Caching

- Advertisement data caching
- Query optimization
- Response compression

### Database Optimization

- Indexed queries for active ads
- Efficient date filtering
- Order-based sorting
- Connection pooling

### Image Optimization

- Automatic image resizing
- Format optimization
- Lazy loading support
- Responsive images

## Notes

- Advertisements are automatically filtered by active status and date range
- Display order determines the sequence of advertisement display
- Images are stored using the file service with public URLs
- Date ranges are optional - null dates mean no time restrictions
- Admin operations require proper authentication and authorization
- Advertisement data is cached for performance optimization
- Image uploads are processed and optimized automatically
- All URLs are validated for security and functionality
