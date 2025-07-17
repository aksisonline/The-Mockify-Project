# Authentication & User Management

## Overview

The authentication system in   Mockify uses Supabase Auth for secure user authentication and session management. It supports email/password authentication and OTP-based verification.

## Features

### User Registration & Login
- Email/password registration
- OTP-based email verification
- Secure session management
- Automatic profile initialization

### Session Management
- Persistent sessions across browser sessions
- Automatic token refresh
- Secure logout functionality

## Page Functionality

### Login Page (`/login`)

**Purpose**: Main authentication entry point for users

**Features**:
- Email/password login form
- OTP verification for new users
- Error handling and validation
- Redirect to dashboard after successful login

**User Flow**:
1. User enters email and password
2. System validates credentials via Supabase Auth
3. If new user, OTP verification is sent
4. User completes verification and is redirected to profile setup
5. Existing users are redirected to dashboard

**Key Components**:
- Login form with validation
- OTP verification modal
- Error message display
- Loading states

### Root Page (`/`)

**Purpose**: Handles authentication verification and redirects

**Features**:
- Token verification from URL parameters
- Automatic session establishment
- User initialization for new accounts
- Redirect to appropriate page based on user state

**User Flow**:
1. Checks for verification tokens in URL
2. Verifies tokens with Supabase
3. Establishes user session
4. Initializes user data if new account
5. Redirects to profile or dashboard

## Backend Functionality

### Authentication Flow

1. **Registration**:
   ```typescript
   // User signs up with email/password
   const { data, error } = await supabase.auth.signUp({
     email: userEmail,
     password: userPassword
   })
   ```

2. **Email Verification**:
   ```typescript
   // Verify OTP token
   const { data, error } = await supabase.auth.verifyOtp({
     token_hash: token,
     type: 'email'
   })
   ```

3. **Session Management**:
   ```typescript
   // Set session after verification
   await supabase.auth.setSession({
     access_token: data.session.access_token,
     refresh_token: data.session.refresh_token
   })
   ```

### User Initialization

When a new user completes authentication, the system automatically:

1. **Creates Profile Record**:
   - Basic profile in `profiles` table
   - Links to user's auth ID

2. **Initializes Related Records**:
   - Empty employment record
   - Empty address record
   - Empty education record
   - Notification settings with defaults
   - Points record with 0 balance

3. **Awards Welcome Points**:
   - 10 points for profile creation
   - Points category: "general"

4. **Updates Profile Completion**:
   - Calculates initial completion percentage
   - Sets up completion tracking

### API Endpoints

#### `GET /api/auth/set-session`
- **Purpose**: Set user session from verification token
- **Method**: GET
- **Parameters**: 
  - `token`: Verification token
  - `type`: Token type (email, etc.)
  - `redirect_to`: Redirect URL after verification
- **Response**: Redirects to specified page or dashboard

## Database Tables

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

### Related Tables
- `addresses`: User address information
- `employment`: Employment details
- `education`: Educational background
- `certifications`: Professional certifications
- `social_links`: Social media links
- `points`: Points balance and history
- `profile_completion`: Profile completion tracking
- `notification_settings`: User notification preferences

## Security Features

### Session Security
- JWT tokens with expiration
- Automatic token refresh
- Secure token storage
- CSRF protection

### Data Protection
- Password hashing (handled by Supabase)
- Email verification required
- Rate limiting on auth endpoints
- Input validation and sanitization

## Error Handling

### Common Error Scenarios
1. **Invalid Credentials**: Clear error message
2. **Email Not Verified**: Redirect to verification
3. **Account Locked**: Admin contact information
4. **Network Errors**: Retry mechanism

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional information"
}
```

## Integration Points

### Frontend Integration
- React Context for auth state
- Protected route components
- Automatic redirect handling
- Loading states and error display

### Backend Integration
- Supabase client configuration
- API route protection
- User session validation
- Profile data synchronization

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Configuration
- Auth settings in Supabase dashboard
- Email templates for verification
- Password policies
- Session timeout settings

## Usage Examples

### Protecting API Routes
```typescript
export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Protected logic here
}
```

### Client-Side Auth Check
```typescript
const { user, loading } = useAuth()

if (loading) return <LoadingSpinner />
if (!user) return <LoginPrompt />

// Authenticated content
```

## Troubleshooting

### Common Issues
1. **Session Expired**: Clear localStorage and redirect to login
2. **Verification Failed**: Check email and token validity
3. **Profile Not Created**: Check database permissions and initialization logic
4. **Points Not Awarded**: Verify points service configuration

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection
3. Check database logs for initialization errors
4. Validate environment variables

## Future Enhancements

### Planned Features
- OAuth integration (Google, GitHub)
- Multi-factor authentication
- Social login options
- Account recovery options
- Session management dashboard

### Security Improvements
- Advanced rate limiting
- Device fingerprinting
- Suspicious activity detection
- Enhanced audit logging 