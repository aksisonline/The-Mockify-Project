import React, { useState } from "react"
import { useSupabase } from "@supabase/auth-helpers-react"
import { toast } from "sonner"

const FeedbackPopup: React.FC = () => {
  const supabase = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: user.id,
          rating: formData.rating,
          comment: formData.comment,
          created_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting your feedback.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Render your form here */}
    </div>
  )
}

export default FeedbackPopup 