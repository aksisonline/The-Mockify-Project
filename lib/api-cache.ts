import { createBrowserClient } from "./supabase/client"

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class APICache {
  private static instance: APICache
  private cache: Map<string, CacheEntry<any>>
  private supabase = createBrowserClient()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new Map()
  }

  public static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache()
    }
    return APICache.instance
  }

  private generateKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params || {})}`
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt
  }

  async get<T>(endpoint: string, params?: Record<string, any>, ttl: number = this.DEFAULT_TTL): Promise<T | null> {
    const key = this.generateKey(endpoint, params)
    const entry = this.cache.get(key)

    if (entry && !this.isExpired(entry)) {
      return entry.data as T
    }

    return null
  }

  set<T>(endpoint: string, data: T, params?: Record<string, any>, ttl: number = this.DEFAULT_TTL): void {
    const key = this.generateKey(endpoint, params)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    })
  }

  invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params)
    this.cache.delete(key)
  }

  // Common API methods with caching
  async getProfile(userId: string) {
    const cacheKey = `profile:${userId}`
    const cached = await this.get(cacheKey)
    if (cached) return cached

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) throw error
    this.set(cacheKey, data)
    return data
  }

  async getNotificationSettings(userId: string) {
    const cacheKey = `notification_settings:${userId}`
    const cached = await this.get(cacheKey)
    if (cached) return cached

    const { data, error } = await this.supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) throw error
    this.set(cacheKey, data)
    return data
  }

  async getPoints(userId: string) {
    const cacheKey = `points:${userId}`
    const cached = await this.get(cacheKey)
    if (cached) return cached

    const { data, error } = await this.supabase
      .from("points")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) throw error
    this.set(cacheKey, data)
    return data
  }

  // Invalidate all user-related caches
  invalidateUserCache(userId: string) {
    this.invalidate(`profile:${userId}`)
    this.invalidate(`notification_settings:${userId}`)
    this.invalidate(`points:${userId}`)
  }
}

export const apiCache = APICache.getInstance() 