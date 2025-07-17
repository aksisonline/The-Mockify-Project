import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { testEmailService, testTrainingWelcomeEmail, testTrainingCertificateEmail, testTrainingReminderEmail, testRewardPurchaseEmail, testEkartOrderEmail } from "@/lib/test-email-service"
import { emailService } from "@/lib/email-service"

// Test function for training enrollment status emails
async function testTrainingStatusEmails() {
  // console.log('\n4. Testing training enrollment status emails...')
  
  const mockEnrollment = {
    email: 'test@example.com',
    full_name: 'Test Student',
    id: 'test-enrollment-123'
  }
  
  const programTitle = 'Professional Media Certification Program'
  const programId = 'test-program-456'
  
  // Test pending status email
  // console.log('Testing pending status email...')
  const pendingResult = await emailService.sendTrainingNotificationEmails(
    [mockEnrollment],
    'Training Application Received - Pending Review',
    `Thank you for applying to our ${programTitle}! Your application has been received and is currently under review. We will contact you soon with further details about the program schedule and requirements.`,
    programTitle,
    programId
  )
  //    console.log('✅ Pending status email test result:', pendingResult)
  
  // Test confirmed status email
  console.log('Testing confirmed status email...')
  const confirmedResult = await emailService.sendTrainingNotificationEmails(
    [mockEnrollment],
    'Training Enrollment Confirmed - Payment Received',
    'Great news! Your training enrollment has been confirmed and payment has been received. We will contact you soon with further details about the program schedule and requirements.',
    programTitle,
    programId
  )
  // console.log('✅ Confirmed status email test result:', confirmedResult)
  
  // Test completed status email
  console.log('Testing completed status email...')
  const completedResult = await emailService.sendTrainingNotificationEmails(
    [mockEnrollment],
    'Congratulations! Training Program Completed',
    `Congratulations! You have successfully completed the ${programTitle} training program in 30 days from your enrollment date. Your certificate will be issued shortly.`,
    programTitle,
    programId
  )
  // console.log('✅ Completed status email test result:', completedResult)
  
  // Test cancelled status email
  console.log('Testing cancelled status email...')
  const cancelledResult = await emailService.sendTrainingNotificationEmails(
    [mockEnrollment],
    'Training Enrollment Cancelled',
    'Your training enrollment has been cancelled. If you have any questions or would like to re-enroll, please contact our support team.',
    programTitle,
    programId
  )
  // console.log('✅ Cancelled status email test result:', cancelledResult)
  
  return {
    pending: pendingResult,
    confirmed: confirmedResult,
    completed: completedResult,
    cancelled: cancelledResult
  }
}

// Test function for seller order notification emails
async function testSellerOrderNotificationEmail() {
  console.log('\n7. Testing seller order notification emails...')
  
  const mockOrderItems = [
    {
      productName: 'Professional Cable',
      quantity: 2,
      unitPrice: 1500,
      totalPrice: 3000
    },
    {
      productName: 'HDMI Adapter',
      quantity: 1,
      unitPrice: 800,
      totalPrice: 800
    }
  ]
  
  const result = await emailService.sendSellerOrderNotificationEmail(
    'seller@example.com',
    'John Seller',
    'Alice Customer',
    'ORD-20241201-000123',
    mockOrderItems,
    3800,
    new Date().toLocaleDateString()
  )
  // console.log('✅ Seller order notification email test result:', result)
  
  return result
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { testType } = await request.json()

    // console.log(`Running email service test: ${testType || 'all'}`)

    let result

    switch (testType) {
      case 'welcome':
        result = await testTrainingWelcomeEmail()
        break
      case 'certificate':
        result = await testTrainingCertificateEmail()
        break
      case 'reminder':
        result = await testTrainingReminderEmail()
        break
      case 'reward':
        result = await testRewardPurchaseEmail()
        break
      case 'ekart':
        result = await testEkartOrderEmail()
        break
      case 'training-status':
        result = await testTrainingStatusEmails()
        break
      case 'seller-order':
        result = await testSellerOrderNotificationEmail()
        break
      case 'all':
      default:
        result = await testEmailService()
        break
    }

    return NextResponse.json({
      message: "Email service test completed successfully",
      testType: testType || 'all',
      result,
      success: true
    })

  } catch (error: any) {
    console.error("Error in email service test:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to run email service test",
      success: false 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Service Test Endpoint",
    availableTests: [
      "all - Run all email tests",
      "welcome - Test welcome email template",
      "certificate - Test certificate email template", 
      "reminder - Test reminder email template",
      "reward - Test reward purchase email template",
      "ekart - Test eKart order email template",
      "training-status - Test training enrollment status emails",
      "seller-order - Test seller order notification email"
    ],
    usage: "POST with { testType: 'all' | 'welcome' | 'certificate' | 'reminder' | 'reward' | 'ekart' | 'training-status' | 'seller-order' }"
  })
} 