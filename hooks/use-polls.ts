import { useState, useCallback } from "react"
import { toast } from "sonner"

// Hook for managing poll voting
export function usePollVoting() {
  const [isVoting, setIsVoting] = useState(false)

  const votePoll = useCallback(async (discussionId: string, pollId: string, optionIds: string[]) => {
    setIsVoting(true)
    try {
      const response = await fetch(`/api/discussions/${discussionId}/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to vote on poll")
      }

      toast.success("Vote recorded successfully!")
      return true
    } catch (error: any) {
      console.error("Error voting on poll:", error)
      toast.error(error.message || "Failed to vote on poll")
      return false
    } finally {
      setIsVoting(false)
    }
  }, [])

  return {
    votePoll,
    isVoting,
  }
}

// Hook for managing poll data
export function usePoll(discussionId: string, pollId: string) {
  const [poll, setPoll] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPoll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/discussions/${discussionId}/polls/${pollId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Poll not found")
          return
        }
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch poll")
      }

      const data = await response.json()
      setPoll(data.poll)
    } catch (error: any) {
      console.error("Error fetching poll:", error)
      setError(error.message || "Failed to fetch poll")
    } finally {
      setIsLoading(false)
    }
  }, [discussionId, pollId])

  const updatePoll = useCallback(async (updates: any) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/polls/${pollId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update poll")
      }

      const data = await response.json()
      setPoll(data.poll)
      toast.success("Poll updated successfully!")
      return true
    } catch (error: any) {
      console.error("Error updating poll:", error)
      toast.error(error.message || "Failed to update poll")
      return false
    }
  }, [discussionId, pollId])

  const deletePoll = useCallback(async () => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/polls/${pollId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete poll")
      }

      toast.success("Poll deleted successfully!")
      return true
    } catch (error: any) {
      console.error("Error deleting poll:", error)
      toast.error(error.message || "Failed to delete poll")
      return false
    }
  }, [discussionId, pollId])

  return {
    poll,
    isLoading,
    error,
    fetchPoll,
    updatePoll,
    deletePoll,
    refetch: fetchPoll,
  }
}
