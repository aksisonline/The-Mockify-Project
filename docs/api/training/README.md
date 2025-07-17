# Training API Documentation

## Overview

The Training API manages training programs, enrollments, and educational content for the   Mockify platform. It provides endpoints for users to enroll in training programs and for administrators to manage enrollments and send notifications.

## Base URL

```
/api/training
```

## Authentication

Most endpoints require authentication:
- User endpoints: Valid session required
- Admin endpoints: Admin role (`is_admin: true`) required
- Enrollment creation: User authentication required

## Endpoints

### 1. Enrollment Management

#### Create Enrollment

**Endpoint**: `POST /api/training/enrollments`

**Description**: Enroll a user in a training program.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "program_id": "uuid",
  "mobile_number": "+1234567890",
  "working_status": "yes",
  "preferred_mode": "online"
}
```

**Response**:
```json
{
  "id": "uuid",
  "program_id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "mobile_number": "+1234567890",
  "location": "New York, USA",
  "working_status": "yes",
  "preferred_mode": "online",
  "enrollment_status": "pending",
  "enrolled_at": "2024-01-01T00:00:00Z"
}
```

#### Get User Enrollments

**Endpoint**: `GET /api/training/enrollments`

**Description**: Get enrollments for the authenticated user.

**Authentication**: Required (User)

**Response**:
```json
{
  "enrollments": [
    {
      "id": "uuid",
      "program_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "enrollment_status": "confirmed",
      "enrolled_at": "2024-01-01T00:00:00Z",
      "program": {
        "id": "uuid",
        "title": "Media Training",
        "description": "Comprehensive   training program"
      }
    }
  ]
}
```

#### Get All Enrollments (Admin)

**Endpoint**: `GET /api/training/enrollments?admin=true`

**Description**: Get all enrollments across all users (admin only).

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
        "title": "Media Training"
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
  "message": "Enrollment updated successfully"
}
```

#### Mass Update Enrollments

**Endpoint**: `PUT /api/training/enrollments/mass-update`

**Description**: Update multiple enrollments at once (admin only).

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
  "message": "Successfully updated 3 enrollments",
  "updatedEnrollments": [
    {
      "id": "uuid1",
      "enrollment_status": "confirmed",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 2. Training Programs

#### Get Training Programs

**Endpoint**: `GET /api/training/programs`

**Description**: Get all available training programs.

**Authentication**: Not required

**Query Parameters**:
- `featured` (optional): Filter featured programs only
- `active` (optional): Filter active programs only
- `limit` (optional): Number of programs (default: 20)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "programs": [
    {
      "id": "uuid",
      "title": "Media Training",
      "description": "Comprehensive training in media systems",
      "topics": "Audio systems, Video distribution, Control systems",
      "duration": "12 weeks",
      "mode": "Online & Classroom",
      "fees": "$999",
      "image_url": "https://example.com/image.jpg",
      "is_featured": true,
      "is_active": true,
      "weekly_curriculum": [
        {
          "week": 1,
          "topic": "Introduction to   Systems",
          "description": "Overview of media technology"
        }
      ],
      "hardware_requirements": [
        "Computer with minimum 8GB RAM",
        "Audio interface"
      ],
      "software_requirements": [
        "Q-SYS Designer",
        "Crestron Studio"
      ],
      "advantages": [
        "Industry-recognized certification",
        "Hands-on practical training"
      ],
      "learning_outcomes": [
        "Design and install   systems",
        "Troubleshoot common issues"
      ],
      "instructors": [
        {
          "name": "John Smith",
          "expertise": "Audio Systems",
          "experience": "15 years"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Training Program by ID

**Endpoint**: `GET /api/training/programs/[id]`

**Description**: Get detailed information about a specific training program.

**Authentication**: Not required

**Response**:
```json
{
  "program": {
    "id": "uuid",
    "title": "Media Training",
    "description": "Comprehensive training in media systems",
    "topics": "Audio systems, Video distribution, Control systems",
    "duration": "12 weeks",
    "mode": "Online & Classroom",
    "fees": "$999",
    "image_url": "https://example.com/image.jpg",
    "is_featured": true,
    "is_active": true,
    "weekly_curriculum": [
      {
        "week": 1,
        "topic": "Introduction to   Systems",
        "description": "Overview of audio visual technology"
      }
    ],
    "hardware_requirements": [
      "Computer with minimum 8GB RAM",
      "Audio interface"
    ],
    "software_requirements": [
      "Q-SYS Designer",
      "Crestron Studio"
    ],
    "advantages": [
      "Industry-recognized certification",
      "Hands-on practical training"
    ],
    "learning_outcomes": [
      "Design and install   systems",
      "Troubleshoot common issues"
    ],
    "instructors": [
      {
        "name": "John Smith",
        "expertise": "Audio Systems",
        "experience": "15 years"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Notifications

#### Send Training Notifications

**Endpoint**: `POST /api/training/notifications/send`

**Description**: Send custom notifications to training participants (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "subject": "Course Schedule Update",
  "message": "Your training schedule has been updated. Please check your email for details.",
  "programId": "uuid",
  "enrollmentIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response**:
```json
{
  "message": "Successfully sent email notifications to 3 training participants",
  "emailsSent": 3,
  "programTitle": "Audio Visual Training",
  "recipients": [
    {
      "email": "user1@example.com",
      "name": "John Doe"
    }
  ],
  "success": true
}
```

## Data Validation

### Enrollment Validation Rules

- **program_id**: Must be valid UUID and exist in training_programs table
- **mobile_number**: Must be valid phone number format
- **working_status**: Must be "yes" or "no"
- **preferred_mode**: Must be "online" or "classroom"
- **enrollment_status**: Must be "pending", "confirmed", "completed", or "cancelled"

### Program Validation Rules

- **title**: Required, maximum 255 characters
- **description**: Required, maximum 1000 characters
- **topics**: Required, maximum 500 characters
- **duration**: Required, maximum 100 characters
- **mode**: Required, maximum 100 characters
- **fees**: Required, maximum 100 characters

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Admin access required |
| `400` | Bad Request - Invalid input data |
| `404` | Not Found - Program or enrollment not found |
| `409` | Conflict - User already enrolled in program |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Admin endpoints**: 50 requests per minute per admin
- **Notification sending**: 10 requests per minute per admin

## Usage Examples

### JavaScript/TypeScript

```typescript
// Enroll in a training program
const enrollInProgram = async (enrollmentData) => {
  const response = await fetch('/api/training/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(enrollmentData)
  });
  return response.json();
};

// Get user enrollments
const getUserEnrollments = async () => {
  const response = await fetch('/api/training/enrollments', {
    credentials: 'include'
  });
  return response.json();
};

// Get all training programs
const getTrainingPrograms = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/training/programs?${params}`);
  return response.json();
};

// Update enrollment status (admin)
const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
  const response = await fetch(`/api/training/enrollments/${enrollmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ enrollment_status: status })
  });
  return response.json();
};

// Send training notifications (admin)
const sendTrainingNotification = async (notificationData) => {
  const response = await fetch('/api/training/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(notificationData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Enroll in a training program
curl -X POST "https://mockify.vercel.app/api/training/enrollments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "program_id": "uuid",
    "mobile_number": "+1234567890",
    "working_status": "yes",
    "preferred_mode": "online"
  }'

# Get user enrollments
curl -X GET "https://mockify.vercel.app/api/training/enrollments" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Get training programs
curl -X GET "https://mockify.vercel.app/api/training/programs?featured=true"

# Update enrollment status (admin)
curl -X PUT "https://mockify.vercel.app/api/training/enrollments/ENROLLMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"enrollment_status": "confirmed"}'

# Send training notification (admin)
curl -X POST "https://mockify.vercel.app/api/training/notifications/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "subject": "Course Update",
    "message": "Your course schedule has been updated.",
    "enrollmentIds": ["uuid1", "uuid2"]
  }'
```

## Features

### Automatic Points Award
- Users receive 25 points when enrolling in a training program
- Points are awarded in the "training" category
- Points are automatically calculated and added to user's account

### Email Notifications
- Automatic email notifications for enrollment status changes
- Custom notification system for admins
- Bulk email capabilities for program-wide announcements
- Email templates for different enrollment statuses

### Admin Management
- Comprehensive enrollment management interface
- Mass status updates for multiple enrollments
- Program-specific enrollment views
- Notification system for student communication
- Enrollment statistics and reporting

### Program Features
- Detailed program information with curriculum
- Hardware and software requirements
- Learning outcomes and advantages
- Instructor information
- Featured program highlighting

## Notes

- Enrollment status changes trigger automatic email notifications
- Users cannot enroll in the same program multiple times
- Admin endpoints require proper role verification
- All enrollment data is validated before processing
- Email notifications are sent asynchronously to avoid blocking
- Training programs support rich content with JSONB fields for flexibility 