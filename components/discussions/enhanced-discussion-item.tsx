'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Heart, 
  Eye,
  User,
  Pin,
  Lock,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useVoting, useViewing } from '@/hooks/use-discussions';
import { useDiscussionModeration } from '@/hooks/use-discussion-moderation';
import { useToast } from '@/hooks/use-toast';
import type { DiscussionProps } from '@/types/discussion';
import { cn } from '@/lib/utils';

interface EnhancedDiscussionItemProps {
  discussion: DiscussionProps & {
    is_pinned?: boolean;
    is_locked?: boolean;
  };
  onRefresh?: () => void;
  className?: string;
}

export function EnhancedDiscussionItem({
  discussion,
  onRefresh,
  className
}: EnhancedDiscussionItemProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Voting hooks
  const { voteOnDiscussion, loading: voteLoading } = useVoting();
  const { recordDiscussionView } = useViewing();
  
  // Moderation hook
  const { togglePin, toggleLock, isLoading: moderationLoading } = useDiscussionModeration({
    onSuccess: onRefresh
  });

  const [likeCount, setLikeCount] = useState(discussion.likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  // Record view when component mounts
  useEffect(() => {
    if (user && !viewRecorded) {
      recordDiscussionView(discussion.id, user.id);
      setViewRecorded(true);
    }
  }, [user, discussion.id, viewRecorded, recordDiscussionView]);

  const canPin = userRole === 'admin' || userRole === 'moderator';
  const canLock = userRole === 'admin' || userRole === 'moderator';

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || voteLoading) return;

    try {
      if (!isLiked) {
        await voteOnDiscussion(discussion.id, user.id, 'up');
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      } else {
        await voteOnDiscussion(discussion.id, user.id, 'down');
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote on discussion',
        variant: 'destructive',
      });
    }
  };

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canPin || moderationLoading) return;

    try {
      await togglePin(discussion.id, !discussion.is_pinned);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleLockToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canLock || moderationLoading) return;

    try {
      await toggleLock(discussion.id, !discussion.is_locked);
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleClick = () => {
    router.push(`/discussions/${discussion.id}`);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border p-4 hover:border-blue-300 transition-all duration-200 cursor-pointer group relative',
        discussion.is_pinned && 'border-yellow-200 bg-yellow-50/50',
        discussion.is_locked && 'border-red-200 bg-red-50/50',
        className
      )}
      onClick={handleClick}
    >
      {/* Pin/Lock Controls - Only visible on hover for admins/moderators */}
      {(canPin || canLock) && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={moderationLoading}
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canPin && (
                <DropdownMenuItem
                  onClick={handlePinToggle}
                  disabled={moderationLoading}
                  className="flex items-center gap-2"
                >
                  {discussion.is_pinned ? (
                    <>
                      <Pin className="w-4 h-4" />
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
                  disabled={moderationLoading}
                  className="flex items-center gap-2"
                >
                  {discussion.is_locked ? (
                    <>
                      <Lock className="w-4 h-4" />
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
        </div>
      )}

      {/* Author info */}
      <div className="flex items-center mb-3">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={discussion.author.avatar} />
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{discussion.author.name}</h3>
            {discussion.author.role && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {discussion.author.role}
              </Badge>
            )}
            {/* Pin/Lock badges */}
            {discussion.is_pinned && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {discussion.is_locked && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{discussion.timestamp}</p>
        </div>
      </div>

      {/* Post content */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h2>
        <p className="text-gray-700 mb-3">{discussion.preview}</p>

        {/* Poll */}
        {discussion.hasPoll && discussion.poll && (
          <div onClick={(e) => e.stopPropagation()} className="mb-4">
            {/* Your existing Poll component */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium mb-2">{discussion.poll.question}</h4>
              <div className="space-y-2">
                {discussion.poll.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <span className="text-sm">{option.text}</span>
                    <span className="text-xs text-gray-500">({option.votes} votes)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {discussion.tags.map((tag) => (
              <Badge key={tag} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Interaction stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/discussions/${discussion.id}#comments`);
              }}
              aria-label={`View ${discussion.commentCount} comments`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">{discussion.commentCount}</span>
            </button>
            
            <button
              className={cn(
                "flex items-center",
                isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600",
                voteLoading ? "opacity-50" : ""
              )}
              onClick={handleLike}
              disabled={voteLoading || !user}
              aria-label={isLiked ? "Unlike this discussion" : "Like this discussion"}
            >
              <Heart className={cn("h-4 w-4 mr-1", isLiked ? "fill-current" : "")} />
              <span className="text-sm">{likeCount}</span>
            </button>

            <div className="flex items-center text-gray-400">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm">{discussion.view_count || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {discussion.isNew && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 