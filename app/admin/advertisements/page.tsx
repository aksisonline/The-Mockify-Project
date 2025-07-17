"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getActiveAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "@/lib/advertisements-service"
import { uploadFile, getPublicUrl } from "@/lib/file-service"
import type { Advertisement } from "@/types/supabase"

// TODO: Restrict this page to admins only (middleware or server-side check)

// Admin-only: Advertisement Management UI for sponsored content ads. CRUD, image upload, toggle active, reorder, preview. Uses Supabase and file-service.

export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [form, setForm] = useState<Partial<Advertisement>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAds()
  }, [])

  async function fetchAds() {
    setLoading(true)
    const data = await getActiveAdvertisements()
    setAds(data)
    setLoading(false)
  }

  function openCreate() {
    setEditingAd(null)
    setForm({ is_active: true, display_order: ads.length + 1 })
    setImageFile(null)
    setShowDialog(true)
  }

  function openEdit(ad: Advertisement) {
    setEditingAd(ad)
    setForm(ad)
    setImageFile(null)
    setShowDialog(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      let image_url = form.image_url
      if (imageFile) {
        const uploaded = await uploadFile(imageFile)
        image_url = uploaded.url
      }
      const adData = { ...form, image_url }
      if (editingAd) {
        await updateAdvertisement(editingAd.id, adData)
        toast({ title: "Advertisement updated" })
      } else {
        await createAdvertisement(adData)
        toast({ title: "Advertisement created" })
      }
      setShowDialog(false)
      fetchAds()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(ad: Advertisement) {
    if (!window.confirm("Delete this advertisement?")) return
    await deleteAdvertisement(ad.id)
    toast({ title: "Advertisement deleted" })
    fetchAds()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Advertisements</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Advertisement
        </Button>
      </div>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <img
                      src={ad.image_url.startsWith("http") ? ad.image_url : getPublicUrl("advertisements", ad.image_url)}
                      alt={ad.title}
                      width={80}
                      height={60}
                      className="rounded shadow"
                      style={{ objectFit: "cover", maxHeight: 60 }}
                    />
                  </TableCell>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{ad.description}</TableCell>
                  <TableCell>{ad.display_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={async (checked) => {
                        await updateAdvertisement(ad.id, { is_active: checked })
                        fetchAds()
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(ad)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(ad)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Advertisement" : "New Advertisement"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-4"
          >
            <div>
              <Label>Title</Label>
              <Input
                value={form.title || ""}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description || ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={form.link || ""}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              {form.image_url && !imageFile && (
                <img
                  src={form.image_url.startsWith("http") ? form.image_url : getPublicUrl("advertisements", form.image_url)}
                  alt="Preview"
                  width={120}
                  height={80}
                  className="mt-2 rounded shadow"
                  style={{ objectFit: "cover", maxHeight: 80 }}
                />
              )}
              {imageFile && (
                <span className="block mt-2 text-xs text-muted-foreground">{imageFile.name}</span>
              )}
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={form.display_order || 1}
                onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                min={1}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active ?? true}
                onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {editingAd ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 