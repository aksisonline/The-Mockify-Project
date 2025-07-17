# Discussions API Documentation

## Overview

The Discussions API provides endpoints for managing community discussions, comments, polls, and voting. It supports multiple content types including text posts, polls, links, and images with advanced moderation and engagement features.

## Base URL

```
/api/discussions
```

## Authentication

Most endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Discussions

**Endpoint**: `GET /api/discussions`

**Description**: Fetch discussions with filtering, pagination, and sorting options.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of discussions to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `category_id` (optional): Filter by category UUID
- `tag` (optional): Filter by tag name
- `search` (optional): Search term for title and content
- `sort_by` (optional): Sort order - "newest", "popular", "activity" (default: "newest")
- `author_id` (optional): Filter by author UUID
- `status` (optional): Filter by status - "active", "pinned", "locked", "archived"

**Response**:
```json
{
  "discussions": [
    {
      "id": "uuid",
      "title": "Discussion Title",
      "content": "Discussion content...",
      "content_type": "text",
      "author_id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "General Discussion",
        "slug": "general"
      },
      "is_pinned": false,
      "is_locked": false,
      "is_archived": false,
      "view_count": 150,
      "comment_count": 25,
      "vote_score": 15,
      "share_count": 5,
      "slug": "discussion-title",
      "tags": [" ", "technology", "discussion"],
      "metadata": {
        "featured": false,
        "trending": true
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "last_activity_at": "2024-01-01T12:00:00Z"
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

### 2. Create Discussion

**Endpoint**: `POST /api/discussions`

**Description**: Create a new discussion with various content types.

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Discussion Title",
  "content": "Discussion content...",
  "content_type": "text",
  "category_id": "uuid",
  "tags": [" ", "technology"],
  "metadata": {
    "featured": false
  },
  "poll": {
    "question": "What's your opinion?",
    "options": [
      {"text": "Option 1", "emoji": "👍"},
      {"text": "Option 2", "emoji": "👎"}
    ],
    "allowMultipleSelections": false,
    "isAnonymous": false,
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

**Response**:
```json
{
  "discussion": {
    "id": "uuid",
    "title": "Discussion Title",
    "content": "Discussion content...",
    "content_type": "text",
    "author_id": "uuid",
    "category_id": "uuid",
    "slug": "discussion-title",
    "tags": [" ", "technology"],
    "created_at": "2024-01-01T00:00:00Z"
  },
  "poll": {
    "id": "uuid",
    "discussion_id": "uuid",
    "question": "What's your opinion?",
    "options": [
      {
        "id": "uuid",
        "text": "Option 1",
        "emoji": "👍",
        "vote_count": 0
      }
    ]
  }
}
```

### 3. Get Single Discussion

**Endpoint**: `GET /api/discussions/[id]`

**Description**: Fetch a single discussion with full details and comments.

**Authentication**: Required

**Response**:
```json
{
  "discussion": {
    "id": "uuid",
    "title": "Discussion Title",
    "content": "Discussion content...",
    "content_type": "text",
    "author_id": "uuid",
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "General Discussion"
    },
    "is_pinned": false,
    "is_locked": false,
    "view_count": 150,
    "comment_count": 25,
    "vote_score": 15,
    "share_count": 5,
    "tags": [" ", "technology"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "comments": [
    {
      "id": "uuid",
      "discussion_id": "uuid",
      "parent_id": null,
      "author_id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "avatar_url": "https://example.com/avatar2.jpg"
      },
      "content": "Great discussion!",
      "vote_score": 5,
      "reply_count": 2,
      "depth": 0,
      "path": "1",
      "created_at": "2024-01-01T01:00:00Z",
      "updated_at": "2024-01-01T01:00:00Z",
      "replies": [
        {
          "id": "uuid",
          "parent_id": "uuid",
          "content": "I agree!",
          "depth": 1,
          "path": "1.1"
        }
      ]
    }
  ],
  "poll": {
    "id": "uuid",
    "question": "What's your opinion?",
    "allow_multiple_choices": false,
    "total_votes": 50,
    "expires_at": "2024-12-31T23:59:59Z",
    "options": [
      {
        "id": "uuid",
        "text": "Option 1",
        "vote_count": 30,
        "percentage": 60
      }
    ],
    "user_vote": "uuid"
  },
  "user_vote": "upvote"
}
```

### 4. Update Discussion

**Endpoint**: `PUT /api/discussions/[id]`

**Description**: Update an existing discussion (author only).

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Updated Discussion Title",
  "content": "Updated content...",
  "category_id": "uuid",
  "tags": [" ", "technology", "updated"]
}
```

**Response**:
```json
{
  "discussion": {
    "id": "uuid",
    "title": "Updated Discussion Title",
    "content": "Updated content...",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Discussion updated successfully"
}
```

### 5. Delete Discussion

**Endpoint**: `DELETE /api/discussions/[id]`

**Description**: Delete a discussion (author or admin only).

**Authentication**: Required

**Response**:
```json
{
  "message": "Discussion deleted successfully"
}
```

### 6. Vote on Discussion

**Endpoint**: `POST /api/discussions/[id]/vote`

**Description**: Vote (upvote/downvote) on a discussion.

**Authentication**: Required

**Request Body**:
```json
{
  "vote": "upvote"
}
```

**Response**:
```json
{
  "vote_score": 16,
  "user_vote": "upvote",
  "message": "Vote recorded successfully"
}
```

### 7. Share Discussion

**Endpoint**: `POST /api/discussions/[id]/share`

**Description**: Share a discussion and increment share count.

**Authentication**: Required

**Request Body**:
```json
{
  "platform": "twitter",
  "message": "Check out this discussion!"
}
```

**Response**:
```json
{
  "share_count": 6,
  "message": "Discussion shared successfully"
}
```

### 8. Pin/Unpin Discussion

**Endpoint**: `POST /api/discussions/[id]/pin`

**Description**: Pin or unpin a discussion (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "pinned": true
}
```

**Response**:
```json
{
  "is_pinned": true,
  "message": "Discussion pinned successfully"
}
```

### 9. Lock/Unlock Discussion

**Endpoint**: `POST /api/discussions/[id]/lock`

**Description**: Lock or unlock a discussion (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "locked": true
}
```

**Response**:
```json
{
  "is_locked": true,
  "message": "Discussion locked successfully"
}
```

## Comment Endpoints

### 10. Get Comments

**Endpoint**: `GET /api/discussions/[id]/comments`

**Description**: Get comments for a discussion with threading.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of comments (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order - "newest", "oldest", "votes" (default: "newest")

**Response**:
```json
{
  "comments": [
    {
      "id": "uuid",
      "discussion_id": "uuid",
      "parent_id": null,
      "author_id": "uuid",
      "author": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "content": "Great discussion!",
      "is_deleted": false,
      "is_edited": false,
      "vote_score": 5,
      "reply_count": 2,
      "depth": 0,
      "path": "1",
      "created_at": "2024-01-01T01:00:00Z",
      "updated_at": "2024-01-01T01:00:00Z",
      "replies": [
        {
          "id": "uuid",
          "parent_id": "uuid",
          "content": "I agree!",
          "depth": 1,
          "path": "1.1"
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### 11. Add Comment

**Endpoint**: `POST /api/discussions/[id]/comments`

**Description**: Add a comment to a discussion.

**Authentication**: Required

**Request Body**:
```json
{
  "content": "Great discussion!",
  "parent_id": "uuid"
}
```

**Response**:
```json
{
  "comment": {
    "id": "uuid",
    "discussion_id": "uuid",
    "parent_id": "uuid",
    "author_id": "uuid",
    "content": "Great discussion!",
    "vote_score": 0,
    "reply_count": 0,
    "depth": 1,
    "created_at": "2024-01-01T02:00:00Z"
  },
  "message": "Comment added successfully"
}
```

### 12. Update Comment

**Endpoint**: `PUT /api/discussions/[id]/comments/[commentId]`

**Description**: Update a comment (author only).

**Authentication**: Required

**Request Body**:
```json
{
  "content": "Updated comment content"
}
```

**Response**:
```json
{
  "comment": {
    "id": "uuid",
    "content": "Updated comment content",
    "is_edited": true,
    "updated_at": "2024-01-01T03:00:00Z"
  },
  "message": "Comment updated successfully"
}
```

### 13. Delete Comment

**Endpoint**: `DELETE /api/discussions/[id]/comments/[commentId]`

**Description**: Delete a comment (author or admin only).

**Authentication**: Required

**Response**:
```json
{
  "message": "Comment deleted successfully"
}
```

### 14. Vote on Comment

**Endpoint**: `POST /api/discussions/[id]/comments/[commentId]/vote`

**Description**: Vote on a comment.

**Authentication**: Required

**Request Body**:
```json
{
  "vote": "upvote"
}
```

**Response**:
```json
{
  "vote_score": 6,
  "user_vote": "upvote",
  "message": "Vote recorded successfully"
}
```

## Poll Endpoints

### 15. Create Poll

**Endpoint**: `POST /api/discussions/[id]/polls`

**Description**: Create a poll for a discussion.

**Authentication**: Required

**Request Body**:
```json
{
  "question": "What's your favorite   technology?",
  "options": [
    {"text": "Crestron", "emoji": "🎛️"},
    {"text": "AMX", "emoji": "🎚️"},
    {"text": "Extron", "emoji": "📺"}
  ],
  "allow_multiple_choices": false,
  "is_anonymous": false,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response**:
```json
{
  "poll": {
    "id": "uuid",
    "discussion_id": "uuid",
    "question": "What's your favorite   technology?",
    "allow_multiple_choices": false,
    "total_votes": 0,
    "expires_at": "2024-12-31T23:59:59Z",
    "options": [
      {
        "id": "uuid",
        "text": "Crestron",
        "emoji": "🎛️",
        "vote_count": 0
      }
    ]
  },
  "message": "Poll created successfully"
}
```

### 16. Vote on Poll

**Endpoint**: `POST /api/discussions/[id]/polls/[pollId]/vote`

**Description**: Vote on a poll.

**Authentication**: Required

**Request Body**:
```json
{
  "option_ids": ["uuid"]
}
```

**Response**:
```json
{
  "poll": {
    "id": "uuid",
    "total_votes": 1,
    "options": [
      {
        "id": "uuid",
        "vote_count": 1,
        "percentage": 100
      }
    ]
  },
  "message": "Vote recorded successfully"
}
```

## Category Endpoints

### 17. Get Categories

**Endpoint**: `GET /api/discussions/categories`

**Description**: Get all discussion categories.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "General Discussion",
      "slug": "general",
      "description": "General   discussions",
      "icon": "chat",
      "color": "#3B82F6",
      "discussion_count": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 18. Create Category

**Endpoint**: `POST /api/discussions/categories`

**Description**: Create a new category (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "icon": "star",
  "color": "#10B981"
}
```

**Response**:
```json
{
  "category": {
    "id": "uuid",
    "name": "New Category",
    "slug": "new-category",
    "description": "Category description",
    "icon": "star",
    "color": "#10B981",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Category created successfully"
}
```

## Report Endpoints

### 19. Report Discussion

**Endpoint**: `POST /api/discussions/[id]/report`

**Description**: Report a discussion for moderation.

**Authentication**: Required

**Request Body**:
```json
{
  "reason": "spam",
  "details": "This discussion contains spam content"
}
```

**Response**:
```json
{
  "message": "Discussion reported successfully"
}
```

### 20. Report Comment

**Endpoint**: `POST /api/discussions/[id]/comments/[commentId]/report`

**Description**: Report a comment for moderation.

**Authentication**: Required

**Request Body**:
```json
{
  "reason": "inappropriate",
  "details": "This comment contains inappropriate content"
}
```

**Response**:
```json
{
  "message": "Comment reported successfully"
}
```

## Data Validation

### Discussion Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | 5-300 characters |
| `content` | string | Yes | 10-10000 characters |
| `content_type` | string | Yes | "text", "poll", "link", "image" |
| `category_id` | uuid | No | Valid category UUID |
| `tags` | array | No | Max 10 tags, 2-20 chars each |

### Comment Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `content` | string | Yes | 1-2000 characters |
| `parent_id` | uuid | No | Valid comment UUID |

### Poll Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `question` | string | Yes | 5-200 characters |
| `options` | array | Yes | 2-10 options |
| `allow_multiple_choices` | boolean | No | Default: false |
| `expires_at` | datetime | No | Future date |

## Error Codes

| Code | Description |
|------|-------------|
| `DISCUSSION_NOT_FOUND` | Discussion does not exist |
| `COMMENT_NOT_FOUND` | Comment does not exist |
| `POLL_NOT_FOUND` | Poll does not exist |
| `CATEGORY_NOT_FOUND` | Category does not exist |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `CONTENT_TOO_LONG` | Content exceeds maximum length |
| `INVALID_VOTE` | Invalid vote type |
| `ALREADY_VOTED` | User has already voted |
| `DISCUSSION_LOCKED` | Discussion is locked |
| `POLL_EXPIRED` | Poll has expired |

## Rate Limiting

- Discussion creation: 5 per minute
- Comment creation: 10 per minute
- Voting: 20 per minute
- Reporting: 3 per minute
- API calls: 100 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get discussions with filtering
const getDiscussions = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/discussions?${params}`);
  return response.json();
};

// Create new discussion
const createDiscussion = async (discussionData) => {
  const response = await fetch('/api/discussions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discussionData)
  });
  return response.json();
};

// Vote on discussion
const voteDiscussion = async (discussionId, voteType) => {
  const response = await fetch(`/api/discussions/${discussionId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote: voteType })
  });
  return response.json();
};

// Add comment
const addComment = async (discussionId, content, parentId = null) => {
  const response = await fetch(`/api/discussions/${discussionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parent_id: parentId })
  });
  return response.json();
};

// Create poll
const createPoll = async (discussionId, pollData) => {
  const response = await fetch(`/api/discussions/${discussionId}/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pollData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get discussions
curl -X GET "https://your-domain.com/api/discussions?limit=10&sort_by=newest" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create discussion
curl -X POST "https://your-domain.com/api/discussions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Discussion",
    "content": "Discussion content...",
    "content_type": "text",
    "tags": [" ", "technology"]
  }'

# Vote on discussion
curl -X POST "https://your-domain.com/api/discussions/UUID/vote" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vote": "upvote"}'
```

## Notes

1. **Content Moderation**: All content is subject to moderation and may be reviewed before publication.

2. **Voting System**: Users can only vote once per discussion/comment. Changing votes updates the previous vote.

3. **Comment Threading**: Comments support unlimited nesting levels with proper threading.

4. **Poll Expiration**: Expired polls cannot receive new votes but remain visible.

5. **Rate Limiting**: Respect rate limits to avoid temporary blocks.

6. **File Uploads**: For image content type, use the file upload service separately.

7. **Search**: Full-text search is available across title and content fields.

8. **Caching**: Popular discussions and comments are cached for performance. 