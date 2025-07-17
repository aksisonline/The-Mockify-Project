'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/auth-context';
import { DiscussionsListWithModeration } from './discussions-list-with-moderation';
import { CreateDiscussionForm } from './create-post-form';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Example data structure - replace with your actual data fetching
interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  category: {
    id: string;
    name: string;
    color?: string;
  };
  created_at: string;
  updated_at: string;
  view_count: number;
  comment_count: number;
  upvote_count: number;
  downvote_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  tags?: string[];
}

export function DiscussionsPageExample() {
  const { session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Example categories - replace with your actual categories
  const categories = [
    { id: 'all', name: 'All Categories', color: '#6b7280' },
    { id: 'general', name: 'General', color: '#3b82f6' },
    { id: 'technical', name: 'Technical', color: '#10b981' },
    { id: 'events', name: 'Events', color: '#f59e0b' },
    { id: 'announcements', name: 'Announcements', color: '#ef4444' },
  ];

  // Fetch discussions - replace with your actual API call
  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discussions');
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions || []);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  // Filter and sort discussions
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most_comments':
        return b.comment_count - a.comment_count;
      case 'most_views':
        return b.view_count - a.view_count;
      case 'trending':
        return (b.comment_count + b.view_count) - (a.comment_count + a.view_count);
      default:
        return 0;
    }
  });

  const handleRefresh = () => {
    fetchDiscussions();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Discussions</h1>
            <p className="text-muted-foreground mt-1">
              Join the conversation and share your thoughts with the community
            </p>
          </div>
          
          {session?.user && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Discussion
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_comments">Most Comments</SelectItem>
              <SelectItem value="most_views">Most Views</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Create Discussion Form */}
      {showCreateForm && (
        <div className="mb-8">
          <CreateDiscussionForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchDiscussions();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Discussions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading discussions...</p>
        </div>
      ) : (
        <DiscussionsListWithModeration
          discussions={sortedDiscussions}
          onRefresh={handleRefresh}
        />
      )}

      {/* Empty State */}
      {!isLoading && sortedDiscussions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No discussions found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to start a discussion!'
            }
          </p>
          {session?.user && !searchQuery && selectedCategory === 'all' && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Discussion
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 