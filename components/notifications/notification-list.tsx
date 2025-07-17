'use client'

import { useState } from 'react'
import { Notification } from '@/lib/notification-service'
import { useNotifications } from '@/hooks/use-notifications'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from './notification-item'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  onClose: () => void
}

export function NotificationList({ notifications, loading, onClose }: NotificationListProps) {
  const { deleteNotification } = useNotifications()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (notificationId: string) => {
    try {
      setDeletingId(notificationId)
      await deleteNotification(notificationId)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No notifications
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-1 p-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDelete={() => handleDelete(notification.id)}
            isDeleting={deletingId === notification.id}
            onClose={onClose}
          />
        ))}
      </div>
    </ScrollArea>
  )
} 