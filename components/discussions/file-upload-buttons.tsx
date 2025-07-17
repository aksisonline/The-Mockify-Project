"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ImageIcon, Paperclip } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatFileSize, MAX_FILE_SIZE, MAX_IMAGE_SIZE } from "@/utils/file-utils"

interface FileUploadButtonsProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploadButtons({ onImageUpload, onFileUpload }: FileUploadButtonsProps) {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                className="hidden"
                onChange={onImageUpload}
                multiple
              />
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Max size: {formatFileSize(MAX_IMAGE_SIZE)}</p>
            <p className="text-xs">Supported: JPG, PNG, GIF, WebP</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label>
              <input
                type="file"
                id="fileUpload"
                accept=".pdf,.doc,.docx,.txt,.zip"
                className="hidden"
                onChange={onFileUpload}
                multiple
              />
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachment
              </Button>
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Max size: {formatFileSize(MAX_FILE_SIZE)}</p>
            <p className="text-xs">Supported: PDF, DOC, TXT, ZIP</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}
