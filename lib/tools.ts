import toolsData from '@/data/tools.json'

// Define the tool metadata type
export type ToolMetadata = {
  id: string
  name: string
  description: string
  iconName: string // Name of the Lucide icon to use
  iconColor: string // Color for the icon
  category: string[] // Array of categories the tool belongs to
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
  isPopular?: boolean
  version?: string
  lastUpdated?: string
  author?: string
  documentation?: string
  isPremium?: boolean
  pointsRequired?: number
  progress?: number
}

// Get tools from JSON file
const TOOLS_REGISTRY: ToolMetadata[] = toolsData.tools

/**
 * Get all available tools
 */
export async function getAllTools(): Promise<ToolMetadata[]> {
  return TOOLS_REGISTRY
}

/**
 * Get a specific tool by ID
 */
export async function getToolById(id: string): Promise<ToolMetadata | null> {
  return TOOLS_REGISTRY.find((tool) => tool.id === id) || null
}

/**
 * Get tools by category
 */
export async function getToolsByCategory(category: string): Promise<ToolMetadata[]> {
  return TOOLS_REGISTRY.filter((tool) => tool.category.includes(category))
}

/**
 * Get featured tools
 */
export async function getFeaturedTools(): Promise<ToolMetadata[]> {
  return TOOLS_REGISTRY.filter((tool) => tool.isFeatured)
}

/**
 * Get new tools
 */
export async function getNewTools(): Promise<ToolMetadata[]> {
  return TOOLS_REGISTRY.filter((tool) => tool.isNew)
}

/**
 * Get popular tools
 */
export async function getPopularTools(): Promise<ToolMetadata[]> {
  return TOOLS_REGISTRY.filter((tool) => tool.isPopular)
}

/**
 * Search tools by query
 */
export async function searchTools(query: string): Promise<ToolMetadata[]> {
  const lowerQuery = query.toLowerCase()

  return TOOLS_REGISTRY.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
