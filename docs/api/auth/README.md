# Authentication API Documentation

## Overview

The Authentication API provides secure user authentication and session management for the   Mockify platform. It uses Supabase Auth for authentication and supports email/password authentication with OTP verification.

## Base URL

```
/api/auth
```

## Authentication

Most endpoints require valid session tokens or authentication credentials. The API uses Supabase Auth for secure authentication management.

## Endpoints

### 1. Session Management

#### Set Session

**Endpoint**: `POST /api/auth/set-session`

**Description**: Set user session from authentication tokens.

**Authentication**: Not required (used for initial session setup)

**Request Body**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true
}
```

#### Clear Session

**Endpoint**: `DELETE /api/auth/set-session`

**Description**: Clear user session and sign out.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true
}
```

### 2. Authentication Flow

#### Email Verification

**Endpoint**: `GET /auth/callback`

**Description**: Handle email verification callback from Supabase Auth.

**Authentication**: Not required

**Query Parameters**:
- `token`: Verification token from email
- `type`: Token type (email, recovery, etc.)
- `redirect_to`: Redirect URL after verification

**Response**: Redirects to specified page or dashboard

#### OTP Verification

**Endpoint**: `POST /auth/verify-otp`

**Description**: Verify one-time password for email verification.

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "123456",
  "type": "email"
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1640995200
  }
}
```

## Authentication Flow

### 1. User Registration

```typescript
// 1. User signs up with email/password
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword
})

// 2. Verification email is sent automatically
// 3. User clicks verification link in email
// 4. System handles verification callback
```

### 2. Email Verification

```typescript
// 1. User receives verification email
// 2. Clicks verification link
// 3. System processes verification token
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: token,
  type: 'email'
})

// 4. Session is established
await supabase.auth.setSession({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token
})
```

### 3. User Initialization

When a new user completes authentication, the system automatically:

1. **Creates Profile Record**:
   ```sql
   INSERT INTO profiles (id, email, created_at)
   VALUES (user_id, user_email, NOW())
   ```

2. **Initializes Related Records**:
   - Empty employment record
   - Empty address record
   - Empty education record
   - Notification settings with defaults
   - Points record with 0 balance

3. **Awards Welcome Points**:
   ```sql
   INSERT INTO points_transactions (user_id, amount, reason, category)
   VALUES (user_id, 10, 'Welcome bonus', 'general')
   ```

4. **Updates Profile Completion**:
   - Calculates initial completion percentage
   - Sets up completion tracking

## Session Management

### Session Validation

The system validates sessions using multiple methods:

1. **Server-side Session Check**:
   ```typescript
   const session = await getSession()
   if (!session) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }
   ```

2. **Client-side Session Check**:
   ```typescript
   const { data: { user }, error } = await supabase.auth.getUser()
   if (error || !user) {
     // Handle unauthenticated state
   }
   ```

### Session Refresh

Sessions are automatically refreshed when needed:

```typescript
// Force refresh the session
export async function refreshAuthSession() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.refreshSession()
  
  if (error) {
    console.error("Session refresh error:", error)
    return { session: null, error }
  }

  return { session, error: null }
}
```

## Middleware Protection

The application uses middleware to protect routes:

```typescript
// Protected routes configuration
const protectedRoutes: ProtectedRoutes = {
  "/profile": ["/profile/dashboard", "/profile/settings"],
  "/tools": ["/tools/list", "/tools/categories"],
  "/directory": ["/directory/list", "/directory/categories"],
  "/admin": ["/admin/dashboard", "/admin/users"],
  "/rewards": ["/rewards/list", "/rewards/categories"],
  "/ekart": ["/ekart/products", "/ekart/categories"]
}

// Middleware checks
if ((isProtectedRoute || isAdminRoute) && !session?.user) {
  return redirectToLogin(req)
}
```

## Data Validation

### Token Validation Rules

- **access_token**: Required, valid JWT format
- **refresh_token**: Required, valid JWT format
- **token**: Required for OTP verification, 6-digit numeric
- **type**: Must be "email", "recovery", or "signup"

### Session Validation Rules

- **Session expiry**: Automatically checked and refreshed
- **User existence**: Verified against auth.users table
- **Profile completion**: Checked for new users

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing or invalid tokens |
| `401` | Unauthorized - Invalid or expired session |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - User or session not found |
| `500` | Internal Server Error - Authentication service error |

## Security Features

### Session Security

- **HTTP-only cookies**: Session tokens stored in secure cookies
- **Automatic refresh**: Sessions refreshed before expiry
- **Secure headers**: CSRF protection and secure cookie settings
- **Token validation**: JWT signature verification

### Authentication Security

- **Password requirements**: Minimum strength requirements
- **Rate limiting**: Prevents brute force attacks
- **Email verification**: Required for account activation
- **Session invalidation**: Proper logout and session cleanup

### Data Protection

- **Encrypted storage**: Sensitive data encrypted at rest
- **Input validation**: All inputs validated and sanitized
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Output encoding and CSP headers

## Usage Examples

### JavaScript/TypeScript

```typescript
// Set session from tokens
const setSession = async (accessToken: string, refreshToken: string) => {
  const response = await fetch('/api/auth/set-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
  });
  return response.json();
};

// Clear session (logout)
const clearSession = async () => {
  const response = await fetch('/api/auth/set-session', {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};

// Verify OTP
const verifyOTP = async (token: string, type: string) => {
  const response = await fetch('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, type })
  });
  return response.json();
};

// Get current session
const getCurrentSession = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { session: user, error };
};
```

### cURL Examples

```bash
# Set session
curl -X POST "https://mockify.vercel.app/api/auth/set-session" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Clear session
curl -X DELETE "https://mockify.vercel.app/api/auth/set-session" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Verify OTP
curl -X POST "https://mockify.vercel.app/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "type": "email"
  }'
```

## Database Tables

### `auth.users` (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Contains user authentication data
-- Includes email, password hash, email verification status
```

### `profiles`
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  email text UNIQUE,
  phone_code text,
  phone_number text,
  dob date,
  gender text,
  avatar_url text,
  avc_id character varying UNIQUE,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  has_business_card boolean DEFAULT false
);
```

## Features

### User Management
- Email/password registration
- OTP-based email verification
- Secure session management
- Automatic profile initialization

### Session Management
- Persistent sessions across browser sessions
- Automatic token refresh
- Secure logout functionality
- Session validation middleware

### Security
- JWT-based authentication
- Secure cookie storage
- CSRF protection
- Rate limiting
- Input validation

## Notes

- All authentication is handled through Supabase Auth
- Sessions are automatically refreshed before expiry
- New users receive welcome points upon profile creation
- Email verification is required for account activation
- Admin routes require additional role verification
- Session tokens are stored in HTTP-only cookies for security 