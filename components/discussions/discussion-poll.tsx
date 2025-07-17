"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, CheckSquare, Square, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePollVoting } from "@/hooks/use-polls"
import type { DiscussionPoll } from "@/types/discussion"

interface DiscussionPollProps {
  poll: DiscussionPoll
  discussionId: string
  onVoteUpdate?: () => void
  className?: string
}

export function DiscussionPollComponent({ 
  poll, 
  discussionId, 
  onVoteUpdate, 
  className = "" 
}: DiscussionPollProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.userVotes || [])
  const [localPoll, setLocalPoll] = useState<DiscussionPoll>(poll)
  const [hasChanged, setHasChanged] = useState(false)
  const { votePoll, isVoting } = usePollVoting()

  // Update local state when poll prop changes
  useEffect(() => {
    setLocalPoll(poll)
    setSelectedOptions(poll.userVotes || [])
    setHasChanged(false)
  }, [poll])

  // Check if poll has expired
  const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false

  const handleOptionToggle = (optionId: string) => {
    if (isExpired) return

    let newSelectedOptions: string[]

    if (poll.is_multiple_choice) {
      // For multi-choice polls
      if (selectedOptions.includes(optionId)) {
        // Unselect option
        newSelectedOptions = selectedOptions.filter((id) => id !== optionId)
      } else {
        // Select option
        newSelectedOptions = [...selectedOptions, optionId]
      }
    } else {
      // For single-choice polls
      newSelectedOptions = selectedOptions.includes(optionId) ? [] : [optionId]
    }

    setSelectedOptions(newSelectedOptions)
    setHasChanged(
      JSON.stringify(newSelectedOptions.sort()) !== JSON.stringify((poll.userVotes || []).sort())
    )
  }

  const handleSubmitVote = async () => {
    const success = await votePoll(discussionId, poll.id, selectedOptions)
    if (success) {
      setHasChanged(false)
      // Update local poll data optimistically
      const updatedOptions = localPoll.options.map(option => {
        const wasSelected = (poll.userVotes || []).includes(option.id)
        const isSelected = selectedOptions.includes(option.id)
        
        let newVoteCount = option.vote_count
        if (wasSelected && !isSelected) {
          newVoteCount -= 1
        } else if (!wasSelected && isSelected) {
          newVoteCount += 1
        }
        
        return { ...option, vote_count: newVoteCount }
      })

      const totalVotesChange = selectedOptions.length - (poll.userVotes || []).length
      setLocalPoll({
        ...localPoll,
        options: updatedOptions,
        total_votes: localPoll.total_votes + totalVotesChange,
        userVotes: selectedOptions
      })

      if (onVoteUpdate) {
        onVoteUpdate()
      }
    }
  }

  const formatExpiration = (expiresAt: string) => {
    const expDate = new Date(expiresAt)
    const now = new Date()
    const diffMs = expDate.getTime() - now.getTime()
    
    if (diffMs <= 0) return "Expired"
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) return `Expires in ${diffDays}d ${diffHours}h`
    if (diffHours > 0) return `Expires in ${diffHours}h`
    return "Expires soon"
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-800 mb-1">{localPoll.question}</h4>
          {localPoll.description && (
            <p className="text-sm text-gray-600 mb-2">{localPoll.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {localPoll.options
          .sort((a, b) => a.display_order - b.display_order)
          .map((option) => {
            const isSelected = selectedOptions.includes(option.id)
            const percentage = localPoll.total_votes > 0 
              ? Math.round((option.vote_count / localPoll.total_votes) * 100) 
              : 0

            return (
              <div
                key={option.id}
                className={`
                  flex items-center gap-3 p-3 rounded-md transition-all duration-200
                  ${isSelected ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200"}
                  ${!isExpired ? "hover:bg-blue-50 cursor-pointer" : "cursor-not-allowed opacity-75"}
                  border
                `}
                onClick={() => !isExpired && handleOptionToggle(option.id)}
              >
                <div className="flex-shrink-0">
                  {poll.is_multiple_choice ? (
                    isSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )
                  ) : isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                      <span className="mr-2">{option.emoji}</span>
                      {option.text}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {percentage}% ({option.vote_count})
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${isSelected ? "opacity-100" : "opacity-75"}`}
                  />
                </div>
              </div>
            )
          })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {localPoll.total_votes} vote{localPoll.total_votes !== 1 ? 's' : ''}
          </span>
          
          {poll.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatExpiration(poll.expires_at)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {poll.is_anonymous && (
            <span className="text-green-600">Anonymous</span>
          )}
          <span>
            {poll.is_multiple_choice ? "Multiple choice" : "Single choice"}
          </span>
        </div>
      </div>

      {hasChanged && !isExpired && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <Button
            onClick={handleSubmitVote}
            disabled={isVoting}
            size="sm"
            className="w-full"
          >
            {isVoting ? "Submitting..." : "Submit Vote"}
          </Button>
        </div>
      )}

      {isExpired && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-center text-sm text-gray-600">
          This poll has expired
        </div>
      )}
    </div>
  )
}
