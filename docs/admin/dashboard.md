# Admin Dashboard

## Overview

The Admin Dashboard provides comprehensive administrative control over the   Mockify platform. It offers tools for user management, content moderation, analytics, and system configuration. Access is restricted to users with admin privileges.

## Access Control

### Admin Authentication

- Admin access is controlled by the `is_admin` field in the `profiles` table
- Admin routes are protected with role-based access control
- Session validation ensures only authorized users can access admin features

### Admin Privileges

- Full access to all platform data
- User management and moderation capabilities
- Content approval and management
- System configuration and analytics
- Bulk operations and data export

## Dashboard Features

### Main Dashboard (`/admin`)

**Purpose**: Central admin interface with overview and quick actions

**Features**:

- System overview and statistics
- Recent activity feed
- Quick action buttons
- Navigation to admin modules
- Real-time notifications

**Key Components**:

- Statistics cards (users, content, revenue)
- Activity timeline
- Pending approvals queue
- System health indicators

### Dashboard Statistics

#### User Statistics

- Total registered users
- New users (last 7/30 days)
- Active users (last 7/30 days)
- User growth rate
- Profile completion rates

#### Content Statistics

- Total discussions
- Total reviews
- Total events
- Total jobs posted
- Content moderation queue

#### Platform Statistics

- Total points awarded
- Total rewards redeemed
- Marketplace transactions
- Training enrollments
- System performance metrics

## Admin Modules

### 1. User Management (`/admin/users`)

**Purpose**: Manage user accounts, profiles, and permissions

**Features**:

- User search and filtering
- Profile viewing and editing
- Account status management
- Admin role assignment
- User activity monitoring
- Bulk user operations

**Capabilities**:

- View complete user profiles
- Edit user information
- Suspend/activate accounts
- Assign/revoke admin privileges
- Export user data
- Monitor user activity

### 2. Content Moderation (`/admin/moderation`)

**Purpose**: Moderate user-generated content across the platform

**Features**:

- Discussion moderation
- Review moderation
- Comment moderation
- Report management
- Content approval workflow
- Automated moderation tools

**Moderation Actions**:

- Approve/reject content
- Edit content
- Delete content
- Warn users
- Suspend users
- Ban users

### 3. Job Management (`/admin/jobs`)

**Purpose**: Manage job listings and applications

**Features**:

- Job listing approval
- Application management
- Employer management
- Job statistics
- Bulk job operations

**Capabilities**:

- Approve/reject job postings
- Edit job details
- Manage applications
- Contact employers
- Generate job reports

### 4. Event Management (`/admin/events`)

**Purpose**: Manage events and registrations

**Features**:

- Event approval workflow
- Event editing and management
- Registration management
- Event analytics
- Notification management

**Capabilities**:

- Approve/reject events
- Edit event details
- Manage registrations
- Send event notifications
- Generate event reports

### 5. Training Management (`/admin/training`)

**Purpose**: Manage training programs and enrollments

**Features**:

- Program management
- Enrollment tracking
- Instructor management
- Course analytics
- Certificate management

**Capabilities**:

- Create/edit training programs
- Manage enrollments
- Track completion rates
- Generate certificates
- Analyze training effectiveness

### 6. Reviews Management (`/admin/reviews`)

**Purpose**: Moderate product and brand reviews

**Features**:

- Review approval workflow
- Product management
- Brand management
- Review analytics
- Quality control

**Capabilities**:

- Approve/reject reviews
- Edit review content
- Manage products/brands
- Monitor review quality
- Generate review reports

### 7. Rewards Management (`/admin/rewards`)

**Purpose**: Manage points system and rewards

**Features**:

- Points management
- Reward item management
- Transaction monitoring
- Leaderboard management
- Fraud detection

**Capabilities**:

- Award/revoke points
- Create/edit rewards
- Monitor transactions
- Manage leaderboards
- Detect fraudulent activity

### 8. Analytics & Reports (`/admin/analytics`)

**Purpose**: Platform analytics and reporting

**Features**:

- User analytics
- Content analytics
- Revenue analytics
- Performance metrics
- Custom reports

**Capabilities**:

- Generate user reports
- Analyze content performance
- Track revenue metrics
- Monitor system performance
- Export data for analysis

## API Endpoints

### Admin Authentication

#### `GET /api/admin/verify`

- **Purpose**: Verify admin privileges
- **Method**: GET
- **Authentication**: Required
- **Response**: Admin status and permissions

### User Management APIs

#### `GET /api/admin/users`

- **Purpose**: Get all users with pagination and filtering
- **Method**: GET
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `search`: Search term
  - `status`: User status filter
  - `role`: Admin role filter

#### `PUT /api/admin/users/[id]`

- **Purpose**: Update user information
- **Method**: PUT
- **Body**: User data object
- **Response**: Updated user data

#### `DELETE /api/admin/users/[id]`

- **Purpose**: Delete user account
- **Method**: DELETE
- **Response**: Success confirmation

### Content Moderation APIs

#### `GET /api/admin/moderation/queue`

- **Purpose**: Get pending content for moderation
- **Method**: GET
- **Query Parameters**:
  - `type`: Content type (discussions, reviews, etc.)
  - `status`: Moderation status

#### `POST /api/admin/moderation/approve`

- **Purpose**: Approve content
- **Method**: POST
- **Body**: Content approval data
- **Response**: Approval confirmation

#### `POST /api/admin/moderation/reject`

- **Purpose**: Reject content
- **Method**: POST
- **Body**: Rejection data with reason
- **Response**: Rejection confirmation

### Analytics APIs

#### `GET /api/admin/analytics/overview`

- **Purpose**: Get platform overview statistics
- **Method**: GET
- **Response**: Platform statistics

#### `GET /api/admin/analytics/users`

- **Purpose**: Get user analytics
- **Method**: GET
- **Query Parameters**:
  - `period`: Time period (7d, 30d, 90d)
  - `metric`: Specific metric to analyze

#### `GET /api/admin/analytics/content`

- **Purpose**: Get content analytics
- **Method**: GET
- **Query Parameters**:
  - `type`: Content type
  - `period`: Time period

## Database Tables

### Admin-Specific Tables

#### `admin_actions`

```sql
CREATE TABLE admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);
```

#### `moderation_queue`

```sql
CREATE TABLE moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES profiles(id),
  reason text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
```

#### `admin_logs`

```sql
CREATE TABLE admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);
```

## Security Features

### Access Control

- Role-based access control (RBAC)
- Session validation for admin routes
- IP-based access restrictions
- Audit logging for all admin actions

### Data Protection

- Encrypted sensitive data
- Secure API endpoints
- Input validation and sanitization
- CSRF protection

### Audit Trail

- Complete logging of admin actions
- User activity tracking
- System change history
- Compliance reporting

## Performance Optimization

### Data Loading

- Pagination for large datasets
- Efficient database queries
- Caching of frequently accessed data
- Lazy loading of admin modules

### Real-time Updates

- WebSocket connections for live updates
- Real-time notifications
- Live statistics updates
- Activity feed streaming

## Error Handling

### Common Issues

1. **Permission Denied**: Check admin privileges
2. **Data Not Found**: Verify record existence
3. **Validation Errors**: Check input data
4. **System Errors**: Check server logs

### Error Response Format

```json
{
  "error": "Permission denied",
  "code": "ADMIN_ACCESS_DENIED",
  "details": "User does not have admin privileges",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Verify admin access
const verifyAdmin = async () => {
  const response = await fetch('/api/admin/verify');
  const data = await response.json();
  return data.isAdmin;
};

// Get users with filtering
const getUsers = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/users?${params}`);
  return response.json();
};

// Approve content
const approveContent = async (contentId, contentType) => {
  const response = await fetch('/api/admin/moderation/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, contentType })
  });
  return response.json();
};
```

### Admin Actions

```typescript
// Update user role
const updateUserRole = async (userId, isAdmin) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_admin: isAdmin })
  });
  return response.json();
};

// Get analytics data
const getAnalytics = async (period) => {
  const response = await fetch(`/api/admin/analytics/overview?period=${period}`);
  return response.json();
};
```

## Future Possibilities

- Advanced analytics dashboard
- Automated moderation tools
- Bulk operations interface
- Real-time monitoring
- Advanced reporting tools
- Mobile admin interface
- API rate limiting management
- Advanced user segmentation
