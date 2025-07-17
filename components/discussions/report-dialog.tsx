'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Flag, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  discussionId?: string;
  commentId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Unwanted commercial content or repetitive posts'
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or abusive behavior'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Offensive, vulgar, or unsuitable material'
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other violations of community guidelines'
  }
] as const;

export function ReportDialog({
  discussionId,
  commentId,
  trigger,
  onSuccess
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) return;

    setIsSubmitting(true);
    try {

      
      const response = await fetch('/api/discussions/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined,
          discussionId,
          commentId,
        }),
      });

      // console.log('Report API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Report API error:', errorData);
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const result = await response.json();
      // console.log('Report API success:', result);

      toast({
        title: 'Report submitted',
        description: 'Thank you for your report. We will review it shortly.',
      });

      setIsOpen(false);
      setReason('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      setDescription('');
    }
    setIsOpen(open);
  };

  const contentType = commentId ? 'comment' : 'discussion';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report {contentType}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {REPORT_REASONS.map((reportReason) => (
                <div key={reportReason.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <div className="flex-1">
                    <Label htmlFor={reportReason.value} className="font-medium">
                      {reportReason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {reportReason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional context that will help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!reason || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 