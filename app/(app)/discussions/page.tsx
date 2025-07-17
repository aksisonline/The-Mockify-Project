"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreatePostForm } from "@/components/discussions/create-post-form"
import { EnhancedDiscussionList } from "@/components/discussions/enhanced-discussion-list"
import { LeftSidebar } from "@/components/discussions/left-sidebar"
import { RightSidebar } from "@/components/discussions/right-sidebar"
import { SearchFilterBar } from "@/components/discussions/search-filter-bar"
import { useDiscussions, useDiscussionCategories, mapDiscussionsToProps } from "@/hooks/use-discussions"
import ContentWrapper from "@/components/ContentWrapper"
import AppHeader from "@/components/ui/AppHeader"
import { useAuth } from "@/contexts/auth-context"

export default function DiscussionsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "activity">("newest")
  const [selectedActivity, setSelectedActivity] = useState<"my-posts" | "saved" | undefined>(undefined)
  const { user } = useAuth()

  const { discussions, loading, hasMore, loadMore, refetch } = useDiscussions({
    category_id: selectedCategory,
    tag: selectedTag,
    search: searchQuery,
    sort_by: sortBy,
    activity: selectedActivity,
    user_id: user?.id
  })

  const { categories } = useDiscussionCategories()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId)
  }

  const handleActivityChange = (activity: "my-posts" | "saved" | undefined) => {
    setSelectedActivity(activity)
  }

  const handleTagChange = (tag: string | undefined) => {
    setSelectedTag(tag)
  }

  const handleSortChange = (sort: "newest" | "popular" | "activity") => {
    setSortBy(sort)
  }

  const handleRefresh = () => {
    refetch()
  }

  // Map discussions to include pin/lock properties
  const enhancedDiscussions = mapDiscussionsToProps(discussions).map(discussion => ({
    ...discussion,
    is_pinned: discussions.find(d => d.id === discussion.id)?.is_pinned || false,
    is_locked: discussions.find(d => d.id === discussion.id)?.is_locked || false,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <ContentWrapper>
      <AppHeader title="Discussions" subtitle="Share your thoughts, ask questions, and get help from the community" />
      
      {/* Main three-column layout container */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left sidebar - Categories/Navigation (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              selectedActivity={selectedActivity}
              onActivityChange={handleActivityChange}
            />
          </div>

          {/* Main content area */}
          <div className="col-span-1 lg:col-span-9 space-y-4">
            {/* Create post form */}
            <CreatePostForm />

            {/* Search and filter bar */}
            <SearchFilterBar
              searchQuery={searchQuery}
              filter={selectedCategory ?? ""}
              onSearchChange={setSearchQuery}
              onFilterChange={setSelectedCategory}
              onSearch={handleSearch}
              onSortChange={handleSortChange}
              sortBy={sortBy}
            />

            {loading && enhancedDiscussions.length === 0 ? (
              <div className="text-center py-8">Loading discussions...</div>
            ) : enhancedDiscussions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {selectedActivity === "my-posts" 
                    ? "You haven't created any discussions yet" 
                    : selectedActivity === "saved"
                    ? "You haven't saved any discussions yet"
                    : "No discussions found"}
                </p>
              </div>
            ) : (
              <>
                {/* Enhanced Discussion List with Pin/Lock Features */}
                <EnhancedDiscussionList 
                  discussions={enhancedDiscussions}
                  onRefresh={handleRefresh}
                />
                
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </ContentWrapper>
    </div>
  )
}
