'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { EnhancedDiscussionItem } from './enhanced-discussion-item';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pin, 
  Lock, 
  MessageSquare, 
  Clock,
  Filter
} from 'lucide-react';
import type { DiscussionProps } from '@/types/discussion';
import { cn } from '@/lib/utils';

interface EnhancedDiscussionListProps {
  discussions: (DiscussionProps & {
    is_pinned?: boolean;
    is_locked?: boolean;
  })[];
  onRefresh?: () => void;
  className?: string;
}

export function EnhancedDiscussionList({
  discussions,
  onRefresh,
  className
}: EnhancedDiscussionListProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showModerationInfo, setShowModerationInfo] = useState(false);

  // Check user role for moderation permissions
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.id) return;
      
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
  }, [user]);

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
        // Show discussions from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const discussionDate = new Date(discussion.timestamp);
        return discussionDate > oneWeekAgo;
      default:
        return true;
    }
  });

  // Sort discussions: pinned first, then by timestamp (newest first)
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    // Pinned discussions always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then sort by timestamp (newest first)
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  const pinnedCount = discussions.filter(d => d.is_pinned).length;
  const lockedCount = discussions.filter(d => d.is_locked).length;

  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
          <p>Be the first to start a discussion!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Discussions</h2>
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
              onClick={() => setShowModerationInfo(!showModerationInfo)}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Moderation
            </Button>
          </div>
        )}
      </div>

      {/* Moderation info */}
      {showModerationInfo && (canPin || canLock) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-blue-800 mb-1">Moderation Controls</h4>
              <p className="text-sm text-blue-700">
                Hover over discussion cards to see pin and lock controls. 
                {canPin && ' You can pin important discussions to the top.'}
                {canLock && ' You can lock discussions to prevent new comments.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
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
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="pinned" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <DiscussionsGrid 
            discussions={sortedDiscussions}
            onRefresh={onRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* Empty state for filtered results */}
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
  onRefresh
}: {
  discussions: (DiscussionProps & {
    is_pinned?: boolean;
    is_locked?: boolean;
  })[];
  onRefresh?: () => void;
}) {
  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <EnhancedDiscussionItem
          key={discussion.id}
          discussion={discussion}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
} 