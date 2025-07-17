interface EmailRecipient {
  email: string
  variables?: Record<string, any>
}

interface EmailRequest {
  subject: string
  recipient: string | string[] | EmailRecipient[]
  body: string
  variables?: Record<string, any>
}

interface EmailResponse {
  message: string
  count: number
}

class EmailService {
  private readonly apiUrl = 'https://api.mockify.vercel.app/mail'
  
  /**
   * Send a single email with variables
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    variables?: Record<string, any>
  ): Promise<EmailResponse> {
    const emailData: EmailRequest = {
      subject,
      recipient: to,
      body: htmlBody,
      ...(variables && { variables })
    }

    return this.makeRequest(emailData)
  }

  /**
   * Send bulk emails with individual variables for each recipient
   */
  async sendBulkPersonalizedEmails(
    recipients: EmailRecipient[],
    subject: string,
    htmlBody: string,
    globalVariables?: Record<string, any>
  ): Promise<EmailResponse> {
    const emailData: EmailRequest = {
      subject,
      recipient: recipients,
      body: htmlBody,
      ...(globalVariables && { variables: globalVariables })
    }

    return this.makeRequest(emailData)
  }

  /**
   * Send bulk emails with custom HTML content for each recipient
   */
  async sendBulkCustomEmails(
    emailData: Array<{
      to: string
      variables?: Record<string, any>
      htmlContent: string
    }>,
    subject: string
  ): Promise<EmailResponse> {
    // For custom HTML content, we need to send individual emails
    const results = await Promise.all(
      emailData.map(async (data) => {
        return this.sendEmail(
          data.to,
          subject,
          data.htmlContent,
          data.variables
        )
      })
    )

    // Aggregate results
    const totalCount = results.reduce((sum, result) => sum + result.count, 0)
    const successCount = results.filter(result => result.count > 0).length

    return {
      message: `Successfully sent ${successCount} out of ${emailData.length} emails`,
      count: totalCount
    }
  }

  /**
   * Send broadcast email (same content to multiple recipients)
   */
  async sendBroadcastEmail(
    recipients: string[],
    subject: string,
    htmlBody: string,
    variables?: Record<string, any>
  ): Promise<EmailResponse> {
    const emailData: EmailRequest = {
      subject,
      recipient: recipients,
      body: htmlBody,
      ...(variables && { variables })
    }

    return this.makeRequest(emailData)
  }

  /**
   * Send training notification emails
   */
  async sendTrainingNotificationEmails(
    enrollments: Array<{
      email: string
      full_name: string
      id: string
    }>,
    subject: string,
    message: string,
    programTitle: string,
    programId?: string
  ): Promise<EmailResponse> {
    const recipients: EmailRecipient[] = enrollments.map(enrollment => ({
      email: enrollment.email,
      variables: {
        name: enrollment.full_name,
        studentName: enrollment.full_name,
        programTitle: programTitle,
        programName: programTitle,
        message: message,
        enrollmentId: enrollment.id,
        ...(programId && { programId }),
        // Add dynamic link with program ID if available
        trainingLink: programId ? `https://mockify.vercel.app/training/${programId}` : 'https://mockify.vercel.app/training'
      }
    }))

    const htmlTemplate = this.getTrainingNotificationTemplate()

    return this.sendBulkPersonalizedEmails(
      recipients,
      subject,
      htmlTemplate,
      {
        programTitle,
        programName: programTitle,
        companyName: 'Mockify',
        supportEmail: 'support@mockify.vercel.app',
        year: new Date().getFullYear()
      }
    )
  }

  /**
   * Send welcome email to new training enrollments
   */
  async sendTrainingWelcomeEmail(
    email: string,
    studentName: string,
    programTitle: string,
    programDetails?: {
      startDate?: string
      duration?: string
      instructor?: string
      programId?: string
    }
  ): Promise<EmailResponse> {
    const variables = {
      studentName,
      name: studentName,
      programTitle,
      programName: programTitle,
      startDate: programDetails?.startDate || 'TBD',
      duration: programDetails?.duration || 'TBD',
      instructor: programDetails?.instructor || 'TBD',
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      year: new Date().getFullYear(),
      // Add dynamic link with program ID if available
      trainingLink: programDetails?.programId ? `https://mockify.vercel.app/training/${programDetails.programId}` : 'https://mockify.vercel.app/training'
    }

    const htmlTemplate = this.getWelcomeEmailTemplate()

    return this.sendEmail(
      email,
      'Welcome to {{programTitle}} - Mockify Training',
      htmlTemplate,
      variables
    )
  }

  /**
   * Send training completion certificate email
   */
  async sendCertificateEmail(
    email: string,
    studentName: string,
    programTitle: string,
    certificateUrl?: string,
    completionDate?: string
  ): Promise<EmailResponse> {
    const variables = {
      studentName,
      name: studentName,
      programTitle,
      programName: programTitle,
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      certificateUrl: certificateUrl || '#',
      completionDate: completionDate || new Date().toLocaleDateString(),
      year: new Date().getFullYear()
    }

    const htmlTemplate = this.getCertificateEmailTemplate()

    return this.sendEmail(
      email,
      'Congratulations! Your {{programTitle}} Certificate is Ready',
      htmlTemplate,
      variables
    )
  }

  /**
   * Send training reminder emails
   */
  async sendTrainingReminderEmail(
    recipients: Array<{
      email: string
      full_name: string
    }>,
    programTitle: string,
    reminderMessage: string,
    reminderDate?: string
  ): Promise<EmailResponse> {
    const emailRecipients: EmailRecipient[] = recipients.map(recipient => ({
      email: recipient.email,
      variables: {
        name: recipient.full_name,
        studentName: recipient.full_name
      }
    }))

    const variables = {
      programTitle,
      programName: programTitle,
      reminderMessage,
      reminderDate: reminderDate || new Date().toLocaleDateString(),
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      year: new Date().getFullYear()
    }

    const htmlTemplate = this.getReminderEmailTemplate()

    return this.sendBulkPersonalizedEmails(
      emailRecipients,
      'Reminder: {{programTitle}} - Mockify Training',
      htmlTemplate,
      variables
    )
  }

  /**
   * Send event notification emails
   */
  async sendEventNotificationEmails(
    registrations: Array<{
      email: string
      name: string
      registrationId: string
    }>,
    subject: string,
    message: string,
    eventTitle: string,
    eventId?: string
  ): Promise<EmailResponse> {
    const recipients: EmailRecipient[] = registrations.map(registration => ({
      email: registration.email,
      variables: {
        name: registration.name,
        participantName: registration.name,
        eventTitle: eventTitle,
        eventName: eventTitle,
        message: message,
        registrationId: registration.registrationId,
        ...(eventId && { eventId }),
        // Add dynamic link with event ID if available
        eventLink: eventId ? `https://mockify.vercel.app/events/${eventId}` : 'https://mockify.vercel.app/events'
      }
    }))

    const htmlTemplate = this.getEventNotificationTemplate()

    return this.sendBulkPersonalizedEmails(
      recipients,
      subject,
      htmlTemplate,
      {
        eventTitle,
        eventName: eventTitle,
        companyName: 'Mockify',
        supportEmail: 'support@mockify.vercel.app',
        year: new Date().getFullYear()
      }
    )
  }

  /**
   * Send reward purchase confirmation email
   */
  async sendRewardPurchaseEmail(
    email: string,
    userName: string,
    rewardTitle: string,
    quantity: number,
    pointsSpent: number,
    orderId: string,
    purchaseDate?: string
  ): Promise<EmailResponse> {
    const variables = {
      name: userName,
      userName: userName,
      rewardTitle: rewardTitle,
      quantity: quantity,
      pointsSpent: pointsSpent,
      orderId: orderId,
      purchaseDate: purchaseDate || new Date().toLocaleDateString(),
      companyName: 'Mockify',
      supportEmail: 'hello@mockify.vercel.app',
      year: new Date().getFullYear()
    }

    const htmlTemplate = this.getRewardPurchaseTemplate()

    // Send email to customer
    const customerResult = await this.sendEmail(
      email,
      '🎉 Reward Purchase Confirmation - {{rewardTitle}}',
      htmlTemplate,
      variables
    )

    // Also send notification to Mockify
    const mockifyVariables = {
      ...variables,
      name: 'Mockify Team',
      customerName: userName,
      customerEmail: email
    }

    const mockifyHtmlTemplate = this.getRewardPurchaseNotificationTemplate()

    try {
      await this.sendEmail(
        'hello@mockify.vercel.app',
        `🎁 New Reward Purchase - ${rewardTitle} by ${userName}`,
        mockifyHtmlTemplate,
        mockifyVariables
      )
    } catch (error) {
      console.error('Failed to send notification to Mockify:', error)
      // Don't fail the customer email if Mockify notification fails
    }

    return customerResult
  }

  /**
   * Send eKart order confirmation email
   */
  async sendEkartOrderEmail(
    email: string,
    userName: string,
    orderNumber: string,
    orderItems: Array<{
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    totalAmount: number,
    shippingAddress: string,
    orderDate?: string
  ): Promise<EmailResponse> {
    const variables = {
      name: userName,
      userName: userName,
      orderNumber: orderNumber,
      totalAmount: totalAmount.toFixed(2),
      shippingAddress: shippingAddress,
      orderDate: orderDate || new Date().toLocaleDateString(),
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      year: new Date().getFullYear(),
      // Create HTML for order items
      orderItemsHtml: orderItems.map(item => 
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.totalPrice.toFixed(2)}</td>
        </tr>`
      ).join('')
    }

    const htmlTemplate = this.getEkartOrderTemplate()

    return this.sendEmail(
      email,
      '🛒 Order Confirmation - {{orderNumber}}',
      htmlTemplate,
      variables
    )
  }

  /**
   * Send eKart order status update email
   */
  async sendOrderStatusUpdateEmail(
    email: string,
    userName: string,
    orderNumber: string,
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'processing',
    orderItems: Array<{
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    totalAmount: number,
    trackingNumber?: string,
    estimatedDelivery?: string
  ): Promise<EmailResponse> {
    const statusConfig = {
      pending: {
        subject: '⏳ Order Pending - {{orderNumber}}',
        title: 'Order Pending',
        message: 'Your order has been received and is pending confirmation. We will process it soon.',
        color: '#6c757d',
        icon: '⏳'
      },
      shipped: {
        subject: '🚚 Order Shipped - {{orderNumber}}',
        title: 'Order Shipped',
        message: 'Great news! Your order has been shipped and is on its way to you.',
        color: '#007bff',
        icon: '🚚'
      },
      delivered: {
        subject: '✅ Order Delivered - {{orderNumber}}',
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered! We hope you love your purchase.',
        color: '#28a745',
        icon: '✅'
      },
      cancelled: {
        subject: '❌ Order Cancelled - {{orderNumber}}',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
        color: '#dc3545',
        icon: '❌'
      },
      processing: {
        subject: '⚙️ Order Processing - {{orderNumber}}',
        title: 'Order Processing',
        message: 'Your order is being processed and will be shipped soon.',
        color: '#ffc107',
        icon: '⚙️'
      }
    }

    const config = statusConfig[status]
    
    const variables = {
      name: userName,
      userName: userName,
      orderNumber: orderNumber,
      status: status.charAt(0).toUpperCase() + status.slice(1),
      statusMessage: config.message,
      statusColor: config.color,
      statusIcon: config.icon,
      totalAmount: totalAmount.toFixed(2),
      trackingNumber: trackingNumber || 'Not available',
      estimatedDelivery: estimatedDelivery || 'TBD',
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      year: new Date().getFullYear(),
      // Create HTML for order items
      orderItemsHtml: orderItems.map(item => 
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.totalPrice.toFixed(2)}</td>
        </tr>`
      ).join('')
    }

    const htmlTemplate = this.getOrderStatusUpdateTemplate()

    try {
      const result = await this.sendEmail(
        email,
        config.subject,
        htmlTemplate,
        variables
      )
      return result
    } catch (error) {
      console.error(`❌ Error sending email:`, error)
      throw error
    }
  }

  /**
   * Send seller order notification email
   */
  async sendSellerOrderNotificationEmail(
    sellerEmail: string,
    sellerName: string,
    buyerName: string,
    orderNumber: string,
    orderItems: Array<{
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    totalAmount: number,
    orderDate?: string
  ): Promise<EmailResponse> {
    const variables = {
      name: sellerName,
      sellerName: sellerName,
      buyerName: buyerName,
      orderNumber: orderNumber,
      totalAmount: totalAmount.toFixed(2),
      orderDate: orderDate || new Date().toLocaleDateString(),
      companyName: 'Mockify',
      supportEmail: 'support@mockify.vercel.app',
      year: new Date().getFullYear(),
      // Create HTML for order items
      orderItemsHtml: orderItems.map(item => 
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">₹${item.totalPrice.toFixed(2)}</td>
        </tr>`
      ).join('')
    }

    const htmlTemplate = this.getSellerOrderNotificationTemplate()

    try {
      const result = await this.sendEmail(
        sellerEmail,
        '🛒 New Order Received - {{orderNumber}}',
        htmlTemplate,
        variables
      )
      return result
    } catch (error) {
      console.error(`❌ Error sending seller notification email:`, error)
      throw error
    }
  }

  /**
   * Send job approval request email to admins
   */
  async sendJobApprovalRequestEmail(
    jobTitle: string,
    companyName: string,
    postedByName: string,
    postedByEmail: string,
    jobId: string
  ): Promise<EmailResponse> {
    const variables = {
      jobTitle: jobTitle,
      companyName: companyName,
      postedByName: postedByName,
      postedByEmail: postedByEmail,
      jobId: jobId,
      adminUrl: `https://mockify.vercel.app/admin/jobs`,
      supportEmail: 'hello@mockify.vercel.app',
      year: new Date().getFullYear()
    }

    const htmlTemplate = this.getJobApprovalRequestTemplate()

    // Send email to all admins
    const adminEmails = ['hello@mockify.vercel.app'] // Add more admin emails as needed
    
    const results = await Promise.allSettled(
      adminEmails.map(email => 
        this.sendEmail(
          email,
          `🔍 Job Approval Required - ${jobTitle} at ${companyName}`,
          htmlTemplate,
          variables
        )
      )
    )

    // Return success if at least one email was sent successfully
    const successfulResults = results.filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<EmailResponse>[]
    
    if (successfulResults.length > 0) {
      return successfulResults[0].value
    } else {
      throw new Error('Failed to send job approval request emails')
    }
  }

  /**
   * Send job approval status email to job poster
   */
  async sendJobApprovalStatusEmail(
    email: string,
    userName: string,
    jobTitle: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<EmailResponse> {
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1)
    const rejectionReasonText = rejectionReason ? `<br><strong>Reason:</strong> ${rejectionReason}` : ''
    
    const variables = {
      name: userName,
      userName: userName,
      jobTitle: jobTitle,
      status: formattedStatus,
      rejectionReason: rejectionReasonText,
      statusMessage: status === 'approved' 
        ? 'Your job posting has been approved and is now live on our platform!' 
        : `Your job posting was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      actionUrl: status === 'approved' 
        ? 'https://mockify.vercel.app/careers' 
        : 'https://mockify.vercel.app/profile/dashboard',
      actionText: status === 'approved' ? 'View Job' : 'Manage Jobs',
      companyName: 'Mockify',
      supportEmail: 'hello@mockify.vercel.app',
      year: new Date().getFullYear()
    }

    const htmlTemplate = this.getJobApprovalStatusTemplate()

    return await this.sendEmail(
      email,
      `📋 Job Posting ${formattedStatus} - ${jobTitle}`,
      htmlTemplate,
      variables
    )
  }

  /**
   * Make HTTP request to the email API
   */
  private async makeRequest(emailData: EmailRequest): Promise<EmailResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Email API error (${response.status}): ${errorData.error || 'Failed to send email'}`)
      }

      const result = await response.json()
      
      return result
    } catch (error) {
      console.error('❌ Email service error:', error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get HTML template for training notifications
   */
  private getTrainingNotificationTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">{{programTitle}}</h3>
            <p style="color: #555555; margin: 0; line-height: 1.6; font-size: 16px;">{{message}}</p>
        </div>
        
        <div style="margin: 30px 0;">
            <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0;">
                We're excited to have you as part of our training program. This notification contains important information about your enrollment.
            </p>
            <p style="color: #666666; line-height: 1.6; margin: 0;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{trainingLink}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Training Portal</a>
            </div>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for welcome emails
   */
  private getWelcomeEmailTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{studentName}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Congratulations on enrolling in <strong>{{programTitle}}</strong>! We're thrilled to have you join our community of learners.
        </p>
        
        <div style="background-color: #f8fff9; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Program Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Program:</strong> {{programTitle}}</li>
                <li><strong>Start Date:</strong> {{startDate}}</li>
                <li><strong>Duration:</strong> {{duration}}</li>
                <li><strong>Instructor:</strong> {{instructor}}</li>
            </ul>
        </div>
        
        <div style="margin: 30px 0;">
            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
            <ol style="color: #666666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Access your training portal using the button below</li>
                <li>Complete your profile setup</li>
                <li>Review the course materials</li>
                <li>Join the welcome session</li>
            </ol>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{trainingLink}}" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Access Training Portal</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for certificate emails
   */
  private getCertificateEmailTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Well Done, {{studentName}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            We're proud to announce that you have successfully completed <strong>{{programTitle}}</strong>!
        </p>
        
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">🏆 Achievement Unlocked</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Program:</strong> {{programTitle}}</li>
                <li><strong>Completion Date:</strong> {{completionDate}}</li>
                <li><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Certified</span></li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Your dedication and hard work have paid off. This certificate represents your commitment to professional development and your newly acquired skills.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{certificateUrl}}" style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Download Certificate</a>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1976d2; margin: 0; font-size: 14px; text-align: center;">
                💡 <strong>Pro Tip:</strong> Add this certificate to your LinkedIn profile to showcase your new skills!
            </p>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for reminder emails
   */
  private getReminderEmailTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
            <h3 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 18px;">{{programTitle}}</h3>
            <p style="color: #555555; margin: 0; line-height: 1.6; font-size: 16px;">{{reminderMessage}}</p>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            This is a friendly reminder about your training program. Please make sure to check your schedule and prepare accordingly.
        </p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                ⏰ <strong>Date:</strong> {{reminderDate}}
            </p>
        </div>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://mockify.vercel.app/training" style="display: inline-block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Training Details</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for event notification emails
   */
  private getEventNotificationTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{participantName}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            You're invited to participate in <strong>{{eventTitle}}</strong>! Here's the important information you need to know:
        </p>
        
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Event:</strong> {{eventTitle}}</li>
                <li><strong>Date:</strong> {{eventDate}}</li>
                <li><strong>Location:</strong> {{eventLocation}}</li>
                <li><strong>Description:</strong> {{eventDescription}}</li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            We're looking forward to seeing you at the event. If you have any questions or need assistance, please don't hesitate to contact us.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{eventLink}}" style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Event Details</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for reward purchase emails
   */
  private getRewardPurchaseTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Congratulations! You've successfully purchased a reward. Here are your purchase details:
        </p>
        
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">Purchase Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Reward:</strong> {{rewardTitle}}</li>
                <li><strong>Quantity:</strong> {{quantity}}</li>
                <li><strong>Points Spent:</strong> {{pointsSpent}}</li>
                <li><strong>Order ID:</strong> {{orderId}}</li>
                <li><strong>Purchase Date:</strong> {{purchaseDate}}</li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Thank you for choosing Mockify for your reward purchase. We're excited to see you enjoy your new reward!
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://mockify.vercel.app/profile/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Rewards</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for eKart order emails
   */
  private getEkartOrderTemplate(): string {
    return `
<div style="padding: 40px 30px;">
    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
    
    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
        Thank you for your order! Your purchase has been confirmed and is being processed. Here are your order details:
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
        <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Order Summary</h3>
        <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Order Number:</strong> {{orderNumber}}</li>
            <li><strong>Order Date:</strong> {{orderDate}}</li>
            <li><strong>Total Amount:</strong> ₹{{totalAmount}}</li>
            <li><strong>Shipping Address:</strong> {{shippingAddress}}</li>
        </ul>
    </div>
    
    <!-- Order Items Table -->
    <div style="margin: 30px 0;">
        <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Total</th>
                </tr>
            </thead>
            <tbody>
                {{orderItemsHtml}}
            </tbody>
            <tfoot>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">Total:</td>
                    <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">₹{{totalAmount}}</td>
                </tr>
            </tfoot>
        </table>
    </div>
    
    <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
        We're excited to process your order! You'll receive updates on your order status via email. If you have any questions, please don't hesitate to contact our support team.
    </p>
    
    <!-- Call to Action -->
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://mockify.vercel.app/profile/dashboard" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Order Status</a>
    </div>
</div>`
  }

  /**
   * Get HTML template for order status update emails
   */
  private getOrderStatusUpdateTemplate(): string {
    return `
<div style="padding: 40px 30px;">
    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
    
    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
        {{statusMessage}}
    </p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid {{statusColor}}; margin: 20px 0;">
        <h3 style="color: {{statusColor}}; margin: 0 0 15px 0; font-size: 18px;">Order Summary</h3>
        <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Order Number:</strong> {{orderNumber}}</li>
            <li><strong>Status:</strong> {{status}}</li>
            <li><strong>Total Amount:</strong> ₹{{totalAmount}}</li>
            <li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
            <li><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</li>
        </ul>
    </div>
    
    <!-- Order Items Table -->
    <div style="margin: 30px 0;">
        <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Total</th>
                </tr>
            </thead>
            <tbody>
                {{orderItemsHtml}}
            </tbody>
            <tfoot>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">Total:</td>
                    <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">₹{{totalAmount}}</td>
                </tr>
            </tfoot>
        </table>
    </div>
    
    <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
        Thank you for choosing Mockify! If you have any questions about your order, please don't hesitate to contact our support team.
    </p>
    
    <!-- Call to Action -->
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://mockify.vercel.app/profile/dashboard" style="display: inline-block; background: linear-gradient(135deg, {{statusColor}} 0%, {{statusColor}}dd 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Order Status</a>
    </div>
</div>`
  }

  /**
   * Get HTML template for seller order notification emails
   */
  private getSellerOrderNotificationTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Great news! You have received a new order from <strong>{{buyerName}}</strong>. Here are the order details:
        </p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Order Summary</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Order Number:</strong> {{orderNumber}}</li>
                <li><strong>Customer:</strong> {{buyerName}}</li>
                <li><strong>Order Date:</strong> {{orderDate}}</li>
                <li><strong>Total Amount:</strong> ₹{{totalAmount}}</li>
            </ul>
        </div>
        
        <!-- Order Items Table -->
        <div style="margin: 30px 0;">
            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Product</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Qty</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Price</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold; color: #495057;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{orderItemsHtml}}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">Total:</td>
                        <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6; color: #495057;">₹{{totalAmount}}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Please process this order as soon as possible. You can update the order status and manage your orders through your seller dashboard.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://mockify.vercel.app/profile/dashboard" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Manage Orders</a>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                💡 <strong>Pro Tip:</strong> Keep your customers updated by promptly updating the order status!
            </p>
        </div>
    </div>
</div>`
  }

  private getRewardPurchaseNotificationTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            A new reward purchase has been made. Here are the details:
        </p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Purchase Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Customer:</strong> {{customerName}}</li>
                <li><strong>Customer Email:</strong> {{customerEmail}}</li>
                <li><strong>Reward:</strong> {{rewardTitle}}</li>
                <li><strong>Quantity:</strong> {{quantity}}</li>
                <li><strong>Points Spent:</strong> {{pointsSpent}}</li>
                <li><strong>Order ID:</strong> {{orderId}}</li>
                <li><strong>Purchase Date:</strong> {{purchaseDate}}</li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Please process this reward purchase and update the status accordingly.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://mockify.vercel.app/admin/rewards" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Manage Rewards</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for job approval request emails
   */
  private getJobApprovalRequestTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">🔍 Job Approval Required</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            A new job posting has been submitted and requires admin approval.
        </p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">Job Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Job Title:</strong> {{jobTitle}}</li>
                <li><strong>Company:</strong> {{companyName}}</li>
                <li><strong>Posted By:</strong> {{postedByName}} ({{postedByEmail}})</li>
                <li><strong>Job ID:</strong> {{jobId}}</li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Please review this job posting and approve or reject it based on our community guidelines.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{adminUrl}}" style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Review Job Posting</a>
        </div>
    </div>
</div>`
  }

  /**
   * Get HTML template for job approval status emails
   */
  private getJobApprovalStatusTemplate(): string {
    return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            {{statusMessage}}
        </p>
        
        <div style="background-color: {{status === 'approved' ? '#d4edda' : '#f8d7da'}}; padding: 20px; border-radius: 8px; border-left: 4px solid {{status === 'approved' ? '#28a745' : '#dc3545'}}; margin: 20px 0;">
            <h3 style="color: {{status === 'approved' ? '#155724' : '#721c24'}}; margin: 0 0 15px 0; font-size: 18px;">Job Posting: {{jobTitle}}</h3>
            <p style="color: {{status === 'approved' ? '#155724' : '#721c24'}}; margin: 0; line-height: 1.6;">
                <strong>Status:</strong> {{status}}
                {{rejectionReason}}
            </p>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            Thank you for using Mockify for your job posting needs.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{actionUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{status === 'approved' ? '#28a745' : '#6c757d'}} 0%, {{status === 'approved' ? '#20c997' : '#495057'}} 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">{{actionText}}</a>
        </div>
    </div>
</div>`
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export individual methods for convenience
export const sendEmail = emailService.sendEmail.bind(emailService)
export const sendBulkPersonalizedEmails = emailService.sendBulkPersonalizedEmails.bind(emailService)
export const sendBulkCustomEmails = emailService.sendBulkCustomEmails.bind(emailService)
export const sendBroadcastEmail = emailService.sendBroadcastEmail.bind(emailService)
export const sendTrainingNotificationEmails = emailService.sendTrainingNotificationEmails.bind(emailService)
export const sendTrainingWelcomeEmail = emailService.sendTrainingWelcomeEmail.bind(emailService)
export const sendCertificateEmail = emailService.sendCertificateEmail.bind(emailService)
export const sendTrainingReminderEmail = emailService.sendTrainingReminderEmail.bind(emailService)
export const sendEventNotificationEmails = emailService.sendEventNotificationEmails.bind(emailService)
export const sendRewardPurchaseEmail = emailService.sendRewardPurchaseEmail.bind(emailService)
export const sendEkartOrderEmail = emailService.sendEkartOrderEmail.bind(emailService)
export const sendOrderStatusUpdateEmail = emailService.sendOrderStatusUpdateEmail.bind(emailService)
export const sendSellerOrderNotificationEmail = emailService.sendSellerOrderNotificationEmail.bind(emailService)
export const sendJobApprovalRequestEmail = emailService.sendJobApprovalRequestEmail.bind(emailService)
export const sendJobApprovalStatusEmail = emailService.sendJobApprovalStatusEmail.bind(emailService)

// Export types for use in other files
export type { EmailRecipient, EmailRequest, EmailResponse }