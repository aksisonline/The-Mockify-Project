import { createToolComponent } from "./tool-discovery"
import toolsData from "@/data/tools.json"

// Automatically generate tool components from tools.json
const toolComponents: Record<string, any> = {}
toolsData.tools.forEach((tool) => {
  toolComponents[tool.id] = createToolComponent(tool.id)
})

/**
 * Checks if a tool exists in the registry
 * @param toolId The tool ID to check
 * @returns Boolean indicating if the tool exists
 */
export function toolExists(toolId: string): boolean {
  return !!toolId && Object.keys(toolComponents).includes(toolId)
}

/**
 * Gets a tool component from the registry
 * @param toolId The tool ID to get
 * @returns The tool component or null if not found
 */
export function getToolComponent(toolId: string): any {
  if (!toolId || !toolExists(toolId)) {
    console.warn(`Tool "${toolId}" not found in registry`)
    return null
  }
  return toolComponents[toolId]
}
