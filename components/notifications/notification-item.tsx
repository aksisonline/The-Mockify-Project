'use client'

import { useState } from 'react'
import { Notification } from '@/lib/notification-service'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: Notification
  onDelete: () => void
  isDeleting: boolean
  onClose: () => void
}

export function NotificationItem({
  notification,
  onDelete,
  isDeleting,
  onClose
}: NotificationItemProps) {
  const { markAsRead } = useNotifications()
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  const handleMarkAsRead = async () => {
    try {
      setIsMarkingRead(true)
      await markAsRead(notification.id)
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleClick = async () => {
    if (!notification.is_read) {
      await handleMarkAsRead()
    }
    onClose()
  }

  const content = (
    <div className="flex items-start gap-4 p-4">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
          >
            {isMarkingRead ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <Card
      className={cn(
        'transition-colors hover:bg-muted/50',
        !notification.is_read && 'bg-muted/50'
      )}
    >
      {notification.action_url ? (
        <Link href={notification.action_url} onClick={handleClick}>
          {content}
        </Link>
      ) : (
        <div onClick={handleClick} className="cursor-pointer">
          {content}
        </div>
      )}
    </Card>
  )
} 