const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!user?.id) return

  setIsSubmitting(true)
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    toast({
      title: "Contact Information Updated",
      description: "Your contact information has been saved successfully.",
    })
  } catch (error) {
    toast({
      title: "Update Failed",
      description: "An error occurred while updating your contact information.",
      variant: "destructive",
    })
  } finally {
    setIsSubmitting(false)
  }
} 