import { createServerClient } from '@/lib/supabase/server'
import { emailService } from './email-service'

export interface CreateNotificationOptions {
  userId: string
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  data?: Record<string, any>
  referenceId?: string
  referenceType?: string
  triggeredBy?: string
  actionUrl?: string
  actionText?: string
  expiresAt?: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: NotificationType
  priority: NotificationPriority
  is_read: boolean
  read_at?: string
  data?: Record<string, any>
  reference_id?: string
  reference_type?: string
  triggered_by?: string
  action_url?: string
  action_text?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export type NotificationType = 
  // Discussion related
  | 'new_comment' | 'comment_reply' | 'discussion_like' | 'comment_like' 
  | 'mention' | 'discussion_update' | 'poll_vote'
  // E-commerce related
  | 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled'
  | 'payment_received' | 'payment_failed' | 'product_purchased' | 'product_status_update'
  // Training related
  | 'enrollment_confirmed' | 'course_started' | 'course_completed'
  | 'certificate_issued' | 'training_reminder'
  // Job related
  | 'job_posted' | 'application_received' | 'job_status_update'
  // Points and rewards
  | 'points_earned' | 'points_spent' | 'reward_purchased' | 'level_up'
  // System notifications
  | 'welcome' | 'newsletter' | 'announcement' | 'system_update'
  // Event related
  | 'event_reminder' | 'event_cancelled' | 'event_updated'
  // General
  | 'custom' | 'other'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationTemplate {
  id: string
  name: string
  notification_type: NotificationType
  title_template: string
  message_template: string
  default_priority: NotificationPriority
  variables: string[]
  is_active: boolean
}

export interface UserNotificationPreferences {
  id: string
  user_id: string
  email_enabled: Record<string, boolean>
  push_enabled: Record<string, boolean>
  sms_enabled: Record<string, boolean>
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'
  push_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'
  quiet_hours_start?: string
  quiet_hours_end?: string
  quiet_hours_timezone: string
  dnd_enabled: boolean
  dnd_until?: string
}

export interface NotificationData {
  user_id: string
  title: string
  message: string
  type: string
  data?: any
  is_read?: boolean
}

export interface EmailNotificationData {
  to: string
  subject: string
  message: string
  html?: string
}

// Base notification service class
class BaseNotificationService {
  protected async getSupabase() {
    return createServerClient()
  }

  /**
   * Create a new notification
   */
  async createNotification(options: CreateNotificationOptions): Promise<Notification | null> {
    try {
      // console.log('Creating notification with options:', JSON.stringify(options, null, 2))
      const supabase = await this.getSupabase()
      
      // Ensure notification_type is passed as a string
      const notificationData = {
        user_id: options.userId,
        title: options.title,
        message: options.message,
        notification_type: String(options.type), // Convert to string explicitly
        priority: options.priority || 'normal',
        data: options.data,
        reference_id: options.referenceId,
        reference_type: options.referenceType,
        triggered_by: options.triggeredBy,
        action_url: options.actionUrl,
        action_text: options.actionText,
        expires_at: options.expiresAt
      }

      // console.log('Inserting notification with data:', JSON.stringify(notificationData, null, 2))
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) {
        // console.error('Error creating notification:', error)
        return null
      }

      return data
    } catch (error) {
      // console.error('Error in createNotification:', error)
      return null
    }
  }

  /**
   * Create notification from template
   */
  async createNotificationFromTemplate(
    templateName: string,
    userId: string,
    variables: Record<string, string>,
    options?: Partial<CreateNotificationOptions>
  ): Promise<Notification | null> {
    try {
      const supabase = await this.getSupabase()
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        // console.error('Template not found:', templateName)
        return null
      }

      // Replace template variables
      let title = template.title_template
      let message = template.message_template

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        title = title.replace(new RegExp(placeholder, 'g'), value)
        message = message.replace(new RegExp(placeholder, 'g'), value)
      })

      return this.createNotification({
        userId,
        title,
        message,
        type: template.notification_type as NotificationType,
        priority: template.default_priority as NotificationPriority,
        ...options
      })
    } catch (error) {
      // console.error('Error creating notification from template:', error)
      return null
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: NotificationType
    } = {}
  ): Promise<Notification[]> {
    try {
      const supabase = await this.getSupabase()
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (options.type) {
        query = query.eq('notification_type', options.type)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        // console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      // console.error('Error in getUserNotifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) {
        // console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      // console.error('Error in markAsRead:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        // console.error('Error marking all notifications as read:', error)
        return false
      }

      return true
    } catch (error) {
      // console.error('Error in markAllAsRead:', error)
      return false
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        // console.error('Error deleting notification:', error)
        return false
      }

      return true
    } catch (error) {
      // console.error('Error in deleteNotification:', error)
      return false
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        // console.error('Error deleting all notifications:', error)
        return false
      }

      return true
    } catch (error) {
      // console.error('Error in deleteAllNotifications:', error)
      return false
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        // console.error('Error getting unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      // console.error('Error in getUnreadCount:', error)
      return 0
    }
  }

  /**
   * Bulk create notifications (for system announcements, etc.)
   */
  async bulkCreateNotifications(notifications: CreateNotificationOptions[]): Promise<Notification[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications.map(options => ({
          user_id: options.userId,
          title: options.title,
          message: options.message,
          notification_type: options.type,
          priority: options.priority || 'normal',
          data: options.data,
          reference_id: options.referenceId,
          reference_type: options.referenceType,
          triggered_by: options.triggeredBy,
          action_url: options.actionUrl,
          action_text: options.actionText,
          expires_at: options.expiresAt
        })))
        .select()

      if (error) {
        // console.error('Error creating bulk notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      // console.error('Error in bulkCreateNotifications:', error)
      return []
    }
  }

  /**
   * Notify the user who requested an event about approval/rejection
   */
  async notifyUserOfEventStatusChange({
    userId,
    eventTitle,
    status,
    eventId
  }: {
    userId: string
    eventTitle: string
    status: 'approved' | 'rejected'
    eventId: string
  }) {
    try {
      await this.createNotification({
        userId,
        title: `Your event request was ${status}`,
        message: `Your event request titled "${eventTitle}" was ${status} by an admin.`,
        type: 'event_updated',
        priority: 'normal',
        referenceId: eventId,
        referenceType: 'event',
      })
    } catch (err) {
      // console.error('Error notifying user of event status change:', err)
    }
  }
}

// Server-side notification service
class ServerNotificationService extends BaseNotificationService {
  protected async getSupabase() {
    return createServerClient()
  }
}

// Client-side notification service
class ClientNotificationService extends BaseNotificationService {
  private pollInterval: number = 30000 // 30 seconds
  private pollTimeout?: NodeJS.Timeout
  private lastPollTime: string = new Date().toISOString()
  private isTabFocused: boolean = true
  private isPolling: boolean = false
  private currentUserId?: string
  private currentCallback?: (notifications: Notification[]) => void

  protected async getSupabase() {
    return createServerClient()
  }

  /**
   * Initialize tab focus detection
   */
  private initializeFocusDetection() {
    // Set initial focus state
    this.isTabFocused = !document.hidden

    // Listen for visibility change events
    const handleVisibilityChange = () => {
      const wasFocused = this.isTabFocused
      this.isTabFocused = !document.hidden
      
      // If tab just became focused and we were polling before, resume polling
      if (this.isTabFocused && !wasFocused && this.currentUserId && this.currentCallback) {
        this.resumePolling()
      }
      // If tab just lost focus and we were polling, pause polling
      else if (!this.isTabFocused && wasFocused && this.isPolling) {
        this.pausePolling()
      }
    }

    // Listen for window focus/blur events as backup
    const handleWindowFocus = () => {
      if (!this.isTabFocused && this.currentUserId && this.currentCallback) {
        this.isTabFocused = true
        this.resumePolling()
      }
    }

    const handleWindowBlur = () => {
      if (this.isTabFocused && this.isPolling) {
        this.isTabFocused = false
        this.pausePolling()
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }

  /**
   * Start polling for new notifications
   */
  startPolling(userId: string, onNewNotifications: (notifications: Notification[]) => void) {
    // Clear any existing polling
    this.stopPolling()

    // Store current polling state
    this.currentUserId = userId
    this.currentCallback = onNewNotifications

    // Initialize focus detection
    const cleanupFocusDetection = this.initializeFocusDetection()

    // Start the polling process
    this.startPollingProcess()

    // Return cleanup function that includes focus detection cleanup
    return () => {
      this.stopPolling()
      cleanupFocusDetection()
    }
  }

  /**
   * Start the actual polling process
   */
  private startPollingProcess() {
    if (!this.currentUserId || !this.currentCallback) return

    this.isPolling = true

    // Only start interval if tab is focused
    if (this.isTabFocused) {
      this.pollTimeout = setInterval(async () => {
        await this.performPoll()
      }, this.pollInterval)
    }
  }

  /**
   * Perform a single polling operation
   */
  private async performPoll() {
    if (!this.currentUserId || !this.currentCallback) return

    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.currentUserId)
        .gt('created_at', this.lastPollTime)
        .order('created_at', { ascending: false })

      if (error) {
        // console.error('Error polling notifications:', error)
        return
      }

      if (data && data.length > 0) {
        this.currentCallback(data as unknown as Notification[])
        this.lastPollTime = new Date().toISOString()
      }
    } catch (error) {
      // console.error('Error in notification polling:', error)
    }
  }

  /**
   * Pause polling (when tab loses focus)
   */
  private pausePolling() {
    if (this.pollTimeout) {
      clearInterval(this.pollTimeout)
      this.pollTimeout = undefined
    }
    this.isPolling = false
  }

  /**
   * Resume polling (when tab gains focus)
   */
  private resumePolling() {
    if (!this.currentUserId || !this.currentCallback || this.pollTimeout) return

    this.isPolling = true
    this.pollTimeout = setInterval(async () => {
      await this.performPoll()
    }, this.pollInterval)

    // Perform an immediate poll when resuming to catch any missed notifications
    this.performPoll()
  }

  /**
   * Stop polling for notifications
   */
  stopPolling() {
    if (this.pollTimeout) {
      clearInterval(this.pollTimeout)
      this.pollTimeout = undefined
    }
    this.isPolling = false
    this.currentUserId = undefined
    this.currentCallback = undefined
  }

  /**
   * Check if polling is currently active
   */
  isPollingActive(): boolean {
    return this.isPolling && this.isTabFocused
  }

  /**
   * Get current focus state
   */
  getTabFocusState(): boolean {
    return this.isTabFocused
  }

  /**
   * Subscribe to real-time notifications with focus detection
   */
  subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: Notification) => void
  ): () => void {
    // Use the existing polling mechanism with focus detection
    return this.startPolling(userId, (notifications) => {
      // Call the callback for each new notification
      notifications.forEach(notification => {
        onNewNotification(notification)
      })
    })
  }
}

// Export instances for both client and server use
export const serverNotificationService = new ServerNotificationService()
export const clientNotificationService = new ClientNotificationService()

// For backward compatibility, export the client service as the default
export const notificationService = clientNotificationService

export async function createNotification(notification: NotificationData) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        notification_type: notification.type,
        data: notification.data,
        is_read: notification.is_read || false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // console.error("Error creating notification:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    // console.error("Error in createNotification:", error)
    throw error
  }
}

export async function createBulkNotifications(notifications: NotificationData[]) {
  try {
    const supabase = await createServerClient()

    const notificationsWithDefaults = notifications.map(notification => ({
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      notification_type: notification.type,
      data: notification.data,
      is_read: notification.is_read || false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationsWithDefaults)
      .select()

    if (error) {
      // console.error("Error creating bulk notifications:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    // console.error("Error in createBulkNotifications:", error)
    throw error
  }
}

/**
 * @deprecated Use emailService from './email-service' instead for better email functionality
 * Send email notification (basic implementation)
 */
export async function sendEmailNotification(emailData: EmailNotificationData) {
  try {
    // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the email data
    
    // console.log("Email notification would be sent:", {
    //   to: emailData.to,
    //   subject: emailData.subject,
    //   message: emailData.message
    // })

    // Example integration with a hypothetical email service:
    // const emailService = new EmailService()
    // await emailService.send({
    //   to: emailData.to,
    //   subject: emailData.subject,
    //   html: emailData.html || emailData.message
    // })

    return { success: true, message: "Email notification logged" }
  } catch (error) {
    // console.error("Error sending email notification:", error)
    throw error
  }
}

export async function sendTrainingNotification(
  enrollmentIds: string[],
  subject: string,
  message: string,
  programId?: string
) {
  try {
    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get enrollment details
    const { data: enrollments, error: enrollmentsError } = await serviceClient
      .from("training_enrollments")
      .select("id, email, full_name, program_id")
      .in("id", enrollmentIds)

    if (enrollmentsError) {
      throw new Error(enrollmentsError.message)
    }

    if (!enrollments || enrollments.length === 0) {
      throw new Error("No enrollments found for the provided IDs")
    }

    // Get program details if programId is provided
    let programTitle = "Training Program"
    if (programId) {
      const { data: program } = await serviceClient
        .from("training_programs")
        .select("title")
        .eq("id", programId)
        .single()
      
      if (program) {
        programTitle = program.title
      }
    } else if (enrollments[0]?.program_id) {
      // Try to get program title from the first enrollment's program_id
      const { data: program } = await serviceClient
        .from("training_programs")
        .select("title")
        .eq("id", enrollments[0].program_id)
        .single()
      
      if (program) {
        programTitle = program.title
      }
    }

    // console.log(`Sending training notifications to ${enrollments.length} recipients for program: ${programTitle}`)

    // Send emails using the email service instead of creating database notifications
    const emailResult = await emailService.sendTrainingNotificationEmails(
      enrollments,
      subject,
      message,
      programTitle,
      programId || enrollments[0]?.program_id
    )

    // console.log(`✅ Successfully sent ${emailResult.count} training notification emails`)

    return {
      success: true,
      notificationsCreated: emailResult.count,
      emailsSent: emailResult.count,
      recipients: enrollments.map(e => ({ 
        email: e.email, 
        name: e.full_name,
        enrollmentId: e.id 
      })),
      programTitle
    }

  } catch (error) {
    // console.error("Error in sendTrainingNotification:", error)
    throw error
  }
}

export async function sendEventNotification(
  registrationIds: string[],
  subject: string,
  message: string,
  eventId?: string
) {
  try {
    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get registration details
    const { data: registrations, error: registrationsError } = await serviceClient
      .from("event_logs")
      .select(`
        id, 
        user_id,
        event_id,
        profiles!event_logs_user_id_fkey (
          full_name,
          email
        ),
        events!event_logs_event_id_fkey (
          title
        )
      `)
      .in("id", registrationIds)

    if (registrationsError) {
      throw new Error(registrationsError.message)
    }

    if (!registrations || registrations.length === 0) {
      throw new Error("No registrations found for the provided IDs")
    }

    // Get event details if eventId is provided
    let eventTitle = "Event"
    if (eventId) {
      const { data: event } = await serviceClient
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single()
      
      if (event) {
        eventTitle = event.title
      }
    } else if (registrations[0]?.events && typeof registrations[0].events === 'object' && 'title' in registrations[0].events) {
      // Try to get event title from the first registration's event
      eventTitle = (registrations[0].events as any).title
    }

    // console.log(`Sending event notifications to ${registrations.length} recipients for event: ${eventTitle}`)

    // Prepare recipients data for email service
    const recipients = registrations.map(reg => ({
      email: reg.profiles && typeof reg.profiles === 'object' && 'email' in reg.profiles ? (reg.profiles as any).email : '',
      name: reg.profiles && typeof reg.profiles === 'object' && 'full_name' in reg.profiles ? (reg.profiles as any).full_name : 'Event Participant',
      registrationId: reg.id
    })).filter(r => r.email) // Filter out entries without email

    if (recipients.length === 0) {
      throw new Error("No valid email addresses found for the selected registrations")
    }

    // Send emails using the email service
    const emailResult = await emailService.sendEventNotificationEmails(
      recipients,
      subject,
      message,
      eventTitle,
      eventId || registrations[0]?.event_id
    )

    // console.log(`✅ Successfully sent ${emailResult.count} event notification emails`)

    return {
      success: true,
      notificationsCreated: emailResult.count,
      emailsSent: emailResult.count,
      recipients: recipients.map(r => ({ 
        email: r.email, 
        name: r.name,
        registrationId: r.registrationId 
      })),
      eventTitle
    }

  } catch (error) {
    // console.error("Error in sendEventNotification:", error)
    throw error
  }
}
