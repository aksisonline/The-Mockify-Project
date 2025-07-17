"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { PollOption } from "@/types/discussion"
import { useState } from "react"
import EmojiPicker from "emoji-picker-react"

interface PollEditorProps {
  pollOptions: PollOption[]
  allowMultipleSelections: boolean
  onUpdateEmoji: (index: number, emoji: string) => void
  onUpdateText: (index: number, text: string) => void
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onToggleMultipleSelections: () => void
}

export function PollEditor({
  pollOptions,
  allowMultipleSelections,
  onUpdateEmoji,
  onUpdateText,
  onAddOption,
  onRemoveOption,
  onToggleMultipleSelections,
}: PollEditorProps) {
  const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-slideDown">
      <h4 className="font-medium text-gray-700 mb-2">Create Poll</h4>
      <div className="space-y-2 mb-3">
        {pollOptions.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 relative">
            {/* Emoji button and picker */}
            <button
              type="button"
              className="w-10 h-10 text-2xl bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 focus:outline-none"
              onClick={() => setPickerOpenIndex(pickerOpenIndex === index ? null : index)}
            >
              {option.emoji || "🔍"}
            </button>
            {pickerOpenIndex === index && (
              <div className="absolute z-50 top-12 left-0">
                {/* Emoji selector */}
                <EmojiPicker
                  onEmojiClick={(emoji) => {
                    onUpdateEmoji(index, emoji.emoji)
                    setPickerOpenIndex(null)
                  }}
                />
              </div>
            )}
            <Input
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => onUpdateText(index, e.target.value)}
              className="flex-grow"
            />
            {index > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => onRemoveOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onAddOption} disabled={pollOptions.length >= 10}>
          Add Option
        </Button>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="multipleSelect"
            checked={allowMultipleSelections}
            onChange={onToggleMultipleSelections}
            className="mr-2"
          />
          <label htmlFor="multipleSelect" className="text-sm text-gray-600">
            Allow multiple selections
          </label>
        </div>
      </div>
    </div>
  )
}
