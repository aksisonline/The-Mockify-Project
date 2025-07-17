import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseDiscussionModerationProps {
  onSuccess?: () => void;
}

export function useDiscussionModeration({ onSuccess }: UseDiscussionModerationProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const togglePin = async (discussionId: string, pinned: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussions/${discussionId}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_pinned: pinned }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pin status');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update pin status',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLock = async (discussionId: string, locked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/discussions/${discussionId}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_locked: locked }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lock status');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update lock status',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    togglePin,
    toggleLock,
  };
} 