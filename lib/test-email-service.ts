import { emailService } from './email-service'

/**
 * Test utility to verify email service integration
 */
export async function testEmailService() {
  try {
    console.log('🧪 Testing Email Service Integration...')
    
    // Test 1: Simple email
    console.log('\n1. Testing simple email...')
    const simpleResult = await emailService.sendEmail(
      'test@example.com',
      'Test Email from Mockify',
      '<h1>Hello!</h1><p>This is a test email from the Mockify email service.</p>'
    )
    console.log('✅ Simple email test result:', simpleResult)
    
    // Test 2: Email with variables
    console.log('\n2. Testing email with variables...')
    const variableResult = await emailService.sendEmail(
      'test@example.com',
      'Welcome {{name}} to {{program}}!',
      '<h1>Hello {{name}}!</h1><p>Welcome to {{program}}. Your journey begins now!</p>',
      {
        name: 'John Doe',
        program: 'Getting Started Program'
      }
    )
    console.log('✅ Variable email test result:', variableResult)
    
    // Test 3: Training notification email
    console.log('\n3. Testing training notification email...')
    const mockEnrollments = [
      {
        email: 'student1@example.com',
        full_name: 'Alice Johnson',
        id: 'enrollment-1'
      },
      {
        email: 'student2@example.com',
        full_name: 'Bob Smith',
        id: 'enrollment-2'
      }
    ]
    
    const trainingResult = await emailService.sendTrainingNotificationEmails(
      mockEnrollments,
      'Important Update: {{programTitle}}',
      'We have an important update regarding your training program. Please review the attached materials and prepare for the upcoming session.',
      'Professional Productivity Certification Program',
      'program-123'
    )
    console.log('✅ Training notification test result:', trainingResult)
    
    // Test 4: Bulk email with multiple recipients
    console.log('\n4. Testing bulk email with multiple recipients...')
    const bulkRecipients = [
      {
        email: 'bulk1@example.com',
        full_name: 'Charlie Brown',
        id: 'bulk-1'
      },
      {
        email: 'bulk2@example.com',
        full_name: 'Diana Prince',
        id: 'bulk-2'
      },
      {
        email: 'bulk3@example.com',
        full_name: 'Edward Norton',
        id: 'bulk-3'
      }
    ]
    
    const bulkResult = await emailService.sendTrainingNotificationEmails(
      bulkRecipients,
      'Bulk Test: {{programTitle}}',
      'This is a bulk email test to verify that multiple recipients receive personalized emails in a single API call.',
      'Bulk Testing Program',
      'bulk-program-456'
    )
    console.log('✅ Bulk email test result:', bulkResult)
    
    return {
      simple: simpleResult,
      variable: variableResult,
      training: trainingResult,
      bulk: bulkResult
    }
  } catch (error) {
    console.error('❌ Email service test failed:', error)
    throw error
  }
}

/**
 * Test training welcome email
 */
export async function testTrainingWelcomeEmail() {
  try {
    console.log('🧪 Testing Training Welcome Email...')
    
    const result = await emailService.sendTrainingWelcomeEmail(
      'newstudent@example.com',
      'Sarah Wilson',
      'Professional Productivity Certification Program',
      {
        startDate: 'January 15, 2024',
        duration: '8 weeks',
        instructor: 'Dr. Michael Johnson'
      }
    )
    
    console.log('✅ Welcome email test result:', result)
    return result
  } catch (error) {
    console.error('❌ Welcome email test failed:', error)
    throw error
  }
}

/**
 * Test training certificate email
 */
export async function testTrainingCertificateEmail() {
  try {
    console.log('🧪 Testing Training Certificate Email...')
    
    const result = await emailService.sendCertificateEmail(
      'graduate@example.com',
      'Michael Brown',
      'Professional Productivity Certification Program',
      'https://certificates.mockify.vercel.app/cert-12345.pdf',
      'December 20, 2024'
    )
    
    console.log('✅ Certificate email test result:', result)
    return result
  } catch (error) {
    console.error('❌ Certificate email test failed:', error)
    throw error
  }
}

/**
 * Test training reminder email
 */
export async function testTrainingReminderEmail() {
  try {
    console.log('🧪 Testing Training Reminder Email...')
    
    const mockRecipients = [
      {
        email: 'student1@example.com',
        full_name: 'Alice Johnson'
      },
      {
        email: 'student2@example.com',
        full_name: 'Bob Smith'
      }
    ]
    
    const result = await emailService.sendTrainingReminderEmail(
      mockRecipients,
      'Professional Productivity Certification Program',
      'Don\'t forget about tomorrow\'s session on Advanced Collaboration Techniques. Please bring your laptop and ensure you have the required software installed.',
      'January 22, 2024'
    )
    
    console.log('✅ Reminder email test result:', result)
    return result
  } catch (error) {
    console.error('❌ Reminder email test failed:', error)
    throw error
  }
}

/**
 * Test reward purchase email specifically
 */
export async function testRewardPurchaseEmail() {
  try {
    console.log('🧪 Testing Reward Purchase Email...')
    
    const result = await emailService.sendRewardPurchaseEmail(
      'test@example.com',
      'John Doe',
      'Premium Media Equipment',
      2,
      500,
      'order-123',
      new Date().toLocaleDateString()
    )
    
    console.log('✅ Reward purchase email test completed')
    return result
  } catch (error) {
    console.error('❌ Reward purchase email test failed:', error)
    throw error
  }
}

/**
 * Test eKart order email specifically
 */
export async function testEkartOrderEmail() {
  try {
    console.log('🧪 Testing eKart Order Email...')
    
    const mockOrderItems = [
      {
        productName: 'Professional Microphone',
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500
      },
      {
        productName: 'Mockify Interface',
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500
      }
    ]
    
    const result = await emailService.sendEkartOrderEmail(
      'test@example.com',
      'John Doe',
      'ORD-2024-001',
      mockOrderItems,
      6000,
      '123 Main Street, City, State 12345',
      new Date().toLocaleDateString()
    )
    
    console.log('✅ eKart order email test completed')
    return result
  } catch (error) {
    console.error('❌ eKart order email test failed:', error)
    throw error
  }
}