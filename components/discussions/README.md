# Discussions Pin and Lock Features

This directory contains components and utilities for implementing pin and lock features for discussions in your Next.js application.

## Features

### 🔒 Discussion Locking
- Lock discussions to prevent new comments
- Visual indicators for locked discussions
- Disabled comment forms for locked discussions
- Admin/moderator controls to lock/unlock discussions

### 📌 Discussion Pinning
- Pin important discussions to the top
- Visual indicators for pinned discussions
- Automatic sorting with pinned discussions first
- Admin/moderator controls to pin/unpin discussions

## Components

### Core Components

#### `PinLockControls`
A reusable component for pin and lock controls with dropdown menu.

```tsx
import { PinLockControls } from '@/components/discussions/pin-lock-controls';

<PinLockControls
  discussionId="discussion-id"
  isPinned={true}
  isLocked={false}
  canPin={true}
  canLock={true}
  onPinToggle={handlePinToggle}
  onLockToggle={handleLockToggle}
/>
```

#### `EnhancedDiscussionItem`
Enhanced discussion item with pin and lock features.

```tsx
import { EnhancedDiscussionItem } from '@/components/discussions/enhanced-discussion-item';

<EnhancedDiscussionItem
  discussion={discussionData}
  canPin={userCanPin}
  canLock={userCanLock}
  onPinToggle={handlePinToggle}
  onLockToggle={handleLockToggle}
/>
```

#### `DiscussionsListWithModeration`
Complete discussions list with moderation features and filtering.

```tsx
import { DiscussionsListWithModeration } from '@/components/discussions/discussions-list-with-moderation';

<DiscussionsListWithModeration
  discussions={discussions}
  onRefresh={handleRefresh}
/>
```

#### `DiscussionHeaderWithModeration`
Discussion header with moderation controls for individual discussion pages.

```tsx
import { DiscussionHeaderWithModeration } from '@/components/discussions/discussion-header-with-moderation';

<DiscussionHeaderWithModeration
  discussion={discussionData}
  onRefresh={handleRefresh}
/>
```

#### `CommentFormWithLock`
Comment form that respects discussion lock status.

```tsx
import { CommentFormWithLock } from '@/components/discussions/comment-form-with-lock';

<CommentFormWithLock
  discussionId="discussion-id"
  isLocked={false}
  currentUser={currentUser}
  onSubmit={handleCommentSubmit}
/>
```

### Warning Components

#### `LockedDiscussionWarning`
Warning banner for locked discussions.

```tsx
import { LockedDiscussionWarning } from '@/components/discussions/pin-lock-controls';

<LockedDiscussionWarning />
```

## Hooks

### `useDiscussionModeration`
Custom hook for managing pin and lock operations.

```tsx
import { useDiscussionModeration } from '@/hooks/use-discussion-moderation';

const { togglePin, toggleLock, isLoading } = useDiscussionModeration({
  onSuccess: () => {
    // Refresh discussions after successful operation
  }
});
```

## API Routes

### Pin Discussion
`PATCH /api/discussions/[id]/pin`

```json
{
  "is_pinned": true
}
```

### Lock Discussion
`PATCH /api/discussions/[id]/lock`

```json
{
  "is_locked": true
}
```

## Database Schema

Make sure your `discussions` table includes these columns:

```sql
ALTER TABLE discussions 
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;
```

## Permissions

The pin and lock features require admin or moderator permissions. The components automatically check user roles:

- `admin`: Full access to pin and lock
- `moderator`: Full access to pin and lock
- `user`: Read-only access, can see pin/lock status

## Usage Examples

### Basic Implementation

```tsx
import { DiscussionsListWithModeration } from '@/components/discussions/discussions-list-with-moderation';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  
  const handleRefresh = () => {
    // Fetch updated discussions
    fetchDiscussions();
  };

  return (
    <DiscussionsListWithModeration
      discussions={discussions}
      onRefresh={handleRefresh}
    />
  );
}
```

### Individual Discussion Page

```tsx
import { DiscussionHeaderWithModeration } from '@/components/discussions/discussion-header-with-moderation';
import { CommentFormWithLock } from '@/components/discussions/comment-form-with-lock';

export default function DiscussionPage({ discussion }) {
  return (
    <div>
      <DiscussionHeaderWithModeration
        discussion={discussion}
        onRefresh={handleRefresh}
      />
      
      {/* Comments section */}
      <CommentFormWithLock
        discussionId={discussion.id}
        isLocked={discussion.is_locked}
        currentUser={currentUser}
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
}
```

## Styling

The components use Tailwind CSS classes and include:

- Yellow theme for pinned discussions
- Red theme for locked discussions
- Hover effects for moderation controls
- Responsive design
- Accessibility features

## Customization

You can customize the appearance by modifying the CSS classes or extending the components:

```tsx
// Custom styling
<EnhancedDiscussionItem
  discussion={discussion}
  className="custom-discussion-item"
  canPin={true}
  canLock={true}
  onPinToggle={handlePinToggle}
  onLockToggle={handleLockToggle}
/>
```

## Error Handling

The components include comprehensive error handling:

- API error responses
- Permission checks
- Loading states
- Toast notifications for success/error feedback

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Accessibility features for screen readers

## Contributing

When adding new features:

1. Follow the existing component patterns
2. Include proper TypeScript types
3. Add error handling
4. Include loading states
5. Test with different user roles
6. Update this README if needed 