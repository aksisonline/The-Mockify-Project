"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ContentWrapper from "@/components/ContentWrapper"
import { uploadFile, getPublicUrl } from "@/lib/file-service"
import { toast } from "sonner"

const categories = [
  "Conference",
  "Workshop",
  "Masterclass",
  "Bootcamp",
  "Certification",
  "Festival",
  "Seminar",
]

export default function PostEventPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    start_date: "",
    end_date: "",
    location: "",
    category: categories[0],
    registration_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const uniqueName = `${Date.now()}.${ext}`
      const uploaded = await uploadFile(new File([file], uniqueName, { type: file.type }))
      setForm((prev) => ({ ...prev, image_url: uploaded.url }))
      toast.success("Image uploaded successfully!")
    } catch (err) {
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm({ ...form, [name]: value })
    if (name === "image_url") {
      setImagePreview(value)
      setImageFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Basic validation
    if (!form.title || !form.description || !form.content || !form.start_date || !form.end_date || !form.location || !form.category) {
      toast.error("Please fill in all required fields.")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/events/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to submit event request.")
        setLoading(false)
        return
      }
      toast.success("Your event request has been submitted! Our team will review it soon.")
      setForm({
        title: "",
        description: "",
        content: "",
        image_url: "",
        start_date: "",
        end_date: "",
        location: "",
        category: categories[0],
        registration_url: "",
      })
      setImageFile(null)
      setImagePreview("")
      // Redirect to /events after success
      router.push('/events')
    } catch (err) {
      console.error("Event request error:", err)
      toast.error("Failed to submit event request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-8">
      <ContentWrapper>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Submit an Event Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="title" placeholder="Event Title" value={form.title} onChange={handleChange} required />
                <Textarea name="description" placeholder="Short Description" value={form.description} onChange={handleChange} required />
                <Textarea name="content" placeholder="Full Event Details" value={form.content} onChange={handleChange} required />
                <div className="w-full flex flex-col gap-2">
                  <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Image Preview" className="h-16 w-16 object-contain rounded border mt-2" />
                  )}
                  <Input
                    type="url"
                    name="image_url"
                    placeholder="Image URL (optional)"
                    value={form.image_url}
                    onChange={handleChange}
                  />
                </div>
                <Input name="start_date" type="date" placeholder="Start Date" value={form.start_date} onChange={handleChange} required />
                <Input name="end_date" type="date" placeholder="End Date" value={form.end_date} onChange={handleChange} required />
                <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
                <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded-lg p-2" required>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Input name="registration_url" placeholder="Registration URL (optional)" value={form.registration_url} onChange={handleChange} />
                <Button type="submit" className="w-full" disabled={loading || uploading}>{loading ? "Submitting..." : uploading ? "Uploading Image..." : "Submit Event Request"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ContentWrapper>
    </div>
  )
} 