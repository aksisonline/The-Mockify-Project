export interface CreateNotificationOptions {
  userId: string
  title: string
  message: string
  type: string
  priority?: string
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
  notification_type: string
  priority: string
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

// Client-side notification service that uses API routes
class ClientNotificationService {
  private pollTimeout?: NodeJS.Timeout
  private isTabFocused: boolean = true
  private isPolling: boolean = false
  private currentUserId?: string
  private currentCallback?: (notifications: Notification[]) => void
  private cleanupFocusDetection?: () => void

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
      if (this.isTabFocused && !wasFocused && this.currentUserId && typeof this.currentCallback === 'function') {
        this.resumePolling()
      }
      // If tab just lost focus and we were polling, pause polling
      else if (!this.isTabFocused && wasFocused && this.isPolling) {
        this.pausePolling()
      }
    }

    // Listen for window focus/blur events as backup
    const handleWindowFocus = () => {
      if (!this.isTabFocused && this.currentUserId && typeof this.currentCallback === 'function') {
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
   * Perform a single polling operation
   */
  private async performPoll() {
    if (!this.currentUserId || !this.currentCallback) return

    try {
      const notifications = await this.getUserNotifications(this.currentUserId, { unreadOnly: true })
      if (notifications.length > 0 && typeof this.currentCallback === 'function') {
        this.currentCallback(notifications)
      }
    } catch (error) {
      console.error('Error polling notifications:', error)
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
    if (!this.currentUserId || typeof this.currentCallback !== 'function' || this.pollTimeout) return

    this.isPolling = true
    this.pollTimeout = setInterval(async () => {
      await this.performPoll()
    }, 30000) // Poll every 30 seconds

    // Perform an immediate poll when resuming to catch any missed notifications
    this.performPoll()
  }

  async createNotification(options: CreateNotificationOptions): Promise<Notification | null> {
    try {
      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  async createNotificationFromTemplate(
    templateName: string,
    userId: string,
    variables: Record<string, string>,
    options: Partial<CreateNotificationOptions> = {}
  ): Promise<Notification | null> {
    try {
      const response = await fetch('/api/notifications/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          userId,
          variables,
          options
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create notification from template')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating notification from template:', error)
      return null
    }
  }

  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: string
    } = {}
  ): Promise<Notification[]> {
    try {
      const params = new URLSearchParams()
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      if (options.unreadOnly) params.append('unreadOnly', 'true')
      if (options.type) params.append('type', options.type)

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      return data.notifications || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch unread count')
      }

      const data = await response.json()
      return data.count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  startPolling(userId: string, onNewNotifications: (notifications: Notification[]) => void) {
    // Validate inputs
    if (!userId || typeof onNewNotifications !== 'function') {
      console.error('Invalid parameters for startPolling:', { userId, onNewNotifications })
      return () => {}
    }

    // Stop any existing polling
    this.stopPolling()

    // Store current polling state
    this.currentUserId = userId
    this.currentCallback = onNewNotifications

    // Initialize focus detection
    this.cleanupFocusDetection = this.initializeFocusDetection()

    // Start polling (will only start if tab is focused)
    this.resumePolling()

    // Return cleanup function
    return () => {
      this.stopPolling()
    }
  }

  stopPolling() {
    if (this.pollTimeout) {
      clearInterval(this.pollTimeout)
      this.pollTimeout = undefined
    }
    this.isPolling = false
    this.currentUserId = undefined
    this.currentCallback = undefined
    
    // Clean up focus detection
    if (this.cleanupFocusDetection) {
      this.cleanupFocusDetection()
      this.cleanupFocusDetection = undefined
    }
  }
}

// Export a singleton instance
export const notificationService = new ClientNotificationService()

// Send event notification via API
export async function sendEventNotification(
  registrationIds: string[],
  subject: string,
  message: string,
  eventId?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationIds,
        subject,
        message,
        eventId
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending event notification:', error)
    return false
  }
}

// Send training notification via API
export async function sendTrainingNotification(
  enrollmentIds: string[],
  subject: string,
  message: string,
  programId?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrollmentIds,
        subject,
        message,
        programId
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending training notification:', error)
    return false
  }
} 