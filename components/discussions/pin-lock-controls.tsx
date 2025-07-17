'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pin, 
  PinOff, 
  Lock, 
  Unlock, 
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PinLockControlsProps {
  discussionId: string;
  isPinned: boolean;
  isLocked: boolean;
  canPin: boolean;
  canLock: boolean;
  onPinToggle?: (discussionId: string, pinned: boolean) => Promise<void>;
  onLockToggle?: (discussionId: string, locked: boolean) => Promise<void>;
  className?: string;
}

export function PinLockControls({
  discussionId,
  isPinned,
  isLocked,
  canPin,
  canLock,
  onPinToggle,
  onLockToggle,
  className
}: PinLockControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePinToggle = async () => {
    if (!canPin || !onPinToggle) return;
    
    setIsLoading(true);
    try {
      await onPinToggle(discussionId, !isPinned);
      toast({
        title: isPinned ? 'Discussion unpinned' : 'Discussion pinned',
        description: isPinned 
          ? 'Discussion has been removed from pinned discussions'
          : 'Discussion has been pinned to the top',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update pin status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockToggle = async () => {
    if (!canLock || !onLockToggle) return;
    
    setIsLoading(true);
    try {
      await onLockToggle(discussionId, !isLocked);
      toast({
        title: isLocked ? 'Discussion unlocked' : 'Discussion locked',
        description: isLocked 
          ? 'Discussion is now open for new comments'
          : 'Discussion is now locked and no new comments can be added',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lock status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pin Badge */}
      {isPinned && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Pin className="w-3 h-3 mr-1" />
          Pinned
        </Badge>
      )}

      {/* Lock Badge */}
      {isLocked && (
        <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      )}

      {/* Admin Controls */}
      {(canPin || canLock) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canPin && (
              <DropdownMenuItem
                onClick={handlePinToggle}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isPinned ? (
                  <>
                    <PinOff className="w-4 h-4" />
                    Unpin Discussion
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4" />
                    Pin Discussion
                  </>
                )}
              </DropdownMenuItem>
            )}
            
            {canPin && canLock && <DropdownMenuSeparator />}
            
            {canLock && (
              <DropdownMenuItem
                onClick={handleLockToggle}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Discussion
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock Discussion
                  </>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Locked Discussion Warning Component
export function LockedDiscussionWarning() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-amber-800 mb-1">
            Discussion Locked
          </h4>
          <p className="text-sm text-amber-700">
            This discussion has been locked by a moderator. No new comments can be added, but you can still view existing comments.
          </p>
        </div>
      </div>
    </div>
  );
} 