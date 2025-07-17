# User Profile System

## Overview

The profile system in   Mockify provides comprehensive user profile management with multiple sections, completion tracking, and social networking features. Profile data is distributed across multiple database tables for optimal organization and performance.

## Features

### Profile Sections

- **Basic Details**: Personal information, contact details, avatar
- **Employment**: Work history, current position, skills
- **Certifications**: Professional certifications and credentials
- **Address**: Location and address information
- **Social Links**: Social media and professional network links
- **Education**: Educational background (not included in completion calculation)

### Profile Completion

- 5-section completion tracking (20% each)
- Real-time completion percentage updates
- Progress indicators and completion rewards

### Avatar Management

- Profile photo upload and management
- Custom file service integration (not Supabase storage)
- Image optimization and validation

## Page Functionality

### Profile Dashboard (`/profile`)

**Purpose**: Main profile management interface

**Features**:

- Tabbed interface for different profile sections
- Real-time completion tracking
- Avatar upload and management
- Social links management
- Points display and transaction history

**User Flow**:

1. User accesses profile dashboard
2. System loads all profile sections
3. User can edit any section via tabs
4. Changes are saved automatically
5. Completion percentage updates in real-time

**Key Components**:

- Profile completion card
- Tabbed layout for sections
- Avatar upload component
- Social links manager
- Points card integration

### Profile Sections

#### Basic Details Tab

- Full name, email, phone number
- Date of birth, gender
- Avatar upload and management
- Public profile toggle

#### Employment Tab

- Company name and designation
- Work location and status
- Experience details (years/months)
- Skills and salary information
- Notice period and employment type

#### Certifications Tab

- Certification name and completion ID
- Validity period and URL
- Multiple certification support

#### Address Tab

- Address line 1 and 2
- City, state, country, zip code
- Indian address toggle
- Location validation

#### Social Links Tab

- Platform selection (LinkedIn, Twitter, etc.)
- URL validation and management
- JSON data structure storage

## Backend Functionality

### Profile Data Structure

Profile data is distributed across multiple tables:

```sql
-- Main profile table
profiles (id, full_name, email, phone_code, phone_number, dob, gender, avatar_url, avc_id, is_public, is_admin, has_business_card)

-- Related tables
addresses (user_id, addressline1, addressline2, country, state, city, zip_code, is_indian)
employment (user_id, company_name, designation, company_email, location, work_status, total_experience_years, skills, notice_period)
certifications (user_id, name, completion_id, url, validity)
social_links (user_id, platform, url)
education (user_id, level, university, course, specialization, start_date, end_date)
profile_completion (user_id, basic_details, employment, certifications, address, social_links, completion_percentage)
```

### Profile Completion Calculation

Completion is calculated based on 5 sections (20% each):

```typescript
const completionPercentage = [
  basicDetails ? 20 : 0,
  employment ? 20 : 0,
  certifications ? 20 : 0,
  address ? 20 : 0,
  socialLinks ? 20 : 0
].reduce((sum, section) => sum + section, 0);
```

**Note**: Education section is not included in completion calculation.

### API Endpoints

#### `GET /api/profile`

- **Purpose**: Fetch complete user profile with all sections
- **Method**: GET
- **Authentication**: Required
- **Response**: Complete profile data with related records

#### `PUT /api/profile`

- **Purpose**: Update profile information
- **Method**: PUT
- **Authentication**: Required
- **Body**: Profile data object
- **Response**: Updated profile data

#### `POST /api/profile/avatar`

- **Purpose**: Upload and update profile avatar
- **Method**: POST
- **Authentication**: Required
- **Body**: FormData with image file
- **Response**: Updated avatar URL

#### `GET /api/profile/address`

- **Purpose**: Get user address information
- **Method**: GET
- **Authentication**: Required
- **Response**: Address data

#### `PUT /api/profile/address`

- **Purpose**: Update user address
- **Method**: PUT
- **Authentication**: Required
- **Body**: Address data
- **Response**: Updated address

#### `GET /api/profile/social-links`

- **Purpose**: Get user social links
- **Method**: GET
- **Authentication**: Required
- **Response**: Social links array

#### `PUT /api/profile/social-links`

- **Purpose**: Update user social links
- **Method**: PUT
- **Authentication**: Required
- **Body**: Social links array
- **Response**: Updated social links

### Data Validation

#### Profile Validation Rules

- Email: Required, valid email format, unique
- Full Name: Required, 2-100 characters
- Phone: Optional, valid format
- Date of Birth: Optional, valid date, not future
- Gender: Optional, predefined options

#### Address Validation

- Address Line 1: Required
- City: Required
- State: Required
- Country: Required
- Zip Code: Required, format validation

#### Employment Validation

- Company Name: Required
- Designation: Required
- Experience: Valid numeric values
- Skills: Optional, text field

#### Social Links Validation

- Platform: Required, predefined options
- URL: Required, valid URL format
- Platform-specific URL validation

## Database Schema

### Main Profile Table

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

### Address Table

```sql
CREATE TABLE addresses (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  addressline1 text,
  addressline2 text,
  country text,
  state text,
  city text,
  zip_code text,
  is_indian boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Employment Table

```sql
CREATE TABLE employment (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  company_name text,
  designation text,
  company_email text,
  location text,
  work_status text,
  total_experience_years integer,
  total_experience_months integer,
  current_salary text,
  skills text,
  notice_period text,
  expected_salary text,
  salary_frequency text,
  is_current_employment boolean,
  employment_type text,
  joining_year text,
  joining_month text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Profile Completion Table

```sql
CREATE TABLE profile_completion (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  basic_details boolean DEFAULT false,
  employment boolean DEFAULT false,
  certifications boolean DEFAULT false,
  address boolean DEFAULT false,
  social_links boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);
```

## File Upload System

### Avatar Management

- Uses custom file service (not Supabase storage)
- Image validation and optimization
- Secure file upload with size limits
- Avatar URL stored in `profiles.avatar_url`

### File Service Integration

```typescript
// File upload service
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

## Social Links Management

### Supported Platforms

- LinkedIn
- Twitter/X
- Facebook
- Instagram
- YouTube
- Website
- GitHub
- Portfolio

### Data Structure

```json
{
  "platform": "linkedin",
  "url": "https://linkedin.com/in/username"
}
```

### Storage Format

Social links are stored as JSON in the database for flexibility and easy querying.

## Integration Points

### Points System Integration

- Profile completion rewards
- Points display in profile dashboard
- Transaction history integration

### Directory Integration

- Public profile visibility
- Profile search and filtering
- Professional networking features

### Notification Integration

- Profile update notifications
- Completion milestone notifications
- Social activity notifications

## Security & Privacy

### Data Protection

- Personal information encryption
- Privacy controls for public profiles
- Secure file upload validation
- Input sanitization

### Access Control

- User can only edit their own profile
- Admin access for moderation
- Public profile visibility controls

## Performance Optimization

### Data Loading

- Lazy loading of profile sections
- Efficient database queries with joins
- Caching of profile data
- Optimized image delivery

### Update Optimization

- Incremental updates
- Optimistic UI updates
- Background sync for large changes

## Error Handling

### Common Issues

1. **File Upload Failures**: Size limits, format validation
2. **Validation Errors**: Clear error messages per field
3. **Network Errors**: Retry mechanisms
4. **Data Sync Issues**: Conflict resolution

### Error Response Format

```json
{
  "error": "Validation failed",
  "field": "email",
  "message": "Invalid email format",
  "code": "VALIDATION_ERROR"
}
```

## Usage Examples

### Fetching Profile Data

```typescript
const fetchProfile = async () => {
  const response = await fetch('/api/profile');
  const data = await response.json();
  return data.profile;
};
```

### Updating Profile Section

```typescript
const updateEmployment = async (employmentData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employment: employmentData })
  });
  return response.json();
};
```

### Uploading Avatar

```typescript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

## Troubleshooting

### Common Issues

1. **Profile Not Loading**: Check authentication and database permissions
2. **Avatar Not Uploading**: Verify file service configuration
3. **Completion Not Updating**: Check profile completion service
4. **Social Links Not Saving**: Validate JSON structure

## Debug Steps

1. Check browser console for errors
2. Verify API endpoint responses
3. Check database for data consistency
4. Validate file upload service

## Future Enhancements

### Planned Features

- Profile templates and themes
- Advanced privacy controls
- Profile analytics and insights
- Professional portfolio builder
- Profile verification badges
- Advanced search and filtering
- Profile import/export functionality
