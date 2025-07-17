import { createBrowserClient } from "@/lib/supabase/client"
import type { PointsCategory, UserPointsByCategory } from "@/types/supabase"

// Service for managing points categories and category-based points

/**
 * Get all available points categories
 */
export async function getPointsCategories(): Promise<PointsCategory[]> {
  const supabase = createBrowserClient()
  try {
    const { data, error } = await supabase
      .from("points_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_name")

    if (error) {
      console.error("Error fetching points categories:", error)
      return []
    }
    return Array.isArray(data)
      ? data.map((d) => ({
          id: String(d.id),
          name: String(d.name),
          display_name: String(d.display_name),
          is_active: Boolean(d.is_active),
          icon: d.icon ? String(d.icon) : '',
          color: d.color ? String(d.color) : '',
          created_at: d.created_at ? String(d.created_at) : '',
          updated_at: d.updated_at ? String(d.updated_at) : '',
        }))
      : []
  } catch (error) {
    console.error("Error in getPointsCategories:", error)
    return []
  }
}

/**
 * Get points category by name
 */
export async function getPointsCategoryByName(name: string): Promise<PointsCategory | null> {
  const supabase = createBrowserClient()
  try {
    const { data, error } = await supabase
      .from("points_categories")
      .select("*")
      .eq("name", name)
      .eq("is_active", true)
      .single()
    if (error) {
      console.error(`Error fetching category ${name}:`, error)
      return null
    }
    if (!data) return null
    return {
      id: String(data.id),
      name: String(data.name),
      display_name: String(data.display_name),
      is_active: Boolean(data.is_active),
      icon: data.icon ? String(data.icon) : '',
      color: data.color ? String(data.color) : '',
      created_at: data.created_at ? String(data.created_at) : '',
      updated_at: data.updated_at ? String(data.updated_at) : '',
    }
  } catch (error) {
    console.error(`Error in getPointsCategoryByName for ${name}:`, error)
    return null
  }
}

/**
 * Get user points breakdown by category
 */
export async function getUserPointsByCategory(userId?: string): Promise<UserPointsByCategory[]> {
  const supabase = createBrowserClient()
  try {
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return [];
      userId = user.id
    }
    const { data, error } = await supabase
      .from("user_points_by_category")
      .select("*")
      .eq("user_id", userId)
      .order("net_points", { ascending: false })
    if (error) {
      console.error("Error fetching user points by category:", error)
      return []
    }
    return (Array.isArray(data) ? data.map((d) => ({
      user_id: String(d.user_id),
      category_id: String(d.category_id),
      category_name: String(d.category_name),
      category_display_name: String(d.category_display_name),
      category_icon: String(d.category_icon ?? ''),
      category_color: String(d.category_color ?? ''),
      total_earned: Number(d.total_earned ?? 0),
      total_spent: Number(d.total_spent ?? 0),
      net_points: Number(d.net_points ?? 0),
      transaction_count: Number(d.transaction_count ?? 0),
      last_transaction_date: d.last_transaction_date ? String(d.last_transaction_date) : undefined,
    })) : []).filter(
      (category) => category.net_points > 0 || category.transaction_count > 0
    )
  } catch (error) {
    console.error("Error in getUserPointsByCategory:", error)
    return []
  }
}

/**
 * Get all categories with user points (including categories with 0 points)
 */
export async function getAllCategoriesWithUserPoints(userId?: string): Promise<UserPointsByCategory[]> {
  const supabase = createBrowserClient()
  try {
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }
    const { data: categories, error: catError } = await supabase
      .from("points_categories")
      .select("*")
      .eq("is_active", true)
    if (catError || !categories) {
      console.error("Error fetching points categories:", catError)
      return []
    }
    const { data: userPoints, error: upError } = await supabase
      .from("user_points_by_category")
      .select("*")
      .eq("user_id", userId)
    if (upError) {
      console.error("Error fetching user points by category:", upError)
      return categories.map((category) => ({
        user_id: String(userId),
        category_id: String(category.id),
        category_name: String(category.name),
        category_display_name: String(category.display_name),
        category_icon: String(category.icon ?? ''),
        category_color: String(category.color ?? ''),
        total_earned: 0,
        total_spent: 0,
        net_points: 0,
        transaction_count: 0,
        last_transaction_date: undefined,
      }))
    }
    const pointsMap = new Map(
      (Array.isArray(userPoints) ? userPoints.map((upc) => [String(upc.category_id), {
        user_id: String(upc.user_id),
        category_id: String(upc.category_id),
        category_name: String(upc.category_name),
        category_display_name: String(upc.category_display_name),
        category_icon: String(upc.category_icon ?? ''),
        category_color: String(upc.category_color ?? ''),
        total_earned: Number(upc.total_earned ?? 0),
        total_spent: Number(upc.total_spent ?? 0),
        net_points: Number(upc.net_points ?? 0),
        transaction_count: Number(upc.transaction_count ?? 0),
        last_transaction_date: upc.last_transaction_date ? String(upc.last_transaction_date) : undefined,
      }]) : [])
    )
    return categories.map((category) => {
      const upc = pointsMap.get(String(category.id))
      return upc
        ? upc
        : {
            user_id: String(userId),
            category_id: String(category.id),
            category_name: String(category.name),
            category_display_name: String(category.display_name),
            category_icon: String(category.icon ?? ''),
            category_color: String(category.color ?? ''),
            total_earned: 0,
            total_spent: 0,
            net_points: 0,
            transaction_count: 0,
            last_transaction_date: undefined,
          }
    })
  } catch (error) {
    console.error("Error in getAllCategoriesWithUserPoints:", error)
    return []
  }
}

/**
 * Award points to a user in a specific category
 */
export async function awardCategoryPoints(
  userId: string,
  categoryName: string,
  amount: number,
  reason?: string,
  metadata?: any
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const supabase = createBrowserClient()
  try {
    const { data, error } = await supabase.rpc("award_points_with_category", {
      p_user_id: userId,
      p_amount: amount,
      p_category_name: categoryName,
      p_reason: reason || `Points earned from ${categoryName}`,
      p_metadata: metadata || {},
    })
    if (error) {
      console.error("Error awarding category points:", error)
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: true,
      transactionId: data ? String(data) : undefined,
    }
  } catch (error: any) {
    console.error("Error in awardCategoryPoints:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
    }
  }
}

/**
 * Spend points from a user in a specific category
 */
export async function spendCategoryPoints(
  userId: string,
  categoryName: string,
  amount: number,
  reason?: string,
  metadata?: any
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const supabase = createBrowserClient()
  try {
    const { data, error } = await supabase.rpc("spend_points_with_category", {
      p_user_id: userId,
      p_amount: amount,
      p_category_name: categoryName,
      p_reason: reason || `Points spent on ${categoryName}`,
      p_metadata: metadata || {},
    })
    if (error) {
      console.error("Error spending category points:", error)
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: true,
      transactionId: data ? String(data) : undefined,
    }
  } catch (error: any) {
    console.error("Error in spendCategoryPoints:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
    }
  }
}

/**
 * Get points statistics for a category
 */
export async function getCategoryPointsStats(categoryName: string): Promise<{
  totalUsers: number
  totalPointsEarned: number
  totalPointsSpent: number
  averagePointsPerUser: number
}> {
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase.rpc("get_category_points_stats", {
      p_category_name: categoryName,
    })

    if (error) {
      console.error(`Error fetching stats for category ${categoryName}:`, error)
      return {
        totalUsers: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        averagePointsPerUser: 0,
      }
    }

    function isCategoryPointsStats(obj: any): obj is { totalUsers: number; totalPointsEarned: number; totalPointsSpent: number; averagePointsPerUser: number } {
      return obj
        && typeof obj === 'object'
        && typeof obj.totalUsers === 'number'
        && typeof obj.totalPointsEarned === 'number'
        && typeof obj.totalPointsSpent === 'number'
        && typeof obj.averagePointsPerUser === 'number';
    }

    return isCategoryPointsStats(data)
      ? data
      : {
          totalUsers: 0,
          totalPointsEarned: 0,
          totalPointsSpent: 0,
          averagePointsPerUser: 0,
        }
  } catch (error) {
    console.error(`Error in getCategoryPointsStats for ${categoryName}:`, error)
    return {
      totalUsers: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      averagePointsPerUser: 0,
    }
  }
}

/**
 * Update points category (admin only)
 */
export async function updatePointsCategory(
  categoryId: string,
  updates: Partial<PointsCategory>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient()

  try {
    const { error } = await supabase
      .from("points_categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)

    if (error) {
      console.error("Error updating points category:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in updatePointsCategory:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
    }
  }
}

/**
 * Create a new points category (admin only)
 */
export async function createPointsCategory(
  category: Omit<PointsCategory, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; category?: PointsCategory; error?: string }> {
  const supabase = createBrowserClient()

  try {
    const { data, error } = await supabase
      .from("points_categories")
      .insert(category)
      .select()
      .single()

    if (error) {
      console.error("Error creating points category:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      category: data
        ? {
            id: String(data.id),
            name: String(data.name),
            display_name: String(data.display_name),
            is_active: Boolean(data.is_active),
            icon: data.icon ? String(data.icon) : '',
            color: data.color ? String(data.color) : '',
            created_at: data.created_at ? String(data.created_at) : '',
            updated_at: data.updated_at ? String(data.updated_at) : '',
          }
        : undefined,
    }
  } catch (error: any) {
    console.error("Error in createPointsCategory:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
    }
  }
}

/**
 * List all available categories (for debugging)
 */
export async function listAllCategories(): Promise<void> {
  const supabase = createBrowserClient()
  try {
    const { data, error } = await supabase
      .from("points_categories")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching all categories:", error)
      return
    }

    // console.log("📋 Available categories:")
    data?.forEach(cat => {
      // console.log(`  - ${cat.name} (${cat.id}) - ${cat.display_name} [${cat.is_active ? 'active' : 'inactive'}]`)
    })
  } catch (error) {
    console.error("Error in listAllCategories:", error)
  }
}