# Careers API Documentation

## Overview

The Careers API manages job postings, applications, and career opportunities in the   industry. It provides endpoints for job seekers and employers to post, search, and apply for positions with advanced filtering and matching capabilities.

## Base URL

```
/api/jobs
```

## Authentication

Most endpoints require authentication. Include the session token in the request headers.

## Endpoints

### 1. Get Jobs

**Endpoint**: `GET /api/jobs`

**Description**: Fetch job postings with filtering, pagination, and sorting options.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of jobs to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status - "active", "closed", "draft"
- `category_id` (optional): Filter by job category UUID
- `experience_level` (optional): Filter by experience level - "entry", "mid", "senior", "executive"
- `job_type` (optional): Filter by job type - "full_time", "part_time", "contract", "freelance"
- `location` (optional): Filter by location (city, state, or country)
- `remote` (optional): Filter by remote work - "on_site", "hybrid", "remote"
- `search` (optional): Search term for title, description, and company
- `salary_min` (optional): Minimum salary filter
- `salary_max` (optional): Maximum salary filter
- `sort_by` (optional): Sort order - "date", "salary", "relevance" (default: "date")
- `featured` (optional): Filter featured jobs only (true/false)

**Response**:
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior   Engineer",
      "description": "We are seeking a senior   engineer...",
      "company_id": "uuid",
      "company": {
        "id": "uuid",
        "name": "  Solutions Inc",
        "logo_url": "https://example.com/logo.png",
        "location": "New York, NY"
      },
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Engineering",
        "slug": "engineering"
      },
      "experience_level": "senior",
      "job_type": "full_time",
      "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "remote": "hybrid"
      },
      "salary": {
        "min": 80000,
        "max": 120000,
        "currency": "USD",
        "period": "yearly"
      },
      "requirements": [
        "5+ years   experience",
        "CTS certification",
        "Project management skills"
      ],
      "benefits": [
        "Health insurance",
        "401k matching",
        "Professional development"
      ],
      "status": "active",
      "featured": true,
      "application_count": 25,
      "views_count": 150,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "expires_at": "2024-03-01T00:00:00Z"
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

### 2. Create Job

**Endpoint**: `POST /api/jobs`

**Description**: Create a new job posting (employer or admin only).

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Senior   Engineer",
  "description": "We are seeking a senior   engineer...",
  "company_id": "uuid",
  "category_id": "uuid",
  "experience_level": "senior",
  "job_type": "full_time",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "remote": "hybrid"
  },
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD",
    "period": "yearly"
  },
  "requirements": [
    "5+ years   experience",
    "CTS certification",
    "Project management skills"
  ],
  "benefits": [
    "Health insurance",
    "401k matching",
    "Professional development"
  ],
  "featured": false,
  "expires_at": "2024-03-01T00:00:00Z"
}
```

**Response**:
```json
{
  "job": {
    "id": "uuid",
    "title": "Senior   Engineer",
    "description": "We are seeking a senior   engineer...",
    "company_id": "uuid",
    "category_id": "uuid",
    "experience_level": "senior",
    "job_type": "full_time",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "remote": "hybrid"
    },
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD",
      "period": "yearly"
    },
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Job created successfully"
}
```

### 3. Get Single Job

**Endpoint**: `GET /api/jobs/[id]`

**Description**: Fetch a single job with full details and application status.

**Authentication**: Required

**Response**:
```json
{
  "job": {
    "id": "uuid",
    "title": "Senior   Engineer",
    "description": "We are seeking a senior   engineer...",
    "company_id": "uuid",
    "company": {
      "id": "uuid",
      "name": "  Solutions Inc",
      "logo_url": "https://example.com/logo.png",
      "description": "Leading   solutions provider",
      "website": "https://avsolutions.com",
      "location": "New York, NY"
    },
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Engineering",
      "slug": "engineering"
    },
    "experience_level": "senior",
    "job_type": "full_time",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "remote": "hybrid"
    },
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD",
      "period": "yearly"
    },
    "requirements": [
      "5+ years   experience",
      "CTS certification",
      "Project management skills"
    ],
    "benefits": [
      "Health insurance",
      "401k matching",
      "Professional development"
    ],
    "status": "active",
    "featured": true,
    "application_count": 25,
    "views_count": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-03-01T00:00:00Z"
  },
  "user_application": {
    "status": "applied",
    "application_date": "2024-01-15T10:30:00Z",
    "cover_letter": "I am excited to apply...",
    "resume_url": "https://example.com/resume.pdf"
  },
  "related_jobs": [
    {
      "id": "uuid",
      "title": "  Project Manager",
      "company": "  Solutions Inc",
      "location": "New York, NY"
    }
  ]
}
```

### 4. Update Job

**Endpoint**: `PUT /api/jobs/[id]`

**Description**: Update an existing job posting (employer or admin only).

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Updated Job Title",
  "description": "Updated job description...",
  "salary": {
    "min": 90000,
    "max": 130000,
    "currency": "USD",
    "period": "yearly"
  },
  "featured": true
}
```

**Response**:
```json
{
  "job": {
    "id": "uuid",
    "title": "Updated Job Title",
    "description": "Updated job description...",
    "salary": {
      "min": 90000,
      "max": 130000,
      "currency": "USD",
      "period": "yearly"
    },
    "featured": true,
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Job updated successfully"
}
```

### 5. Delete Job

**Endpoint**: `DELETE /api/jobs/[id]`

**Description**: Delete a job posting (employer or admin only).

**Authentication**: Required

**Response**:
```json
{
  "message": "Job deleted successfully"
}
```

## Job Applications

### 6. Apply for Job

**Endpoint**: `POST /api/jobs/[id]/apply`

**Description**: Apply for a job posting.

**Authentication**: Required

**Request Body**:
```json
{
  "cover_letter": "I am excited to apply for this position...",
  "resume_url": "https://example.com/resume.pdf",
  "portfolio_url": "https://example.com/portfolio",
  "references": [
    {
      "name": "John Smith",
      "title": "Manager",
      "company": "Previous Company",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  ],
  "availability": "immediate",
  "salary_expectation": 100000
}
```

**Response**:
```json
{
  "application": {
    "id": "uuid",
    "job_id": "uuid",
    "user_id": "uuid",
    "status": "applied",
    "cover_letter": "I am excited to apply for this position...",
    "resume_url": "https://example.com/resume.pdf",
    "portfolio_url": "https://example.com/portfolio",
    "references": [
      {
        "name": "John Smith",
        "title": "Manager",
        "company": "Previous Company",
        "email": "john@example.com"
      }
    ],
    "availability": "immediate",
    "salary_expectation": 100000,
    "application_date": "2024-01-15T10:30:00Z"
  },
  "message": "Application submitted successfully"
}
```

### 7. Get My Applications

**Endpoint**: `GET /api/jobs/applications`

**Description**: Get user's job applications.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of applications (default: 10, max: 50)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status - "applied", "reviewing", "interviewing", "offered", "rejected"

**Response**:
```json
{
  "applications": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Senior   Engineer",
        "company": {
          "id": "uuid",
          "name": "  Solutions Inc",
          "logo_url": "https://example.com/logo.png"
        }
      },
      "status": "applied",
      "application_date": "2024-01-15T10:30:00Z",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 8. Get Job Applications (Employer)

**Endpoint**: `GET /api/jobs/[id]/applications`

**Description**: Get all applications for a job (employer only).

**Authentication**: Required (Employer)

**Query Parameters**:
- `limit` (optional): Number of applications (default: 20, max: 100)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status
- `search` (optional): Search by applicant name or email

**Response**:
```json
{
  "applications": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "user_id": "uuid",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "status": "applied",
      "cover_letter": "I am excited to apply...",
      "resume_url": "https://example.com/resume.pdf",
      "application_date": "2024-01-15T10:30:00Z",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  },
  "summary": {
    "total_applications": 25,
    "status_breakdown": {
      "applied": 15,
      "reviewing": 5,
      "interviewing": 3,
      "offered": 1,
      "rejected": 1
    }
  }
}
```

### 9. Update Application Status

**Endpoint**: `PUT /api/jobs/[id]/applications/[applicationId]`

**Description**: Update application status (employer only).

**Authentication**: Required (Employer)

**Request Body**:
```json
{
  "status": "interviewing",
  "notes": "Candidate shows strong technical skills",
  "next_steps": "Schedule technical interview"
}
```

**Response**:
```json
{
  "application": {
    "id": "uuid",
    "status": "interviewing",
    "notes": "Candidate shows strong technical skills",
    "next_steps": "Schedule technical interview",
    "updated_at": "2024-01-16T14:30:00Z"
  },
  "message": "Application status updated successfully"
}
```

## Job Categories

### 10. Get Job Categories

**Endpoint**: `GET /api/jobs/categories`

**Description**: Get all job categories.

**Authentication**: Not required

**Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Engineering",
      "slug": "engineering",
      "description": "Engineering positions",
      "icon": "wrench",
      "color": "#3B82F6",
      "job_count": 45,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Experience Levels

### 11. Get Experience Levels

**Endpoint**: `GET /api/experience-levels`

**Description**: Get all experience levels.

**Authentication**: Not required

**Response**:
```json
{
  "experience_levels": [
    {
      "id": "uuid",
      "name": "entry",
      "display_name": "Entry Level",
      "description": "0-2 years experience",
      "min_years": 0,
      "max_years": 2
    },
    {
      "id": "uuid",
      "name": "mid",
      "display_name": "Mid Level",
      "description": "3-5 years experience",
      "min_years": 3,
      "max_years": 5
    },
    {
      "id": "uuid",
      "name": "senior",
      "display_name": "Senior Level",
      "description": "6+ years experience",
      "min_years": 6,
      "max_years": null
    }
  ]
}
```

## Job Types

### 12. Get Job Types

**Endpoint**: `GET /api/job-types`

**Description**: Get all job types.

**Authentication**: Not required

**Response**:
```json
{
  "job_types": [
    {
      "id": "uuid",
      "name": "full_time",
      "display_name": "Full Time",
      "description": "Full-time employment"
    },
    {
      "id": "uuid",
      "name": "part_time",
      "display_name": "Part Time",
      "description": "Part-time employment"
    },
    {
      "id": "uuid",
      "name": "contract",
      "display_name": "Contract",
      "description": "Contract-based work"
    },
    {
      "id": "uuid",
      "name": "freelance",
      "display_name": "Freelance",
      "description": "Freelance opportunities"
    }
  ]
}
```

## Locations

### 13. Get Locations

**Endpoint**: `GET /api/locations`

**Description**: Get available job locations.

**Authentication**: Not required

**Query Parameters**:
- `search` (optional): Search term for city, state, or country
- `limit` (optional): Number of locations (default: 20, max: 100)

**Response**:
```json
{
  "locations": [
    {
      "id": "uuid",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "job_count": 25,
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  ]
}
```

## Job Analytics

### 14. Get Job Analytics (Employer)

**Endpoint**: `GET /api/jobs/[id]/analytics`

**Description**: Get analytics for a job posting (employer only).

**Authentication**: Required (Employer)

**Response**:
```json
{
  "analytics": {
    "overview": {
      "total_views": 500,
      "total_applications": 25,
      "conversion_rate": 5.0,
      "average_application_quality": 7.5
    },
    "views": {
      "daily": [
        {
          "date": "2024-01-01",
          "count": 25
        }
      ],
      "sources": {
        "search": 300,
        "direct": 100,
        "social": 50,
        "email": 50
      }
    },
    "applications": {
      "daily": [
        {
          "date": "2024-01-01",
          "count": 3
        }
      ],
      "by_experience": {
        "entry": 5,
        "mid": 10,
        "senior": 10
      }
    },
    "demographics": {
      "locations": [
        {
          "city": "New York",
          "count": 10,
          "percentage": 40.0
        }
      ]
    }
  }
}
```

## Job Test

### 15. Test Job Application

**Endpoint**: `POST /api/jobs/test`

**Description**: Test job application flow (admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "job_id": "uuid",
  "user_id": "uuid",
  "test_scenario": "successful_application"
}
```

**Response**:
```json
{
  "test_result": {
    "scenario": "successful_application",
    "status": "passed",
    "application_id": "uuid",
    "execution_time": "200ms",
    "details": "Application flow completed successfully"
  }
}
```

## Data Validation

### Job Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | 5-100 characters |
| `description` | string | Yes | 50-5000 characters |
| `company_id` | uuid | Yes | Valid company UUID |
| `category_id` | uuid | Yes | Valid category UUID |
| `experience_level` | string | Yes | Valid experience level |
| `job_type` | string | Yes | Valid job type |
| `location` | object | Yes | Valid location object |
| `salary` | object | No | Valid salary object |
| `requirements` | array | No | Array of strings |
| `benefits` | array | No | Array of strings |

### Application Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `cover_letter` | string | Yes | 100-2000 characters |
| `resume_url` | string | Yes | Valid URL |
| `portfolio_url` | string | No | Valid URL |
| `references` | array | No | Array of reference objects |
| `availability` | string | No | "immediate", "2_weeks", "1_month", "3_months" |
| `salary_expectation` | number | No | Positive number |

## Error Codes

| Code | Description |
|------|-------------|
| `JOB_NOT_FOUND` | Job does not exist |
| `JOB_CLOSED` | Job is no longer accepting applications |
| `APPLICATION_EXISTS` | User already applied for this job |
| `INVALID_APPLICATION` | Invalid application data |
| `INSUFFICIENT_PERMISSIONS` | Employer permission required |
| `COMPANY_NOT_FOUND` | Company does not exist |
| `CATEGORY_NOT_FOUND` | Job category not found |
| `APPLICATION_FAILED` | Application processing failed |

## Rate Limiting

- Job creation: 10 per hour
- Job applications: 5 per hour
- Job views: 100 per minute
- API calls: 200 per minute

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get jobs with filtering
const getJobs = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/jobs?${params}`);
  return response.json();
};

// Create new job
const createJob = async (jobData) => {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  return response.json();
};

// Apply for job
const applyForJob = async (jobId, applicationData) => {
  const response = await fetch(`/api/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData)
  });
  return response.json();
};

// Get my applications
const getMyApplications = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/jobs/applications?${params}`);
  return response.json();
};

// Update application status (employer)
const updateApplicationStatus = async (jobId, applicationId, statusData) => {
  const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get jobs
curl -X GET "https://your-domain.com/api/jobs?status=active&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create job
curl -X POST "https://your-domain.com/api/jobs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "  Engineer",
    "description": "We are seeking an   engineer...",
    "company_id": "company-uuid",
    "category_id": "category-uuid",
    "experience_level": "mid",
    "job_type": "full_time",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    }
  }'

# Apply for job
curl -X POST "https://your-domain.com/api/jobs/job-uuid/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cover_letter": "I am excited to apply...",
    "resume_url": "https://example.com/resume.pdf"
  }'
```

## Notes

1. **Job Status**: Jobs can be draft, active, or closed with automatic expiration.

2. **Application Tracking**: Full application lifecycle tracking with status updates.

3. **Resume Management**: Secure resume upload and storage for applications.

4. **Employer Dashboard**: Comprehensive analytics and application management.

5. **Location Support**: Full address and coordinate support for job locations.

6. **Salary Ranges**: Flexible salary range support with currency and period options.

7. **Remote Work**: Support for on-site, hybrid, and remote work arrangements.

8. **Application Limits**: Users can only apply once per job posting. 