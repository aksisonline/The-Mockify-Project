'use client'

import { useEffect, useState, useCallback } from 'react'
import { notificationService, Notification } from '@/lib/notification-service'
import { useAuth } from '@/contexts/auth-context'
import { toast as showToast } from "@/hooks/use-toast";

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(unreadOnly = false): UseNotificationsResult {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<Error | null>(null)

  const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Fetch notifications with pagination and optional unread filter
      const fetched = await notificationService.getUserNotifications(
        user.id,
        { limit: 20, offset: (pageNum - 1) * 20, unreadOnly }
      )
      // Update notifications list
      if (append) {
        setNotifications(prev => [...prev, ...fetched])
      } else {
        setNotifications(fetched)
      }
      // Determine if more pages exist
      setHasMore(fetched.length === 20)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, unreadOnly])

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return

    try {
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }, [user?.id])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId)
      if (success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const success = await notificationService.markAllAsRead(user.id)
      if (success) {
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            is_read: true,
            read_at: new Date().toISOString()
          }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user?.id])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.deleteNotification(notificationId)
      if (success) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        )
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === notificationId)
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [notifications])

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await loadNotifications(page + 1, true)
    }
  }, [hasMore, isLoading, page, loadNotifications])

  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(1, false),
      loadUnreadCount()
    ])
  }, [loadNotifications, loadUnreadCount])

  // Add sound ref for notification sound
  const notificationSound = typeof window !== 'undefined' ? new Audio('/notification_ping.mp3') : null;
  // Track if this is the initial load
  const [initialLoad, setInitialLoad] = useState(true);

  const playPing = async () => {
    if (notificationSound) {
      try { notificationSound.currentTime = 0; await notificationSound.play(); } catch (e) {}
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      (async () => {
        await refresh();
        setInitialLoad(false);
      })();
    }
  }, [user?.id, refresh]);

  // Polling for new notifications with focus detection
  useEffect(() => {
    if (!user?.id) return;

    let cleanupPolling: (() => void) | undefined;

    // Start polling for new notifications
    cleanupPolling = notificationService.startPolling(user.id, (newNotifications) => {
      // Only process new notifications after initial load
      if (!initialLoad && newNotifications.length > 0) {
        setNotifications(prev => {
          // Create a Set of existing notification IDs for efficient lookup
          const existingIds = new Set(prev.map(n => n.id));
          
          // Filter out notifications that already exist
          const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
          
          // Only update state if there are actually new notifications
          if (uniqueNewNotifications.length === 0) {
            return prev;
          }
          
          // Add new notifications to the beginning of the array
          const updatedNotifications = [
            ...uniqueNewNotifications,
            ...prev,
          ];

          // Update unread count
          const newUnreadCount = uniqueNewNotifications.filter(n => !n.is_read).length;
          if (newUnreadCount > 0) {
            setUnreadCount(prev => prev + newUnreadCount);
            
            // Play notification sound and show toast for new unread notifications
            playPing();
            showToast({
              title: newUnreadCount === 1 ? "New Notification" : `${newUnreadCount} New Notifications`,
              description: newUnreadCount === 1 
                ? uniqueNewNotifications[0].message || ""
                : "Check your notification tray for details.",
            });
          }

          return updatedNotifications;
        });
      }
    });

    return () => {
      if (cleanupPolling) {
        cleanupPolling();
      }
    };
  }, [user?.id, initialLoad]);

  // On initial load, if there are multiple unread notifications, show a single toast and play a single ping
  useEffect(() => {
    if (!initialLoad && notifications.length > 1 && unreadCount > 1) {
      // Only show this once on initial load
      playPing();
      showToast({
        title: `You have ${unreadCount} pending notifications`,
        description: "Check your notification tray for details.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, notifications.length, unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh
  }
}

// Hook for just getting unread count (lighter weight)
export function useUnreadNotificationCount() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const loadCount = async () => {
      const count = await notificationService.getUnreadCount(user.id!)
      setUnreadCount(count)
    }

    loadCount()

    // Poll for updates with focus detection
    let cleanupPolling: (() => void) | undefined;
    
    cleanupPolling = notificationService.startPolling(user.id, (newNotifications) => {
      const newUnreadCount = newNotifications.filter(n => !n.is_read).length;
      if (newUnreadCount > 0) {
        setUnreadCount(prev => prev + newUnreadCount);
      }
    });

    return () => {
      if (cleanupPolling) {
        cleanupPolling();
      }
    };
  }, [user?.id])

  return unreadCount
}
