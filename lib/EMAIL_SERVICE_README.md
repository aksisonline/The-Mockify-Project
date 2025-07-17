# Email Service Integration for Training Notifications

This document explains how the mockify training system now uses the dedicated   Mail Server for sending email notifications to training participants.

## Overview

The training notification system has been updated to send emails via SMTP using the   Mail Server API instead of storing notifications in the database. This is more appropriate for training participants who are not registered users of the platform.

## Key Changes

### 1. Email Service (`lib/email-service.ts`)

A new email service class that integrates with the   Mail Server API:

```typescript
import { emailService } from '@/lib/email-service'

// Send a simple email
await emailService.sendEmail(
  'student@example.com',
  'Welcome to {{programTitle}}',
  '<h1>Hello {{studentName}}!</h1>',
  { programTitle: '  Training', studentName: 'John' }
)

// Send training notifications
await emailService.sendTrainingNotificationEmails(
  enrollments,
  subject,
  message,
  programTitle
)
```

### 2. Updated Training Notification Flow

The `sendTrainingNotification` function now:
- Fetches enrollment details from the database
- Uses the email service to send professional HTML emails
- Returns email delivery results instead of database notification IDs

### 3. Professional Email Templates

Four pre-built email templates:
- **Training Notifications**: General updates and announcements
- **Welcome Emails**: New enrollment confirmations
- **Certificate Emails**: Course completion certificates
- **Reminder Emails**: Upcoming session reminders

## API Usage

### Send Training Notifications

```bash
POST /api/training/notifications/send
Content-Type: application/json

{
  "subject": "Important Update: {{programTitle}}",
  "message": "Your training session has been rescheduled...",
  "programId": "uuid-here",
  "enrollmentIds": ["enrollment-1", "enrollment-2"]
}
```

**Response:**
```json
{
  "message": "Successfully sent email notifications to 2 training participants",
  "emailsSent": 2,
  "programTitle": "Professional   Certification",
  "recipients": [
    { "email": "student1@example.com", "name": "John Doe" },
    { "email": "student2@example.com", "name": "Jane Smith" }
  ],
  "success": true
}
```

### Test Email Service

```bash
POST /api/training/notifications/test
Content-Type: application/json

{
  "testType": "all" // or "welcome", "certificate", "reminder"
}
```

## Email Templates

### 1. Training Notification Template
- Professional gradient header with mockify branding
- Highlighted message section
- Call-to-action button to training portal
- Support contact information

### 2. Welcome Email Template
- Green gradient for positive welcome feeling
- Program details section
- Step-by-step onboarding instructions
- Training portal access button

### 3. Certificate Email Template
- Gold gradient for achievement celebration
- Certificate download button
- LinkedIn sharing tip
- Achievement summary

### 4. Reminder Email Template
- Blue gradient for informational tone
- Highlighted reminder message
- Date/time information
- Training details access

## Variable Templating

All emails support dynamic variables using `{{variableName}}` syntax:

```typescript
// Global variables (applied to all recipients)
{
  companyName: 'mockify',
  supportEmail: 'support@mockify.vercel.app',
  year: 2024
}

// Individual variables (per recipient)
{
  name: 'John Doe',
  studentName: 'John Doe',
  programTitle: 'Professional   Certification',
  enrollmentId: 'enrollment-123'
}
```

## Error Handling

The email service provides detailed error messages:

- **No enrollments found**: Invalid enrollment IDs
- **Email API error**:   Mail Server connectivity issues
- **Authentication required**: Missing or invalid admin access
- **Validation errors**: Missing required fields

## Benefits

### For Training Participants
- Professional, branded email communications
- Mobile-responsive email templates
- Clear call-to-action buttons
- Consistent messaging across all training communications

### For Administrators
- Reliable email delivery via dedicated SMTP server
- Detailed delivery reports
- Easy template customization
- Batch email processing

### For System Performance
- Reduced database load (no notification storage for non-users)
- Faster email delivery via dedicated mail server
- Better email deliverability rates
- Proper separation of concerns

## Testing

Use the test endpoint to verify email functionality:

```bash
# Test all email types
curl -X POST /api/training/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "all"}'

# Test specific email type
curl -X POST /api/training/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "welcome"}'
```

## Configuration

The email service connects to the   Mail Server at:
- **API URL**: `https://api.mockify.vercel.app/mail`
- **Method**: POST
- **Content-Type**: application/json

No additional configuration is required as the SMTP settings are managed by the   Mail Server.

## Migration Notes

### Before (Database Notifications)
- Created notification records in the database
- Required user accounts for recipients
- Limited email formatting options
- Manual email sending process

### After (Email Service)
- Direct email delivery via SMTP
- No user account requirement
- Professional HTML templates
- Automated email processing

## Future Enhancements

Potential improvements to consider:
- Email template customization interface
- Delivery status tracking
- Email scheduling capabilities
- A/B testing for email templates
- Integration with email analytics platforms 