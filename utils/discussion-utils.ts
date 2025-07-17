/**
 * Generates a shareable URL for a discussion or comment
 *
 * @param discussionId The ID of the discussion
 * @param commentId Optional comment ID for deep linking to a specific comment
 * @returns A shareable URL
 */
export function generateShareableUrl(discussionId: string, commentId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")

  if (commentId) {
    return `${baseUrl}/discussions/${discussionId}?comment=${commentId}`
  }

  return `${baseUrl}/discussions/${discussionId}`
}

/**
 * Extracts a comment ID from the URL if present
 *
 * @returns The comment ID if found in the URL, undefined otherwise
 */
export function getCommentIdFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined

  const url = new URL(window.location.href)
  return url.searchParams.get("comment") || undefined
}

/**
 * Scrolls to a specific comment if its ID is in the URL
 *
 * @param commentId The ID of the comment to scroll to
 */
export function scrollToComment(commentId: string): void {
  if (typeof window === "undefined") return

  setTimeout(() => {
    const commentElement = document.getElementById(`comment-${commentId}`)
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth", block: "center" })

      // Highlight the comment temporarily
      commentElement.classList.add("highlight-comment")
      setTimeout(() => {
        commentElement.classList.remove("highlight-comment")
      }, 3000)
    }
  }, 500)
}
