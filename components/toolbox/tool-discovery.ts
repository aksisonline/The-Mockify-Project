import dynamic from "next/dynamic"
import React from "react"
import toolsData from "@/data/tools.json"

interface ToolInfo {
  id: string
  name: string
  description?: string
}

// Get tools from JSON file
const AVAILABLE_TOOLS: ToolInfo[] = toolsData.tools.map((tool) => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
}))

/**
 * Gets all available tools from the JSON file
 * @returns Array of tool information
 */
export function discoverTools(): ToolInfo[] {
  return AVAILABLE_TOOLS
}

/**
 * Creates a dynamic import for a tool component
 * @param toolId The tool's directory name
 * @returns Dynamic import configuration
 */
export function createToolComponent(toolId: string) {
  // Check if the tool exists in the available tools
  const toolExists = AVAILABLE_TOOLS.some((tool) => tool.id === toolId)

  if (!toolExists) {
    console.warn(`Tool with ID "${toolId}" not found in tools.json`)
  }

  return dynamic(
    () => {
      // First try to import from the directory with index.tsx
      return import(`@/components/toolbox/${toolId}/index`).catch((err) => {
        console.error(`Failed to import from ${toolId}/index:`, err)
        // If that fails, try to import directly from the file
        return import(`@/components/toolbox/${toolId}`).catch((err2) => {
          console.error(`Failed to import from ${toolId}:`, err2)
          // Return a fallback component if both imports fail
          return Promise.resolve(() =>
            React.createElement(
              "div",
              { className: "p-8 text-center bg-red-50 rounded-lg border border-red-200" },
              React.createElement(
                "h3",
                { className: "text-lg font-semibold text-red-600 mb-2" },
                "Tool Not Found"
              ),
              React.createElement(
                "p",
                { className: "text-red-500" },
                `The tool "${toolId}" could not be loaded. Please check that it exists in the toolbox directory.`
              )
            )
          )
        })
      })
    },
    {
      ssr: false,
      loading: () =>
        React.createElement(
          "div",
          { className: "p-8 text-center" },
          "Loading " +
            toolId
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") +
            "...",
        ),
    },
  )
}
