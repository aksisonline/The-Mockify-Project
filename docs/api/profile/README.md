# Profile API Documentation

## Overview

The Profile API manages user profile data, including basic details, address, employment, certifications, avatar, points, and social links. It provides endpoints for retrieving and updating profile information, as well as managing profile completion and notification settings.

## Base URL

```
/api/profile
```

## Authentication

All endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Profile

**Endpoint**: `GET /api/profile`

**Description**: Fetch the authenticated user's complete profile, including all sections.

**Authentication**: Required

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone": "+1234567890",
    "bio": "Experienced   engineer...",
    "profile_completion": 80,
    "address": {
      "id": "uuid",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    },
    "employment": [
      {
        "id": "uuid",
        "company": "  Solutions Inc",
        "title": "  Engineer",
        "start_date": "2020-01-01",
        "end_date": null
      }
    ],
    "certifications": [
      {
        "id": "uuid",
        "name": "CTS",
        "authority": "AVIXA",
        "date_obtained": "2019-06-01"
      }
    ],
    "social_links": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "points": 150,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Update Profile

**Endpoint**: `PUT /api/profile`

**Description**: Update the authenticated user's basic profile details.

**Authentication**: Required

**Request Body**:
```json
{
  "full_name": "John Doe",
  "bio": "Updated bio...",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "bio": "Updated bio...",
    "phone": "+1234567890",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### 3. Update Address

**Endpoint**: `PUT /api/profile/address`

**Description**: Update the authenticated user's address.

**Authentication**: Required

**Request Body**:
```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "USA"
}
```

**Response**:
```json
{
  "address": {
    "id": "uuid",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Address updated successfully"
}
```

### 4. Update Employment

**Endpoint**: `PUT /api/profile/employment`

**Description**: Update the authenticated user's employment history.

**Authentication**: Required

**Request Body**:
```json
{
  "employment": [
    {
      "company": "  Solutions Inc",
      "title": "  Engineer",
      "start_date": "2020-01-01",
      "end_date": null
    }
  ]
}
```

**Response**:
```json
{
  "employment": [
    {
      "id": "uuid",
      "company": "  Solutions Inc",
      "title": "  Engineer",
      "start_date": "2020-01-01",
      "end_date": null,
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "message": "Employment updated successfully"
}
```

### 5. Update Certifications

**Endpoint**: `PUT /api/profile/certifications`

**Description**: Update the authenticated user's certifications.

**Authentication**: Required

**Request Body**:
```json
{
  "certifications": [
    {
      "name": "CTS",
      "authority": "AVIXA",
      "date_obtained": "2019-06-01"
    }
  ]
}
```

**Response**:
```json
{
  "certifications": [
    {
      "id": "uuid",
      "name": "CTS",
      "authority": "AVIXA",
      "date_obtained": "2019-06-01",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "message": "Certifications updated successfully"
}
```

### 6. Update Social Links

**Endpoint**: `PUT /api/profile/social-links`

**Description**: Update the authenticated user's social links.

**Authentication**: Required

**Request Body**:
```json
{
  "social_links": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  }
}
```

**Response**:
```json
{
  "social_links": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  },
  "message": "Social links updated successfully"
}
```

### 7. Update Avatar

**Endpoint**: `POST /api/profile/avatar`

**Description**: Upload or update the authenticated user's profile photo.

**Authentication**: Required

**Request Body**:
- `avatar` (file): Image file (multipart/form-data)

**Response**:
```json
{
  "avatar_url": "https://example.com/avatar.jpg",
  "message": "Avatar updated successfully"
}
```

### 8. Get Profile Points

**Endpoint**: `GET /api/profile/points`

**Description**: Get the authenticated user's points summary.

**Authentication**: Required

**Response**:
```json
{
  "points": 150,
  "total_earned": 200,
  "total_spent": 50,
  "last_updated": "2024-01-01T00:00:00Z"
}
```

### 9. Get/Update Notification Settings

**Endpoint**: `GET /api/profile/notification-settings`

**Description**: Get the authenticated user's notification settings.

**Authentication**: Required

**Response**:
```json
{
  "notification_settings": {
    "email_notifications": true,
    "push_notifications": false,
    "newsletter_subscribed": true
  }
}
```

**Endpoint**: `PUT /api/profile/notification-settings`

**Description**: Update the authenticated user's notification settings.

**Authentication**: Required

**Request Body**:
```json
{
  "notification_settings": {
    "email_notifications": false,
    "push_notifications": true,
    "newsletter_subscribed": false
  }
}
```

**Response**:
```json
{
  "notification_settings": {
    "email_notifications": false,
    "push_notifications": true,
    "newsletter_subscribed": false
  },
  "message": "Notification settings updated successfully"
}
```

## Data Validation

### Profile Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `full_name` | string | Yes | 2-100 characters |
| `bio` | string | No | 10-1000 characters |
| `phone` | string | No | Valid phone format |
| `avatar_url` | string | No | Valid URL |
| `address` | object | No | Valid address object |
| `employment` | array | No | Array of employment objects |
| `certifications` | array | No | Array of certification objects |
| `social_links` | object | No | JSON object |

## Error Codes

| Code | Description |
|------|-------------|
| `PROFILE_NOT_FOUND` | Profile does not exist |
| `INVALID_PROFILE_DATA` | Invalid profile data |
| `INSUFFICIENT_PERMISSIONS` | Permission required |
| `UPLOAD_FAILED` | Avatar upload failed |

## Rate Limiting

- Profile updates: 20 per hour
- Avatar uploads: 5 per hour
- API calls: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get profile
const getProfile = async () => {
  const response = await fetch('/api/profile');
  return response.json();
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// Update avatar
const updateAvatar = async (formData) => {
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get profile
curl -X GET "https://your-domain.com/api/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT "https://your-domain.com/api/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "bio": "Updated bio..."
  }'

# Update avatar
curl -X POST "https://your-domain.com/api/profile/avatar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

## Notes

1. **Profile Sections**: Profile data is organized into sections for modular updates.

2. **Profile Completion**: Completion percentage is calculated based on filled sections.

3. **Avatar Uploads**: Profile photos are uploaded and stored securely.

4. **Points Integration**: Profile endpoints are integrated with the points system.

5. **Notification Settings**: Users can manage notification preferences via dedicated endpoints. 