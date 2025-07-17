# Discussions & Community

## Overview

The Discussions feature provides a comprehensive community platform for   professionals to share knowledge, ask questions, and engage in meaningful conversations. It includes support for text posts, polls, links, and images with advanced moderation and engagement features.

## Features

### Content Types
- **Text Posts**: Rich text discussions with formatting
- **Polls**: Interactive polls with multiple choice options
- **Links**: Shared links with previews
- **Images**: Image-based discussions

### Community Features
- Categories and tags for organization
- Voting system (upvote/downvote)
- Comments with threaded replies
- Content moderation and reporting
- Search and filtering capabilities
- User reputation system

### Moderation Tools
- Content approval workflow
- User moderation actions
- Report management
- Automated content filtering
- Admin moderation interface

## Page Functionality

### Discussions List (`/discussions`)

**Purpose**: Main discussions hub with listing and filtering

**Features**:
- Discussion listing with pagination
- Category and tag filtering
- Search functionality
- Sort options (newest, popular, activity)
- Create new discussion button
- Trending discussions sidebar

**User Flow**:
1. User accesses discussions page
2. System loads discussions with filters
3. User can browse, search, or filter content
4. User clicks on discussion to view details
5. User can create new discussion

**Key Components**:
- Discussion cards with preview
- Filter sidebar
- Search bar
- Sort dropdown
- Pagination controls

### Discussion Detail (`/discussions/[id]`)

**Purpose**: Individual discussion view with comments and interactions

**Features**:
- Full discussion content display
- Comment thread with replies
- Voting system
- Share functionality
- Report content option
- Related discussions

**User Flow**:
1. User clicks on discussion from list
2. System loads full discussion content
3. User can read, vote, and comment
4. User can share or report content
5. User can navigate to related discussions

**Key Components**:
- Discussion header with metadata
- Content display (text, poll, link, image)
- Comment section with threading
- Voting buttons
- Share and report options

### Create Discussion (`/discussions/create`)

**Purpose**: Create new discussions with various content types

**Features**:
- Content type selection
- Rich text editor
- Poll creation interface
- Link preview generation
- Image upload
- Category and tag selection

**User Flow**:
1. User clicks "Create Discussion"
2. User selects content type
3. User fills in content and metadata
4. System validates and previews content
5. User publishes discussion

**Key Components**:
- Content type selector
- Rich text editor (TipTap)
- Poll builder
- Image uploader
- Category/tag selector

## Backend Functionality

### Content Management

#### Discussion Structure
```sql
-- Main discussion table
discussions (
  id, title, content, content_type, author_id, category_id,
  is_pinned, is_locked, is_archived, is_deleted,
  view_count, comment_count, vote_score, share_count,
  slug, tags, metadata, created_at, updated_at, last_activity_at
)

-- Comments with threading
discussion_comments (
  id, discussion_id, parent_id, author_id, content,
  is_deleted, is_edited, vote_score, reply_count,
  depth, path, created_at, updated_at
)

-- Polls
discussion_polls (
  id, discussion_id, question, allow_multiple_choices,
  total_votes, expires_at, created_at, updated_at
)

-- Poll options
discussion_poll_options (
  id, poll_id, option_text, vote_count, display_order, created_at
)

-- Poll votes
discussion_poll_votes (
  id, poll_id, option_id, user_id, created_at
)
```

#### Content Types

1. **Text Posts**:
   - Rich text content with formatting
   - Support for mentions and links
   - Image embedding
   - Code blocks and syntax highlighting

2. **Polls**:
   - Multiple choice questions
   - Single or multiple selection
   - Anonymous voting option
   - Expiration dates
   - Real-time results

3. **Links**:
   - URL validation and preview
   - Metadata extraction
   - Thumbnail generation
   - Link safety checks

4. **Images**:
   - Image upload and optimization
   - Multiple image support
   - Caption and description
   - Gallery view

### API Endpoints

#### `GET /api/discussions`
- **Purpose**: Get discussions with filtering and pagination
- **Query Parameters**:
  - `limit`: Number of discussions (default: 10)
  - `offset`: Pagination offset (default: 0)
  - `category_id`: Filter by category
  - `tag`: Filter by tag
  - `search`: Search term
  - `sort_by`: Sort order (newest, popular, activity)
  - `author_id`: Filter by author

#### `POST /api/discussions`
- **Purpose**: Create new discussion
- **Body**: Discussion data with content type
- **Response**: Created discussion with ID

#### `GET /api/discussions/[id]`
- **Purpose**: Get single discussion with comments
- **Response**: Full discussion data

#### `PUT /api/discussions/[id]`
- **Purpose**: Update discussion
- **Body**: Updated discussion data
- **Response**: Updated discussion

#### `DELETE /api/discussions/[id]`
- **Purpose**: Delete discussion
- **Response**: Success confirmation

#### `POST /api/discussions/[id]/vote`
- **Purpose**: Vote on discussion
- **Body**: Vote data (upvote/downvote)
- **Response**: Updated vote score

#### `POST /api/discussions/[id]/share`
- **Purpose**: Share discussion
- **Body**: Share data
- **Response**: Share confirmation

### Comment System

#### `GET /api/discussions/[id]/comments`
- **Purpose**: Get comments for discussion
- **Query Parameters**:
  - `limit`: Number of comments
  - `offset`: Pagination offset
  - `sort`: Sort order

#### `POST /api/discussions/[id]/comments`
- **Purpose**: Add comment to discussion
- **Body**: Comment content
- **Response**: Created comment

#### `PUT /api/discussions/[id]/comments/[commentId]`
- **Purpose**: Update comment
- **Body**: Updated comment content
- **Response**: Updated comment

#### `DELETE /api/discussions/[id]/comments/[commentId]`
- **Purpose**: Delete comment
- **Response**: Success confirmation

### Poll System

#### `POST /api/discussions/[id]/polls`
- **Purpose**: Create poll for discussion
- **Body**: Poll data with options
- **Response**: Created poll

#### `POST /api/discussions/[id]/polls/[pollId]/vote`
- **Purpose**: Vote on poll
- **Body**: Selected options
- **Response**: Updated poll results

## Database Schema

### Main Tables

#### `discussions`
```sql
CREATE TABLE discussions (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  title character varying(300) NOT NULL,
  content text,
  content_type character varying(20) DEFAULT 'text',
  author_id uuid NOT NULL REFERENCES profiles(id),
  category_id uuid REFERENCES discussion_categories(id),
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  view_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  vote_score integer DEFAULT 0,
  share_count integer DEFAULT 0,
  slug character varying(350) UNIQUE,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT discussions_content_type_check 
    CHECK (content_type IN ('text', 'poll', 'link', 'image'))
);
```

#### `discussion_comments`
```sql
CREATE TABLE discussion_comments (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  discussion_id uuid NOT NULL REFERENCES discussions(id),
  parent_id uuid REFERENCES discussion_comments(id),
  author_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  is_deleted boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  vote_score integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  depth integer DEFAULT 0,
  path text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

#### `discussion_polls`
```sql
CREATE TABLE discussion_polls (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  discussion_id uuid NOT NULL REFERENCES discussions(id),
  question text NOT NULL,
  allow_multiple_choices boolean DEFAULT false,
  total_votes integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## Content Moderation

### Moderation Workflow
1. **Content Creation**: User creates content
2. **Pre-moderation**: Automated checks (spam, inappropriate content)
3. **Post-moderation**: Community reporting and admin review
4. **Action**: Approve, reject, edit, or delete content

### Moderation Actions
- **Approve**: Content becomes visible
- **Reject**: Content is hidden/deleted
- **Edit**: Modify content before approval
- **Warn User**: Send warning message
- **Suspend User**: Temporary suspension
- **Ban User**: Permanent ban

### Automated Moderation
- Spam detection
- Inappropriate content filtering
- Duplicate content detection
- Rate limiting
- User reputation checks

## Engagement Features

### Voting System
- Upvote/downvote discussions and comments
- Vote score affects content visibility
- User reputation based on votes received
- Anti-gaming measures

### Reputation System
- Points for quality contributions
- Badges for achievements
- Trust levels for moderation
- Community recognition

### Search and Discovery
- Full-text search across discussions
- Tag-based filtering
- Category browsing
- Related content suggestions
- Trending discussions

## Performance Optimization

### Data Loading
- Pagination for large datasets
- Efficient comment threading
- Lazy loading of images
- Caching of popular content

### Search Optimization
- Full-text search indexing
- Tag-based search optimization
- Search result caching
- Relevance scoring

## Security Features

### Content Protection
- XSS prevention
- CSRF protection
- Input sanitization
- File upload validation

### User Protection
- Rate limiting
- Spam prevention
- Harassment detection
- Privacy controls

## Error Handling

### Common Issues
1. **Content Not Loading**: Check permissions and moderation status
2. **Vote Not Working**: Verify user authentication and rate limits
3. **Comment Not Posting**: Check content validation and user status
4. **Search Not Working**: Verify search index and query syntax

### Error Response Format
```json
{
  "error": "Content not found",
  "code": "DISCUSSION_NOT_FOUND",
  "details": "The requested discussion does not exist or has been deleted"
}
```

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
const addComment = async (discussionId, content) => {
  const response = await fetch(`/api/discussions/${discussionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return response.json();
};
```

### Rich Text Editor Integration

```typescript
// TipTap editor configuration
const editor = useEditor({
  extensions: [
    StarterKit,
    Link,
    Image,
    TextAlign,
    TextStyle,
    Color,
    FontFamily
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const content = editor.getHTML();
    // Handle content updates
  }
});
```

## Troubleshooting

### Common Issues
1. **Discussion Not Loading**: Check database permissions and content status
2. **Comments Not Appearing**: Verify comment approval workflow
3. **Votes Not Counting**: Check user authentication and rate limits
4. **Search Not Working**: Verify search index configuration

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responses
3. Check database for content status
4. Validate user permissions

## Future Enhancements

### Planned Features
- Advanced content editor with more formatting options
- Real-time collaboration features
- Advanced search with filters
- Content recommendation engine
- Mobile-optimized interface
- Advanced moderation tools
- Community guidelines and policies
- Content archiving and backup 