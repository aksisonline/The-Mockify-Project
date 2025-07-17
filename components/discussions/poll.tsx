"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, CheckSquare, Square } from "lucide-react"
import type { Poll as PollType } from "@/types/discussion"

interface PollProps {
  poll: PollType
  onVote?: (optionIndex: number) => void
  userVotes?: number[]
  className?: string
}

export function Poll({ poll, onVote, userVotes = [], className = "" }: PollProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>(userVotes)
  const [hasVoted, setHasVoted] = useState(userVotes.length > 0)
  const [localPoll, setLocalPoll] = useState<PollType>({ ...poll })

  const handleVote = (optionIndex: number) => {
    if (hasVoted && !poll.allowMultiple) return

    let newSelectedOptions: number[]

    if (poll.allowMultiple) {
      // For multi-choice polls
      if (selectedOptions.includes(optionIndex)) {
        // Unselect option
        newSelectedOptions = selectedOptions.filter((index) => index !== optionIndex)
      } else {
        // Select option
        newSelectedOptions = [...selectedOptions, optionIndex]
      }
    } else {
      // For single-choice polls
      newSelectedOptions = [optionIndex]
    }

    setSelectedOptions(newSelectedOptions)

    // If this is the first vote or we're changing a single-choice vote
    if (!hasVoted || (!poll.allowMultiple && newSelectedOptions.length > 0)) {
      // Update local poll data
      const updatedOptions = [...localPoll.options]

      // For single choice, we need to handle the case where the user changes their vote
      if (!poll.allowMultiple && hasVoted && selectedOptions.length > 0) {
        // Remove the previous vote
        updatedOptions[selectedOptions[0]].votes -= 1
      }

      // Add the new vote
      if (newSelectedOptions.length > 0) {
        updatedOptions[optionIndex].votes += 1

        setLocalPoll({
          ...localPoll,
          options: updatedOptions,
          totalVotes: poll.allowMultiple
            ? localPoll.totalVotes + (newSelectedOptions.length - selectedOptions.length)
            : hasVoted
              ? localPoll.totalVotes
              : localPoll.totalVotes + 1,
        })

        setHasVoted(true)

        if (onVote) {
          onVote(optionIndex)
        }
      }
    }
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${className}`}>
      <h4 className="font-medium text-gray-800 mb-2">{localPoll.question}</h4>
      <div className="space-y-2">
        {localPoll.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index)
          const percentage = localPoll.totalVotes > 0 ? Math.round((option.votes / localPoll.totalVotes) * 100) : 0

          return (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-100"
              } ${!hasVoted || (hasVoted && (poll.allowMultiple || isSelected)) ? "cursor-pointer" : ""}`}
              onClick={() => handleVote(index)}
            >
              <div className="w-8 flex-shrink-0 text-center">{option.emoji}</div>
              <div className="flex-grow">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{option.text}</span>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={percentage}
                    className={`h-2 flex-grow ${isSelected ? "bg-blue-100" : "bg-gray-200"}`}
                  />
                  <span className="text-xs text-gray-500">{option.votes}</span>
                </div>
              </div>
              {poll.allowMultiple ? (
                isSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )
              ) : isSelected ? (
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">{localPoll.totalVotes} votes</span>
        <span className="text-xs text-gray-500">
          {localPoll.allowMultiple ? "Multiple choices allowed" : "Single choice only"}
        </span>
      </div>
    </div>
  )
}
