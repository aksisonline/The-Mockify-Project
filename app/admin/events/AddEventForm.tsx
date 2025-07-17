"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadFile, getPublicUrl } from "@/lib/file-service";

const categories = [
  "Conference",
  "Workshop",
  "Masterclass",
  "Bootcamp",
  "Certification",
  "Festival",
  "Seminar",
];

export default function AddEventForm({ 
  onEventAdded, 
  initialData, 
  isEditing = false 
}: { 
  onEventAdded?: (formData?: any) => void;
  initialData?: any;
  isEditing?: boolean;
}) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "",
    end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : "",
    location: initialData?.location || "",
    category: initialData?.category || "",
    registration_url: initialData?.registration_url || "",
    is_featured: initialData?.is_featured || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}.${ext}`;
      const uploaded = await uploadFile(new File([file], uniqueName, { type: file.type }));
      setForm((prev) => ({ ...prev, image_url: uploaded.url }));
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      checked = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "image_url") {
      setImagePreview(value);
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && onEventAdded) {
        // For editing, call the callback with form data
        onEventAdded(form);
        return;
      }

      // For adding new events
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add event");
      setForm({
        title: "",
        description: "",
        content: "",
        image_url: "",
        start_date: "",
        end_date: "",
        location: "",
        category: "",
        registration_url: "",
        is_featured: false,
      });
      setImageFile(null);
      setImagePreview("");
      if (onEventAdded) onEventAdded();
      alert("Event added successfully!");
    } catch (err) {
      alert("Failed to add event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-nowrap items-center gap-4">
          <Input name="title" placeholder="Title" className="min-w-[120px] h-10" required value={form.title} onChange={handleInputChange} />
          <Input name="description" placeholder="Description" className="min-w-[180px] h-10" required value={form.description} onChange={handleInputChange} />
          <Input name="content" placeholder="Content" className="min-w-[180px] h-10" required value={form.content} onChange={handleInputChange} />
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
              onChange={handleInputChange}
            />
          </div>
          <Input name="start_date" type="datetime-local" placeholder="Start Date" className="min-w-[180px] h-10" required value={form.start_date} onChange={handleInputChange} />
          <Input name="end_date" type="datetime-local" placeholder="End Date" className="min-w-[180px] h-10" required value={form.end_date} onChange={handleInputChange} />
          <Input name="location" placeholder="Location" className="min-w-[150px] h-10" value={form.location} onChange={handleInputChange} />
          <select
            name="category"
            value={form.category}
            onChange={handleInputChange}
            className="min-w-[120px] h-10 border rounded-lg p-2"
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Input name="registration_url" placeholder="Registration URL" className="min-w-[180px] h-10" value={form.registration_url} onChange={handleInputChange} />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleInputChange} /> Featured
          </label>
          <Button type="submit" className="h-10 px-6 self-center" disabled={submitting}>
            {submitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Event" : "Add Event")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 