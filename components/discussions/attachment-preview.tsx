"use client"

import { Button } from "@/components/ui/button"
import { File, X } from "lucide-react"
import type { FileAttachment } from "@/types/discussion"
import { formatFileSize } from "@/utils/file-utils"

interface AttachmentPreviewProps {
  attachments: FileAttachment[]
  onRemove: (id: string) => void
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="relative">
          {attachment.type === "image" && attachment.previewUrl ? (
            <div className="relative bg-gray-50 rounded-lg p-2 flex items-center group">
              <div className="w-10 h-10 bg-gray-200 rounded mr-2 overflow-hidden">
                <img
                  src={attachment.previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm flex-grow truncate">{attachment.file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative bg-gray-50 rounded-lg p-2 flex items-center group">
              <File className="h-5 w-5 text-gray-400 mr-2" />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{attachment.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
