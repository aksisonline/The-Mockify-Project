import { Button } from "@/components/ui/button"
import type { DiscussionProps } from "@/types/discussion"
import { DiscussionItem } from "./discussion-item"

interface DiscussionListProps {
  discussions: DiscussionProps[]
}

export function DiscussionList({ discussions }: DiscussionListProps) {
  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
          <p>Be the first to start a discussion!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <DiscussionItem key={discussion.id} discussion={discussion} />
      ))}
    </div>
  )
}
