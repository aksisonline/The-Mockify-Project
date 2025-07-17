// Enhanced tool usage tracking and caching system

export interface ToolUsage {
  toolId: string
  lastUsed: number // timestamp
  usageCount: number
  firstUsed: number // timestamp
}

export interface ToolUsageCache {
  tools: Record<string, ToolUsage>
  lastUpdated: number
  version: string
}

// User data cache interface
export interface UserDataCache {
  [key: string]: any
  lastUpdated: number
  version: string
}

const CACHE_VERSION = "1.0.0"
const CACHE_KEY = "media-tools-usage-cache"
const USER_DATA_CACHE_KEY = "media-user-data-cache"
const MAX_RECENT_TOOLS = 10
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
const MAX_USER_DATA_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

class ToolUsageTracker {
  private cache: ToolUsageCache

  constructor() {
    this.cache = this.loadCache()
  }

  private loadCache(): ToolUsageCache {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return {
          tools: {},
          lastUpdated: Date.now(),
          version: CACHE_VERSION
        }
      }
      
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ToolUsageCache
        // Check if cache is still valid
        if (parsed.version === CACHE_VERSION && 
            Date.now() - parsed.lastUpdated < MAX_CACHE_AGE) {
          return parsed
        }
      }
    } catch (error) {
      console.warn("Failed to load tool usage cache:", error)
    }

    // Return fresh cache
    return {
      tools: {},
      lastUpdated: Date.now(),
      version: CACHE_VERSION
    }
  }

  private saveCache(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      this.cache.lastUpdated = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.warn("Failed to save tool usage cache:", error)
    }
  }

  /**
   * Record tool usage
   */
  recordUsage(toolId: string): void {
    const now = Date.now()
    
    if (this.cache.tools[toolId]) {
      // Update existing usage
      this.cache.tools[toolId].lastUsed = now
      this.cache.tools[toolId].usageCount += 1
    } else {
      // Create new usage record
      this.cache.tools[toolId] = {
        toolId,
        lastUsed: now,
        usageCount: 1,
        firstUsed: now
      }
    }

    this.saveCache()
  }

  /**
   * Get recently used tools (ordered by last used)
   */
  getRecentTools(limit: number = MAX_RECENT_TOOLS): string[] {
    const tools = Object.values(this.cache.tools)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit)
      .map(tool => tool.toolId)

    return tools
  }

  /**
   * Get most frequently used tools
   */
  getFrequentTools(limit: number = MAX_RECENT_TOOLS): string[] {
    const tools = Object.values(this.cache.tools)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map(tool => tool.toolId)

    return tools
  }

  /**
   * Get tool usage statistics
   */
  getToolUsage(toolId: string): ToolUsage | null {
    return this.cache.tools[toolId] || null
  }

  /**
   * Get all tool usage data
   */
  getAllUsage(): ToolUsage[] {
    return Object.values(this.cache.tools)
  }

  /**
   * Get smart recommendations based on usage patterns
   */
  getRecommendations(excludeToolIds: string[] = [], limit: number = 5): string[] {
    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)
    
    // Get tools used in the last week
    const recentTools = Object.values(this.cache.tools)
      .filter(tool => tool.lastUsed > oneWeekAgo)
      .filter(tool => !excludeToolIds.includes(tool.toolId))

    // Sort by frequency and recency
    const recommendations = recentTools
      .sort((a, b) => {
        // Weight: 70% frequency, 30% recency
        const freqScore = (b.usageCount - a.usageCount) / Math.max(a.usageCount, b.usageCount, 1)
        const recencyScore = (b.lastUsed - a.lastUsed) / (now - oneWeekAgo)
        return (freqScore * 0.7) + (recencyScore * 0.3)
      })
      .slice(0, limit)
      .map(tool => tool.toolId)

    return recommendations
  }

  /**
   * Clear all usage data
   */
  clearCache(): void {
    this.cache = {
      tools: {},
      lastUpdated: Date.now(),
      version: CACHE_VERSION
    }
    this.saveCache()
  }

  /**
   * Remove usage data for a specific tool
   */
  removeToolUsage(toolId: string): void {
    delete this.cache.tools[toolId]
    this.saveCache()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalTools: number
    totalUsage: number
    averageUsage: number
    mostUsedTool: string | null
    cacheAge: number
  } {
    const tools = Object.values(this.cache.tools)
    const totalUsage = tools.reduce((sum, tool) => sum + tool.usageCount, 0)
    const mostUsed = tools.reduce((max, tool) => 
      tool.usageCount > (max?.usageCount || 0) ? tool : max, null as ToolUsage | null
    )

    return {
      totalTools: tools.length,
      totalUsage,
      averageUsage: tools.length > 0 ? totalUsage / tools.length : 0,
      mostUsedTool: mostUsed?.toolId || null,
      cacheAge: Date.now() - this.cache.lastUpdated
    }
  }
}

// User data cache management
class UserDataCacheManager {
  private cache: Record<string, UserDataCache> = {}

  constructor() {
    this.loadUserDataCache()
  }

  private loadUserDataCache(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.cache = {}
        return
      }
      
      const stored = localStorage.getItem(USER_DATA_CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, UserDataCache>
        // Filter out expired cache entries
        const now = Date.now()
        this.cache = Object.entries(parsed).reduce((acc, [key, data]) => {
          if (data.version === CACHE_VERSION && 
              now - data.lastUpdated < MAX_USER_DATA_CACHE_AGE) {
            acc[key] = data
          }
          return acc
        }, {} as Record<string, UserDataCache>)
      }
    } catch (error) {
      console.warn("Failed to load user data cache:", error)
      this.cache = {}
    }
  }

  private saveUserDataCache(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.warn("Failed to save user data cache:", error)
    }
  }

  setCached(key: string, userId: string, data: any): void {
    const cacheKey = `${key}_${userId}`
    this.cache[cacheKey] = {
      data,
      lastUpdated: Date.now(),
      version: CACHE_VERSION
    }
    this.saveUserDataCache()
  }

  getCached(key: string, userId: string): any {
    const cacheKey = `${key}_${userId}`
    const cached = this.cache[cacheKey]
    
    if (!cached) return null
    
    // Check if cache is still valid
    if (cached.version === CACHE_VERSION && 
        Date.now() - cached.lastUpdated < MAX_USER_DATA_CACHE_AGE) {
      return cached.data
    }
    
    // Remove expired cache
    delete this.cache[cacheKey]
    this.saveUserDataCache()
    return null
  }

  clearUserCache(userId?: string): void {
    if (userId) {
      // Clear cache for specific user
      Object.keys(this.cache).forEach(key => {
        if (key.includes(`_${userId}`)) {
          delete this.cache[key]
        }
      })
    } else {
      // Clear all cache
      this.cache = {}
    }
    this.saveUserDataCache()
  }

  getCacheStats(): {
    totalEntries: number
    totalSize: number
    oldestEntry: number
    newestEntry: number
  } {
    const entries = Object.values(this.cache)
    const timestamps = entries.map(entry => entry.lastUpdated)
    
    return {
      totalEntries: entries.length,
      totalSize: JSON.stringify(this.cache).length,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    }
  }
}

// Export singleton instance
export const toolUsageTracker = new ToolUsageTracker()
export const userDataCache = new UserDataCacheManager()

// Legacy compatibility functions for existing code
export const getRecentTools = (): string[] => {
  return toolUsageTracker.getRecentTools()
}

export const recordToolUsage = (toolId: string): void => {
  toolUsageTracker.recordUsage(toolId)
}

// Export the missing caching functions
export const setCached = (key: string, userId: string, data: any): void => {
  userDataCache.setCached(key, userId, data)
}

export const getCached = (key: string, userId: string): any => {
  return userDataCache.getCached(key, userId)
}

export const clearUserCache = (userId?: string): void => {
  userDataCache.clearUserCache(userId)
} 