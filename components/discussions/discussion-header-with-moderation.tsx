'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/auth-context';
import { PinLockControls } from './pin-lock-controls';
import { LockedDiscussionWarning } from './pin-lock-controls';
import { useDiscussionModeration } from '@/hooks/use-discussion-moderation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { 
  Pin, 
  Lock, 
  User, 
  Calendar,
  Tag,
  Edit,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscussionHeaderWithModerationProps {
  discussion: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    category: {
      id: string;
      name: string;
      color?: string;
    };
    created_at: string;
    updated_at: string;
    is_pinned: boolean;
    is_locked: boolean;
    tags?: string[];
  };
  onRefresh?: () => void;
  className?: string;
}

export function DiscussionHeaderWithModeration({
  discussion,
  onRefresh,
  className
}: DiscussionHeaderWithModerationProps) {
  const { session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showModerationControls, setShowModerationControls] = useState(false);
  
  const { togglePin, toggleLock, isLoading } = useDiscussionModeration({
    onSuccess: onRefresh
  });

  // Check user role for moderation permissions
  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.profile?.role || null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [session]);

  const canPin = userRole === 'admin' || userRole === 'moderator';
  const canLock = userRole === 'admin' || userRole === 'moderator';
  const isAuthor = session?.user?.id === discussion.author.id;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Locked discussion warning */}
      {discussion.is_locked && (
        <LockedDiscussionWarning />
      )}

      {/* Header */}
      <div className="space-y-4">
        {/* Title and moderation controls */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2 break-words">
              {discussion.title}
            </h1>
            
            {/* Status badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge 
                variant="outline" 
                className="text-sm"
                style={{ 
                  borderColor: discussion.category.color,
                  color: discussion.category.color 
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {discussion.category.name}
              </Badge>
              
              {discussion.is_pinned && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
              
              {discussion.is_locked && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </div>

          {/* Moderation controls */}
          {(canPin || canLock) && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationControls(!showModerationControls)}
                className="text-xs"
              >
                Moderation
              </Button>
            </div>
          )}
        </div>

        {/* Moderation controls panel */}
        {showModerationControls && (canPin || canLock) && (
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Moderation Controls</h4>
                <p className="text-sm text-muted-foreground">
                  Manage discussion visibility and engagement
                </p>
              </div>
              <PinLockControls
                discussionId={discussion.id}
                isPinned={discussion.is_pinned}
                isLocked={discussion.is_locked}
                canPin={canPin}
                canLock={canLock}
                onPinToggle={togglePin}
                onLockToggle={toggleLock}
              />
            </div>
          </div>
        )}

        {/* Author info and metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={discussion.author.avatar_url} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{discussion.author.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                {discussion.updated_at !== discussion.created_at && (
                  <>
                    <span>•</span>
                    <span>edited {formatDistanceToNow(new Date(discussion.updated_at), { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isAuthor && !discussion.is_locked && (
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {discussion.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          {discussion.content}
        </p>
      </div>
    </div>
  );
} 