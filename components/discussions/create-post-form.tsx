"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Tag } from "lucide-react"
import type { PollOption, FileAttachment } from "@/types/discussion"
import { PollEditor } from "./poll-editor"
import { FileUploadButtons } from "./file-upload-buttons"
import { AttachmentPreview } from "./attachment-preview"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useDiscussionCategories } from "@/hooks/use-discussions"
import { createAttachment } from "@/lib/discussions-service"
import { uploadFile } from "@/lib/file-service"
import { toast } from "sonner"
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  formatFileSize,
} from "@/utils/file-utils"

// Available tags for the discussion
const availableTags = [
  "Question",
  "Tutorial",
  "News",
  "Announcement",
  "Help",
  "Discussion",
  "Troubleshooting",
  "Review",
  "Recommendation",
  "Project",
  "Event",
]

export function CreatePostForm() {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useDiscussionCategories()
  const [isExpanded, setIsExpanded] = useState(false)
  const [subjectText, setSubjectText] = useState("")
  const [postText, setPostText] = useState("")
  const [showPollEditor, setShowPollEditor] = useState(false)
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { emoji: "👍", text: "" },
    { emoji: "👎", text: "" },
  ])
  const [allowMultipleSelections, setAllowMultipleSelections] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "placeholder")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const postCardRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea when content changes
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current
      if (textarea && isExpanded) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto"
        // Set the height to scrollHeight to fit the content
        textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`
      }
    }

    adjustHeight()
    // Add event listener for window resize to readjust if needed
    window.addEventListener("resize", adjustHeight)

    return () => {
      window.removeEventListener("resize", adjustHeight)
    }
  }, [postText, isExpanded])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        postCardRef.current &&
        !postCardRef.current.contains(event.target as Node) &&
        isExpanded &&
        !subjectText.trim() &&
        !postText.trim()
      ) {
        setIsExpanded(false)
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside)

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded, subjectText, postText])

  // Set initial category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && (!selectedCategory || selectedCategory === "placeholder")) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.previewUrl && attachment.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.previewUrl)
        }
      })
    }
  }, [attachments])

  const togglePollEditor = () => {
    setShowPollEditor(!showPollEditor)
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const updatePollOptionEmoji = (index: number, emoji: string) => {
    console.log('🎨 Updating poll option emoji:', { index, emoji })
    const newOptions = [...pollOptions]
    newOptions[index].emoji = emoji
    setPollOptions(newOptions)
    console.log('🎨 Updated poll options:', newOptions)
  }

  const updatePollOptionText = (index: number, text: string) => {
    console.log('✏️ Updating poll option text:', { index, text })
    const newOptions = [...pollOptions]
    newOptions[index].text = text
    setPollOptions(newOptions)
    console.log('✏️ Updated poll options:', newOptions)
  }

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, { emoji: "🔍", text: "" }])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions]
      newOptions.splice(index, 1)
      setPollOptions(newOptions)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: FileAttachment[] = []

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload JPEG, PNG, GIF or WebP images.`)
        return
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`Image is too large. Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}.`)
        return
      }

      const previewUrl = URL.createObjectURL(file)
      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "image",
        previewUrl,
      })
    })

    setAttachments((prev) => [...prev, ...newFiles])
    setIsExpanded(true)
    e.target.value = "" // Reset input
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: FileAttachment[] = []

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload PDF, Word, text, or ZIP files.`)
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`)
        return
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "document",
      })
    })

    setAttachments((prev) => [...prev, ...newFiles])
    setIsExpanded(true)
    e.target.value = "" // Reset input
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id)
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl)
      }
      return prev.filter((a) => a.id !== id)
    })
  }

  const handlePostSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a discussion")
      return
    }

    if (!subjectText.trim()) {
      toast.error("Please enter a title for your discussion")
      return
    }

    if (!selectedCategory || selectedCategory === "placeholder") {
      toast.error("Please select a category for your discussion")
      return
    }

    // Validate poll if poll editor is active
    if (showPollEditor) {
      const validPollOptions = pollOptions.filter(opt => opt.text.trim())
      if (validPollOptions.length < 2) {
        toast.error("Please provide at least 2 poll options with text")
        return
      }
    }

    try {
      setIsSubmitting(true)

      // Determine content type
      const contentType = showPollEditor ? "poll" : (attachments.some(a => a.type === "image") ? "image" : "text")

      // Prepare discussion data
      const discussionData: any = {
        title: subjectText.trim(),
        content: postText.trim() || "", // Allow empty content for polls
        content_type: contentType,
        category_id: selectedCategory,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      }

      // Add poll data if poll editor is active
      if (showPollEditor && pollOptions.length >= 2) {
        const validPollOptions = pollOptions.filter(opt => opt.text.trim())
        console.log('🔍 Poll creation debug:')
        console.log('  - showPollEditor:', showPollEditor)
        console.log('  - pollOptions.length:', pollOptions.length)
        console.log('  - All poll options:', pollOptions)
        console.log('  - Valid poll options (non-empty text):', validPollOptions)
        console.log('  - Valid options count:', validPollOptions.length)
        
        if (validPollOptions.length >= 2) {
          const pollQuestion = postText.trim() || subjectText.trim() || "What do you think?"
          discussionData.poll = {
            question: pollQuestion,
            allowMultipleSelections: allowMultipleSelections,
            isAnonymous: false,
            expiresAt: null,
            options: validPollOptions.map(opt => ({
              text: JSON.stringify({ text: opt.text.trim(), emoji: opt.emoji }), // Store as JSON
              emoji: opt.emoji // Keep for backward compatibility
            }))
          }
          console.log('✅ Poll data being sent:', discussionData.poll)
        } else {
          console.log('❌ Not enough valid poll options:', validPollOptions.length, '(need at least 2)')
        }
      } else {
        console.log('❌ Poll editor conditions not met:', {
          showPollEditor,
          pollOptionsLength: pollOptions.length,
          hasMinOptions: pollOptions.length >= 2
        })
      }

      // Add final debugging before sending
      console.log('🚀 Final discussion data being sent:', JSON.stringify(discussionData, null, 2))

      // Create the discussion via API (which handles poll creation)
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discussionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create discussion')
      }

      const { discussion, poll } = await response.json()

      // Handle file uploads
      if (attachments.length > 0) {
        await uploadAttachments(attachments, undefined, discussion.id)
      }

      // Reset form
      setSubjectText("")
      setPostText("")
      setShowPollEditor(false)
      setPollOptions([
        { emoji: "👍", text: "" },
        { emoji: "👎", text: "" },
      ])
      setAllowMultipleSelections(false)
      setAttachments([])
      setSelectedCategory(categories[0]?.id || "placeholder")
      setSelectedTags([])
      setIsExpanded(false)

      // Success message
      const successMessage = poll 
        ? "Discussion with poll created successfully!" 
        : "Discussion created successfully!"
      toast.success(successMessage)
    } catch (error) {
      console.error("Error creating discussion:", error)
      toast.error(
        `Failed to create discussion: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to upload attachments
  const uploadAttachments = async (
    attachments: FileAttachment[],
    commentId?: string,
    discussionId?: string
  ) => {
    if (!user) {
      throw new Error("User must be authenticated to upload attachments")
    }

    const uploadedAttachments = []

    for (const attachment of attachments) {
      try {
        // Upload file using the new file service
        const uploadResult = await uploadFile(attachment.file)

        // Create attachment record in database
        const attachmentRecord = await createAttachment({
          discussion_id: discussionId,
          comment_id: commentId,
          file_name: attachment.file.name,
          file_url: uploadResult.url,
          file_type: attachment.file.type,
          mime_type: attachment.file.type,
          file_size: attachment.file.size,
          uploaded_by: user.id,
        })

        uploadedAttachments.push(attachmentRecord)
      } catch (error) {
        console.error(
          `Error uploading attachment ${attachment.file.name}:`,
          error
        )
        throw new Error(`Failed to upload ${attachment.file.name}`)
      }
    }

    return uploadedAttachments
  }

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value)
  }

  return (
    <div ref={postCardRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-3 mb-3 relative">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          UN
        </div>
        <div className="w-full relative">
          {isExpanded && (
            <input
              type="text"
              placeholder="Subject (optional)"
              className="w-full text-left justify-start text-gray-700 h-10 bg-gray-50 border border-gray-200 rounded-lg px-3 mb-2 animate-slideDown"
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
            />
          )}
          <textarea
            ref={textareaRef}
            className={`w-full text-left justify-start text-gray-500 min-h-[40px] ${
              isExpanded ? "" : "h-10 overflow-hidden"
            } bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 transition-all duration-300 resize-none overflow-hidden focus:outline-none gradient-border-focus`}
            placeholder="Start a discussion..."
            value={postText}
            onChange={handleTextareaChange}
            onClick={() => setIsExpanded(true)}
            rows={1}
          />
        </div>
      </div>

      {/* Category selection and Tags section - only visible when expanded */}
      {isExpanded && (
        <div className="space-y-3 mt-3 animate-slideDown">
          {/* Category selector */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {tag}
                  <button 
                    className="ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-800"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    handleAddTag(tagInput.trim());
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 text-white"
                onClick={() => tagInput.trim() && handleAddTag(tagInput.trim())}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Poll editor section - only visible when poll mode is active */}
      {showPollEditor && (
        <PollEditor
          pollOptions={pollOptions}
          allowMultipleSelections={allowMultipleSelections}
          onUpdateEmoji={updatePollOptionEmoji}
          onUpdateText={updatePollOptionText}
          onAddOption={addPollOption}
          onRemoveOption={removePollOption}
          onToggleMultipleSelections={() => setAllowMultipleSelections(!allowMultipleSelections)}
        />
      )}

      {/* Only show action buttons and post button when expanded */}
      {isExpanded && (
        <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
          {/* Responsive action buttons container: grid on mobile, flex on larger screens */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 sm:gap-0 w-full">
            <FileUploadButtons onImageUpload={handleImageUpload} onFileUpload={handleFileUpload} />

            {/* Poll toggle button */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-600 ${showPollEditor ? "bg-gray-100" : ""}`}
              onClick={togglePollEditor}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Poll
            </Button>

            {/* Tags button - expands the form and shows tag section */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={() => setIsExpanded(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </Button>
          </div>

          {/* Only show post button when expanded */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
            disabled={!subjectText.trim() || isSubmitting}
            onClick={handlePostSubmit}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      )}

      {/* Preview of uploaded files */}
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
    </div>
  )
}
