'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface CommentFormWithLockProps {
  discussionId: string;
  isLocked: boolean;
  onSubmit?: (content: string) => Promise<void>;
  className?: string;
}

export function CommentFormWithLock({
  discussionId,
  isLocked,
  onSubmit,
  className
}: CommentFormWithLockProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isLocked || !user) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(content.trim());
      setContent('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className={cn('border rounded-lg p-4 bg-muted/50', className)}>
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium text-sm">{user?.full_name || 'Anonymous'}</div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Discussion Locked</span>
          </div>
          <p className="text-sm text-red-600">
            This discussion has been locked by a moderator. No new comments can be added at this time.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn('border rounded-lg p-4 bg-muted/50', className)}>
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            Please log in to add a comment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('border rounded-lg p-4', className)}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">{user.full_name || 'Anonymous'}</div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {content.length}/1000 characters
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
} 