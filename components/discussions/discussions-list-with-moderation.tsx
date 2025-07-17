'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/auth-context';
import { EnhancedDiscussionItem } from './enhanced-discussion-item';
import { LockedDiscussionWarning } from './pin-lock-controls';
import { useDiscussionModeration } from '@/hooks/use-discussion-moderation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pin, 
  Lock, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Discussion {
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
  view_count: number;
  comment_count: number;
  upvote_count: number;
  downvote_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  tags?: string[];
}

interface DiscussionsListWithModerationProps {
  discussions: Discussion[];
  onRefresh?: () => void;
  className?: string;
}

export function DiscussionsListWithModeration({
  discussions,
  onRefresh,
  className
}: DiscussionsListWithModerationProps) {
  const { session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showLockedWarning, setShowLockedWarning] = useState(false);
  
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

  // Filter discussions based on active tab
  const filteredDiscussions = discussions.filter(discussion => {
    switch (activeTab) {
      case 'pinned':
        return discussion.is_pinned;
      case 'locked':
        return discussion.is_locked;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(discussion.created_at) > oneWeekAgo;
      case 'trending':
        return discussion.comment_count > 10 || discussion.view_count > 100;
      default:
        return true;
    }
  });

  // Sort discussions: pinned first, then by creation date
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pinnedCount = discussions.filter(d => d.is_pinned).length;
  const lockedCount = discussions.filter(d => d.is_locked).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Discussions</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{discussions.length} total</span>
            {pinnedCount > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Pin className="w-3 h-3 mr-1" />
                {pinnedCount} pinned
              </Badge>
            )}
            {lockedCount > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <Lock className="w-3 h-3 mr-1" />
                {lockedCount} locked
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
              onClick={() => setShowLockedWarning(!showLockedWarning)}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Moderation
            </Button>
          </div>
        )}
      </div>

      {/* Locked discussions warning */}
      {showLockedWarning && lockedCount > 0 && (
        <LockedDiscussionWarning />
      )}

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            All
          </TabsTrigger>
          <TabsTrigger value="pinned" className="flex items-center gap-1">
            <Pin className="w-3 h-3" />
            Pinned
            {pinnedCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {pinnedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="locked" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Locked
            {lockedCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {lockedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            canPin={canPin}
            canLock={canLock}
            onPinToggle={togglePin}
            onLockToggle={toggleLock}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pinned" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            canPin={canPin}
            canLock={canLock}
            onPinToggle={togglePin}
            onLockToggle={toggleLock}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            canPin={canPin}
            canLock={canLock}
            onPinToggle={togglePin}
            onLockToggle={toggleLock}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            canPin={canPin}
            canLock={canLock}
            onPinToggle={togglePin}
            onLockToggle={toggleLock}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            canPin={canPin}
            canLock={canLock}
            onPinToggle={togglePin}
            onLockToggle={toggleLock}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Empty state */}
      {sortedDiscussions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No discussions found
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'pinned' && 'No pinned discussions yet'}
            {activeTab === 'locked' && 'No locked discussions'}
            {activeTab === 'recent' && 'No recent discussions'}
            {activeTab === 'trending' && 'No trending discussions'}
            {activeTab === 'all' && 'No discussions available'}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper component for rendering discussions grid
function DiscussionsGrid({
  discussions,
  canPin,
  canLock,
  onPinToggle,
  onLockToggle,
  isLoading
}: {
  discussions: Discussion[];
  canPin: boolean;
  canLock: boolean;
  onPinToggle: (discussionId: string, pinned: boolean) => Promise<void>;
  onLockToggle: (discussionId: string, locked: boolean) => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4">
      {discussions.map((discussion) => (
        <EnhancedDiscussionItem
          key={discussion.id}
          discussion={discussion}
          canPin={canPin}
          canLock={canLock}
          onPinToggle={onPinToggle}
          onLockToggle={onLockToggle}
        />
      ))}
    </div>
  );
} 