"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Paperclip, X } from "lucide-react"

interface NewDiscussionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  availableTags: string[]
}

export function NewDiscussionDialog({ isOpen, onOpenChange, availableTags }: NewDiscussionDialogProps) {
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("")
  const [newDiscussionContent, setNewDiscussionContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleAddAttachment = () => {
    // In a real app, this would open a file picker
    // console.log("Add attachment clicked")
  }

  const handleSubmitDiscussion = () => {
    // console.log({
    //   title: newDiscussionTitle,
    //   content: newDiscussionContent,
    //   tags: selectedTags,
    // })

    // Reset form and close dialog
    setNewDiscussionTitle("")
    setNewDiscussionContent("")
    setSelectedTags([])
    onOpenChange(false)

    // Show success message (in a real app)
    alert("Discussion created successfully!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Discussion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter discussion title"
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="What would you like to discuss?"
              className="min-h-[150px]"
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {tag}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
            <Select onValueChange={handleAddTag}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add tags" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag} disabled={selectedTags.includes(tag)}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attachments</label>
            <div className="space-y-2 mb-2">{/* Attachments would be displayed here */}</div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                className="flex items-center"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Add Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                className="flex items-center"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Add File
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmitDiscussion}
            disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim()}
          >
            Post Discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
