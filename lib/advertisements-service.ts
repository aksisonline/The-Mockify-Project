import { createBrowserClient } from "./supabase/client"
import type { Advertisement } from "@/types/supabase"

const supabase = createBrowserClient()

export async function getActiveAdvertisements(): Promise<Advertisement[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching advertisements:", error)
    return []
  }
  return data || []
}

export async function createAdvertisement(ad: Partial<Advertisement>) {
  const { data, error } = await supabase
    .from("advertisements")
    .insert([ad])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAdvertisement(id: string, ad: Partial<Advertisement>) {
  const { data, error } = await supabase
    .from("advertisements")
    .update(ad)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAdvertisement(id: string) {
  const { error } = await supabase
    .from("advertisements")
    .delete()
    .eq("id", id)
  if (error) throw error
  return true
} 