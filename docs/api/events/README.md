# Events API Documentation

## Overview

The Events API manages   industry events, conferences, workshops, and webinars. It provides endpoints for creating, managing, and participating in events with features like registration, notifications, and event analytics.

## Base URL

```
/api/events
```

## Authentication

Most endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Events

**Endpoint**: `GET /api/events`

**Description**: Fetch events with filtering, pagination, and sorting options.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status - "upcoming", "ongoing", "past", "draft"
- `type` (optional): Filter by event type - "conference", "workshop", "webinar", "meetup"
- `category` (optional): Filter by category UUID
- `search` (optional): Search term for title and description
- `location` (optional): Filter by location (city, state, or country)
- `date_from` (optional): Filter events from this date
- `date_to` (optional): Filter events until this date
- `sort_by` (optional): Sort order - "date", "popularity", "relevance" (default: "date")
- `featured` (optional): Filter featured events only (true/false)

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "  Technology Conference 2024",
      "description": "Annual conference for   professionals...",
      "type": "conference",
      "status": "upcoming",
      "featured": true,
      "organizer_id": "uuid",
      "organizer": {
        "id": "uuid",
        "name": "  Mockify",
        "logo_url": "https://example.com/logo.png"
      },
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Technology",
        "slug": "technology"
      },
      "location": {
        "venue": "Convention Center",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "schedule": {
        "start_date": "2024-06-15T09:00:00Z",
        "end_date": "2024-06-17T18:00:00Z",
        "timezone": "America/New_York"
      },
      "capacity": 500,
      "registered_count": 350,
      "waitlist_count": 25,
      "price": {
        "amount": 299.99,
        "currency": "USD",
        "early_bird_until": "2024-05-15T23:59:59Z",
        "early_bird_price": 249.99
      },
      "tags": [" ", "technology", "conference"],
      "image_url": "https://example.com/event-image.jpg",
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

### 2. Create Event

**Endpoint**: `POST /api/events`

**Description**: Create a new event (organizer or admin only).

**Authentication**: Required

**Request Body**:
```json
{
  "title": "  Technology Conference 2024",
  "description": "Annual conference for   professionals...",
  "type": "conference",
  "category_id": "uuid",
  "location": {
    "venue": "Convention Center",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "schedule": {
    "start_date": "2024-06-15T09:00:00Z",
    "end_date": "2024-06-17T18:00:00Z",
    "timezone": "America/New_York"
  },
  "capacity": 500,
  "price": {
    "amount": 299.99,
    "currency": "USD",
    "early_bird_until": "2024-05-15T23:59:59Z",
    "early_bird_price": 249.99
  },
  "tags": [" ", "technology", "conference"],
  "featured": false
}
```

**Response**:
```json
{
  "event": {
    "id": "uuid",
    "title": "  Technology Conference 2024",
    "description": "Annual conference for   professionals...",
    "type": "conference",
    "status": "draft",
    "organizer_id": "uuid",
    "category_id": "uuid",
    "location": {
      "venue": "Convention Center",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "schedule": {
      "start_date": "2024-06-15T09:00:00Z",
      "end_date": "2024-06-17T18:00:00Z",
      "timezone": "America/New_York"
    },
    "capacity": 500,
    "price": {
      "amount": 299.99,
      "currency": "USD",
      "early_bird_until": "2024-05-15T23:59:59Z",
      "early_bird_price": 249.99
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Event created successfully"
}
```

### 3. Get Single Event

**Endpoint**: `GET /api/events/[id]`

**Description**: Fetch a single event with full details and registration status.

**Authentication**: Required

**Response**:
```json
{
  "event": {
    "id": "uuid",
    "title": "  Technology Conference 2024",
    "description": "Annual conference for   professionals...",
    "type": "conference",
    "status": "upcoming",
    "featured": true,
    "organizer_id": "uuid",
    "organizer": {
      "id": "uuid",
      "name": "  Mockify",
      "logo_url": "https://example.com/logo.png",
      "description": "Leading   community platform"
    },
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology"
    },
    "location": {
      "venue": "Convention Center",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "schedule": {
      "start_date": "2024-06-15T09:00:00Z",
      "end_date": "2024-06-17T18:00:00Z",
      "timezone": "America/New_York"
    },
    "capacity": 500,
    "registered_count": 350,
    "waitlist_count": 25,
    "price": {
      "amount": 299.99,
      "currency": "USD",
      "early_bird_until": "2024-05-15T23:59:59Z",
      "early_bird_price": 249.99
    },
    "tags": [" ", "technology", "conference"],
    "image_url": "https://example.com/event-image.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "user_registration": {
    "status": "registered",
    "registration_date": "2024-01-15T10:30:00Z",
    "ticket_type": "early_bird",
    "price_paid": 249.99,
    "payment_status": "completed"
  },
  "related_events": [
    {
      "id": "uuid",
      "title": "  Workshop Series",
      "type": "workshop",
      "start_date": "2024-07-01T09:00:00Z"
    }
  ]
}
```

### 4. Update Event

**Endpoint**: `PUT /api/events/[id]`

**Description**: Update an existing event (organizer or admin only).

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Updated Event Title",
  "description": "Updated event description...",
  "capacity": 600,
  "price": {
    "amount": 349.99,
    "currency": "USD"
  },
  "featured": true
}
```

**Response**:
```json
{
  "event": {
    "id": "uuid",
    "title": "Updated Event Title",
    "description": "Updated event description...",
    "capacity": 600,
    "price": {
      "amount": 349.99,
      "currency": "USD"
    },
    "featured": true,
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Event updated successfully"
}
```

### 5. Delete Event

**Endpoint**: `DELETE /api/events/[id]`

**Description**: Delete an event (organizer or admin only).

**Authentication**: Required

**Response**:
```json
{
  "message": "Event deleted successfully"
}
```

## Event Registration

### 6. Register for Event

**Endpoint**: `POST /api/events/[id]/apply`

**Description**: Register for an event.

**Authentication**: Required

**Request Body**:
```json
{
  "ticket_type": "early_bird",
  "additional_info": {
    "dietary_restrictions": "vegetarian",
    "special_requirements": "wheelchair accessible"
  },
  "payment_method": "points"
}
```

**Response**:
```json
{
  "registration": {
    "id": "uuid",
    "event_id": "uuid",
    "user_id": "uuid",
    "status": "registered",
    "ticket_type": "early_bird",
    "price_paid": 249.99,
    "payment_status": "completed",
    "registration_date": "2024-01-15T10:30:00Z",
    "additional_info": {
      "dietary_restrictions": "vegetarian",
      "special_requirements": "wheelchair accessible"
    }
  },
  "message": "Registration successful"
}
```

### 7. Cancel Registration

**Endpoint**: `DELETE /api/events/[id]/apply`

**Description**: Cancel event registration.

**Authentication**: Required

**Response**:
```json
{
  "message": "Registration cancelled successfully",
  "refund_amount": 249.99
}
```

### 8. Get Event Registrations (Admin/Organizer)

**Endpoint**: `GET /api/events/[id]/registrations`

**Description**: Get all registrations for an event (admin/organizer only).

**Authentication**: Required (Admin/Organizer)

**Query Parameters**:
- `limit` (optional): Number of registrations (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status - "registered", "waitlist", "cancelled"
- `search` (optional): Search by attendee name or email

**Response**:
```json
{
  "registrations": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "user_id": "uuid",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "status": "registered",
      "ticket_type": "early_bird",
      "price_paid": 249.99,
      "payment_status": "completed",
      "registration_date": "2024-01-15T10:30:00Z",
      "additional_info": {
        "dietary_restrictions": "vegetarian"
      }
    }
  ],
  "pagination": {
    "total": 350,
    "page": 1,
    "limit": 20,
    "totalPages": 18
  },
  "summary": {
    "total_registered": 350,
    "total_waitlist": 25,
    "total_cancelled": 10,
    "revenue": 87496.50
  }
}
```

## Event Notifications

### 9. Get Event Notifications

**Endpoint**: `GET /api/events/notifications`

**Description**: Get notifications for events (admin/organizer only).

**Authentication**: Required (Admin/Organizer)

**Query Parameters**:
- `event_id` (optional): Filter by specific event
- `type` (optional): Filter by notification type
- `status` (optional): Filter by status - "pending", "sent", "failed"

**Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "event": {
        "id": "uuid",
        "title": "  Technology Conference 2024"
      },
      "type": "reminder",
      "subject": "Event Reminder",
      "content": "Your event starts in 24 hours...",
      "status": "sent",
      "recipient_count": 350,
      "sent_count": 345,
      "failed_count": 5,
      "scheduled_at": "2024-06-14T09:00:00Z",
      "sent_at": "2024-06-14T09:00:00Z",
      "created_at": "2024-06-13T09:00:00Z"
    }
  ]
}
```

### 10. Send Event Notification

**Endpoint**: `POST /api/events/[id]/notifications`

**Description**: Send notification to event registrants (admin/organizer only).

**Authentication**: Required (Admin/Organizer)

**Request Body**:
```json
{
  "type": "reminder",
  "subject": "Event Reminder",
  "content": "Your event starts in 24 hours. Please arrive 30 minutes early.",
  "scheduled_at": "2024-06-14T09:00:00Z",
  "recipients": "all_registered"
}
```

**Response**:
```json
{
  "notification": {
    "id": "uuid",
    "event_id": "uuid",
    "type": "reminder",
    "subject": "Event Reminder",
    "status": "scheduled",
    "recipient_count": 350,
    "scheduled_at": "2024-06-14T09:00:00Z",
    "created_at": "2024-06-13T09:00:00Z"
  },
  "message": "Notification scheduled successfully"
}
```

## Event Analytics

### 11. Get Event Analytics

**Endpoint**: `GET /api/events/[id]/analytics`

**Description**: Get analytics for an event (admin/organizer only).

**Authentication**: Required (Admin/Organizer)

**Query Parameters**:
- `period` (optional): Time period - "day", "week", "month", "all" (default: "all")
- `metrics` (optional): Comma-separated metrics to include

**Response**:
```json
{
  "analytics": {
    "overview": {
      "total_registrations": 350,
      "total_revenue": 87496.50,
      "conversion_rate": 70.0,
      "average_ticket_price": 249.99
    },
    "registrations": {
      "daily": [
        {
          "date": "2024-01-01",
          "count": 25,
          "revenue": 6249.75
        }
      ],
      "by_ticket_type": {
        "early_bird": 200,
        "regular": 150
      }
    },
    "demographics": {
      "locations": [
        {
          "city": "New York",
          "count": 50,
          "percentage": 14.3
        }
      ],
      "age_groups": [
        {
          "range": "25-34",
          "count": 120,
          "percentage": 34.3
        }
      ]
    },
    "engagement": {
      "page_views": 1500,
      "unique_visitors": 800,
      "social_shares": 45
    }
  }
}
```

## Event Categories

### 12. Get Event Categories

**Endpoint**: `GET /api/events/categories`

**Description**: Get all event categories.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology-focused events",
      "icon": "cpu",
      "color": "#3B82F6",
      "event_count": 25,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Event Debug/Test

### 13. Test Event Registration

**Endpoint**: `POST /api/events/test`

**Description**: Test event registration flow (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "event_id": "uuid",
  "user_id": "uuid",
  "test_scenario": "successful_registration"
}
```

**Response**:
```json
{
  "test_result": {
    "scenario": "successful_registration",
    "status": "passed",
    "registration_id": "uuid",
    "execution_time": "150ms",
    "details": "Registration flow completed successfully"
  }
}
```

## Data Validation

### Event Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | 5-200 characters |
| `description` | string | Yes | 10-5000 characters |
| `type` | string | Yes | "conference", "workshop", "webinar", "meetup" |
| `category_id` | uuid | Yes | Valid category UUID |
| `location` | object | Yes | Valid location object |
| `schedule` | object | Yes | Valid schedule object |
| `capacity` | integer | No | Positive integer, max 10000 |
| `price` | object | No | Valid price object |

### Registration Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `ticket_type` | string | No | Valid ticket type |
| `additional_info` | object | No | JSON object |
| `payment_method` | string | Yes | "points", "card", "free" |

## Error Codes

| Code | Description |
|------|-------------|
| `EVENT_NOT_FOUND` | Event does not exist |
| `EVENT_FULL` | Event is at capacity |
| `REGISTRATION_EXISTS` | User already registered |
| `INVALID_TICKET_TYPE` | Invalid ticket type |
| `INSUFFICIENT_POINTS` | Not enough points for registration |
| `EVENT_EXPIRED` | Event registration has closed |
| `INSUFFICIENT_PERMISSIONS` | Admin/organizer permission required |
| `REGISTRATION_FAILED` | Registration processing failed |

## Rate Limiting

- Event creation: 10 per hour
- Event registration: 5 per hour
- Notification sending: 20 per hour
- API calls: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get events with filtering
const getEvents = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/events?${params}`);
  return response.json();
};

// Create new event
const createEvent = async (eventData) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return response.json();
};

// Register for event
const registerForEvent = async (eventId, registrationData) => {
  const response = await fetch(`/api/events/${eventId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });
  return response.json();
};

// Get event analytics
const getEventAnalytics = async (eventId, period = 'all') => {
  const params = new URLSearchParams({ period });
  const response = await fetch(`/api/events/${eventId}/analytics?${params}`);
  return response.json();
};

// Send event notification
const sendEventNotification = async (eventId, notificationData) => {
  const response = await fetch(`/api/events/${eventId}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get events
curl -X GET "https://your-domain.com/api/events?status=upcoming&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create event
curl -X POST "https://your-domain.com/api/events" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "  Workshop",
    "description": "Hands-on   workshop",
    "type": "workshop",
    "category_id": "category-uuid",
    "location": {
      "venue": "Workshop Center",
      "city": "New York",
      "country": "USA"
    },
    "schedule": {
      "start_date": "2024-07-01T09:00:00Z",
      "end_date": "2024-07-01T17:00:00Z",
      "timezone": "America/New_York"
    }
  }'

# Register for event
curl -X POST "https://your-domain.com/api/events/event-uuid/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_type": "early_bird",
    "payment_method": "points"
  }'
```

## Notes

1. **Event Types**: Supports conferences, workshops, webinars, and meetups with different registration flows.

2. **Capacity Management**: Automatic waitlist management when events reach capacity.

3. **Payment Methods**: Supports points-based and traditional payment methods.

4. **Notifications**: Automated and manual notification system for event updates.

5. **Analytics**: Comprehensive analytics for event performance and attendee insights.

6. **Location Support**: Full address and coordinate support for in-person events.

7. **Timezone Handling**: Proper timezone support for global events.

8. **Early Bird Pricing**: Support for time-limited discounted pricing. 