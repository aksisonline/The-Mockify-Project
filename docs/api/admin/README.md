# Admin API Documentation

## Overview

The Admin API provides administrative functionality for managing users, content moderation, system settings, and bulk operations. All endpoints require admin authentication and appropriate role-based permissions.

## Base URL

```
/api/admin
```

## Authentication

All admin endpoints require:
- Valid session authentication
- Admin role verification (`is_admin: true` in profiles table)
- Role-based access control (RBAC)

### Authentication Headers

```http
Authorization: Bearer <session_token>
```

## Endpoints

### 1. User Management

#### Get All Users

**Endpoint**: `GET /api/admin/users`

**Description**: Retrieve all users with filtering and pagination options.

**Authentication**: Required (Admin)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role - "admin", "user"
- `status` (optional): Filter by status - "active", "inactive"
- `sort` (optional): Sort field - "created_at", "full_name", "email"
- `order` (optional): Sort order - "asc", "desc"

**Response**:
```json
{
  "users": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "is_admin": false,
      "created_at": "2024-01-01T00:00:00Z",
      "last_sign_in": "2024-01-01T12:00:00Z",
      "profile_completion": 85,
      "employment": {
        "company_name": "Tech Corp",
        "designation": "Engineer"
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

#### Update User Role

**Endpoint**: `PUT /api/admin/users/[id]/role`

**Description**: Update user's admin status.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "is_admin": true
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "is_admin": true,
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "User role updated successfully"
}
```

### 2. Content Moderation

#### Get Reviews for Moderation

**Endpoint**: `GET /api/admin/reviews`

**Description**: Get reviews pending moderation.

**Authentication**: Required (Admin)

**Query Parameters**:
- `status` (optional): Filter by status - "pending", "flagged", "rejected"
- `limit` (optional): Number of reviews (default: 20)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "title": "Product Review",
      "content": "Review content...",
      "rating": 4,
      "status": "pending",
      "author": {
        "id": "uuid",
        "full_name": "John Doe"
      },
      "product": {
        "id": "uuid",
        "name": "Product Name"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

#### Update Review Status

**Endpoint**: `PUT /api/admin/reviews/[id]`

**Description**: Update review content and status.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "title": "Updated Review Title",
  "content": "Updated review content...",
  "rating": 4,
  "category_id": "uuid"
}
```

**Response**:
```json
{
  "review": {
    "id": "uuid",
    "title": "Updated Review Title",
    "content": "Updated review content...",
    "rating": 4,
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Review updated successfully"
}
```

#### Update Review Request Status

**Endpoint**: `PUT /api/admin/reviews/requests/[id]/status`

**Description**: Update review request status (approve/reject).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "status": "approved"
}
```

**Response**:
```json
{
  "request": {
    "id": "uuid",
    "status": "approved",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Review request status updated"
}
```

#### Create Review Category

**Endpoint**: `POST /api/admin/reviews/categories`

**Description**: Create a new review category.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "Audio Equipment"
}
```

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "name": "Audio Equipment",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Event Management

#### Get Event Logs

**Endpoint**: `GET /api/admin/events/logs`

**Description**: Retrieve event activity logs for monitoring.

**Authentication**: Required (Admin)

**Query Parameters**:
- `event_id` (optional): Filter by specific event
- `action` (optional): Filter by action type
- `limit` (optional): Number of logs (default: 50)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "action": "registration",
      "user_id": "uuid",
      "details": {
        "registration_id": "uuid",
        "status": "confirmed"
      },
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

### 4. Bulk Operations

#### Send Bulk Email

**Endpoint**: `POST /api/admin/bulk-email`

**Description**: Send bulk emails to users with filtering options.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "subject": "Important Announcement",
  "htmlContent": "<h1>Hello</h1><p>This is an important message...</p>",
  "recipientType": "filtered",
  "filters": {
    "is_admin": false,
    "created_after": "2024-01-01T00:00:00Z"
  }
}
```

**Response**:
```json
{
  "message": "Bulk email sent successfully",
  "recipients": 150,
  "emailsSent": 150,
  "failedEmails": []
}
```

### 5. Points Management

#### Award Points (Admin)

**Endpoint**: `POST /api/points/admin`

**Description**: Award points to users (admin override).

**Authentication**: Required (Admin + Admin Key)

**Request Body**:
```json
{
  "userId": "uuid",
  "amount": 100,
  "reason": "Special achievement",
  "adminKey": "admin_secret_key",
  "metadata": {
    "achievement": "special_event"
  }
}
```

**Response**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 100,
    "reason": "Special achievement",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### 6. Training Management

#### Get All Enrollments (Admin)

**Endpoint**: `GET /api/training/enrollments?admin=true`

**Description**: Get all training enrollments (admin view).

**Authentication**: Required (Admin)

**Query Parameters**:
- `admin=true` (required): Enable admin mode
- `status` (optional): Filter by enrollment status
- `program_id` (optional): Filter by program
- `limit` (optional): Number of enrollments (default: 20)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "enrollments": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "program_id": "uuid",
      "enrollment_status": "confirmed",
      "enrolled_at": "2024-01-01T00:00:00Z",
      "program": {
        "id": "uuid",
        "title": "Audio Visual Training"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### Update Enrollment Status

**Endpoint**: `PUT /api/training/enrollments/[id]`

**Description**: Update enrollment status (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "enrollment_status": "confirmed"
}
```

**Response**:
```json
{
  "enrollment": {
    "id": "uuid",
    "enrollment_status": "confirmed",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Enrollment status updated"
}
```

#### Mass Update Enrollments

**Endpoint**: `PUT /api/training/enrollments/mass-update`

**Description**: Update multiple enrollments at once.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "enrollmentIds": ["uuid1", "uuid2", "uuid3"],
  "status": "confirmed"
}
```

**Response**:
```json
{
  "message": "Enrollments updated successfully",
  "updatedCount": 3,
  "emailsSent": 3
}
```

### 7. Job Management

#### Fix Job Constraints

**Endpoint**: `POST /api/admin/fix-jobs-constraints`

**Description**: Fix job posting constraints and validation.

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "action": "validate_all"
}
```

**Response**:
```json
{
  "message": "Job constraints fixed successfully",
  "fixedJobs": 5,
  "errors": []
}
```

## Data Validation

### Admin Access Validation

All admin endpoints validate:
- User authentication
- Admin role (`is_admin: true`)
- Session validity
- Request permissions

### Input Validation Rules

- **User IDs**: Must be valid UUID format
- **Email addresses**: Must be valid email format
- **Status values**: Must be from allowed enum values
- **Pagination**: Page must be positive integer, limit between 1-100
- **Admin keys**: Must match configured admin secret

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Invalid or missing authentication |
| `403` | Forbidden - Admin access required |
| `400` | Bad Request - Invalid input data |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per admin
- **Bulk operations**: 10 requests per minute per admin
- **Email sending**: 5 requests per minute per admin

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get all users with filtering
const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/users?${params}`, {
    credentials: 'include'
  });
  return response.json();
};

// Update user role
const updateUserRole = async (userId: string, isAdmin: boolean) => {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ is_admin: isAdmin })
  });
  return response.json();
};

// Send bulk email
const sendBulkEmail = async (emailData) => {
  const response = await fetch('/api/admin/bulk-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(emailData)
  });
  return response.json();
};

// Award points to user
const awardPoints = async (userId: string, amount: number, reason: string) => {
  const response = await fetch('/api/points/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      userId,
      amount,
      reason,
      adminKey: process.env.ADMIN_SECRET_KEY
    })
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get all users
curl -X GET "https://mockify.vercel.app/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Update user role
curl -X PUT "https://mockify.vercel.app/api/admin/users/USER_ID/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"is_admin": true}'

# Send bulk email
curl -X POST "https://mockify.vercel.app/api/admin/bulk-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "subject": "Important Update",
    "htmlContent": "<h1>Hello</h1><p>Important message...</p>",
    "recipientType": "all"
  }'
```

## Security Considerations

### Access Control
- All admin endpoints require admin role verification
- Session-based authentication with secure cookies
- Role-based permissions for different admin functions
- Audit logging for all admin actions

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection for HTML content
- Rate limiting to prevent abuse

### Audit Trail
- All admin actions are logged
- User activity tracking
- System change history
- Compliance reporting capabilities

## Notes

- Admin endpoints bypass regular user permissions
- Use with caution as they can modify system data
- Always validate input data before processing
- Monitor admin activity for security purposes
- Consider implementing additional security measures for sensitive operations 