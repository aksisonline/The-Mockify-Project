# Directory API Documentation

## Overview

The Directory API manages the   Mockify member directory, allowing users to search, filter, and view public profiles of professionals and organizations in the   industry.

## Base URL

```
/api/directory
```

## Authentication

Most endpoints are public, but some require authentication (e.g., for advanced features).

## Endpoints

### 1. Get Directory Listings

**Endpoint**: `GET /api/directory`

**Description**: Fetch directory listings with filtering, pagination, and sorting options.

**Authentication**: Not required

**Query Parameters**:
- `limit` (optional): Number of listings to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by type - "individual", "organization"
- `industry` (optional): Filter by industry
- `location` (optional): Filter by location (city, state, or country)
- `search` (optional): Search term for name, company, or keywords
- `sort_by` (optional): Sort order - "name", "recent", "popularity" (default: "name")

**Response**:
```json
{
  "listings": [
    {
      "id": "uuid",
      "type": "individual",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "headline": "  Engineer at   Solutions Inc",
      "company": "  Solutions Inc",
      "location": "New York, NY, USA",
      "industry": "  Integration",
      "skills": ["  Design", "Project Management"],
      "profile_url": "/directory/john-doe",
      "is_verified": true,
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

### 2. Get Single Directory Profile

**Endpoint**: `GET /api/directory/[id]`

**Description**: Fetch a single directory profile with full details.

**Authentication**: Not required

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "type": "individual",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "headline": "  Engineer at   Solutions Inc",
    "company": "  Solutions Inc",
    "location": "New York, NY, USA",
    "industry": "  Integration",
    "skills": ["  Design", "Project Management"],
    "bio": "Experienced   engineer with 10+ years in the industry...",
    "social_links": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "related_profiles": [
    {
      "id": "uuid",
      "full_name": "Jane Smith",
      "headline": "  Project Manager"
    }
  ]
}
```

## Data Validation

### Directory Profile Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | string | Yes | "individual" or "organization" |
| `full_name` | string | Yes (individual) | 2-100 characters |
| `company` | string | No | 2-100 characters |
| `location` | string | No | 2-100 characters |
| `industry` | string | No | 2-100 characters |
| `skills` | array | No | Array of strings |
| `bio` | string | No | 10-1000 characters |
| `avatar_url` | string | No | Valid URL |
| `social_links` | object | No | JSON object |
| `is_verified` | boolean | No | Default: false |

## Error Codes

| Code | Description |
|------|-------------|
| `PROFILE_NOT_FOUND` | Profile does not exist |
| `INVALID_PROFILE_DATA` | Invalid profile data |
| `INSUFFICIENT_PERMISSIONS` | Permission required |

## Rate Limiting

- Directory queries: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get directory listings with filtering
const getDirectoryListings = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/directory?${params}`);
  return response.json();
};

// Get directory profile
const getDirectoryProfile = async (profileId) => {
  const response = await fetch(`/api/directory/${profileId}`);
  return response.json();
};
```

### cURL Examples

```bash
# Get directory listings
curl -X GET "https://your-domain.com/api/directory?type=individual&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get directory profile
curl -X GET "https://your-domain.com/api/directory/profile-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. **Profile Types**: Supports both individual and organization profiles.

2. **Search & Filtering**: Advanced search and filtering for easy discovery.

3. **Verification**: Verified profiles are highlighted in the directory.

4. **Social Links**: Profiles can include social media and website links.

5. **Admin Tools**: Admins can manage directory entries and verification status. 