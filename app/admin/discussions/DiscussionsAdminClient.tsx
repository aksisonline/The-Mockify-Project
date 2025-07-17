"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Edit, Trash2, MessageSquare, Users, Eye, EyeOff, Flag, Lock, Pin, BarChart } from "lucide-react"

interface Discussion {
  id: string
  title: string
  content: string
  author_id: string
  category_id?: string
  is_pinned: boolean
  is_locked: boolean
  is_archived: boolean
  is_flagged: boolean
  view_count: number
  comment_count: number
  vote_score: number
  created_at: string
  updated_at: string
  author?: {
    full_name: string
    email: string
  }
  category?: {
    name: string
    color: string
  }
  poll?: {
    id: string
    question: string
    is_multiple_choice: boolean
    is_anonymous: boolean
    total_votes: number
    created_at: string
    options: Array<{
      id: string
      option_text: string
      text: string
      emoji: string
      vote_count: number
      display_order: number
    }>
  } | null
}

interface DiscussionComment {
  id: string
  discussion_id: string
  author_id: string
  content: string
  is_flagged: boolean
  created_at: string
  author?: {
    full_name: string
    email: string
  }
  discussion?: {
    title: string
  }
}

export default function DiscussionsAdminClient() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [comments, setComments] = useState<DiscussionComment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDiscussions: 0,
    flaggedDiscussions: 0,
    totalComments: 0,
    flaggedComments: 0,
    totalViews: 0,
    totalPolls: 0,
    totalPollVotes: 0
  })

  // Form states
  const [showAddDiscussion, setShowAddDiscussion] = useState(false)
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    is_pinned: false,
    is_locked: false,
    is_archived: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch discussions
      const discussionsResponse = await fetch('/api/discussions')
      const discussionsData = await discussionsResponse.json()
      
      // console.log('Discussions response:', discussionsResponse.status, discussionsData)
      
      // Fetch comments
      const commentsResponse = await fetch('/api/discussions/comments')
      const commentsData = await commentsResponse.json()
      
      // console.log('Comments response:', commentsResponse.status, commentsData)
      
      if (discussionsResponse.ok) {
        const discussions = discussionsData.discussions || discussionsData || []
        // console.log('Setting discussions:', discussions)
        setDiscussions(discussions)
      } else {
        console.error('Discussions API error:', discussionsData.error)
        toast.error('Failed to fetch discussions')
      }
      
      if (commentsResponse.ok) {
        const comments = commentsData.comments || commentsData || []
        // console.log('Setting comments:', comments)
        setComments(comments)
      } else {
        console.error('Comments API error:', commentsData.error)
        toast.error('Failed to fetch comments')
      }
      
      // Calculate stats
      const discussions = discussionsData.discussions || discussionsData || []
      const comments = commentsData.comments || commentsData || []
      const flaggedDiscussions = discussions.filter((d: Discussion) => d.is_flagged).length || 0
      const flaggedComments = comments.filter((c: DiscussionComment) => c.is_flagged).length || 0
      const totalViews = discussions.reduce((sum: number, d: Discussion) => sum + (d.view_count || 0), 0) || 0
      const totalPolls = discussions.filter((d: Discussion) => d.poll).length || 0
      const totalPollVotes = discussions.reduce((sum: number, d: Discussion) => sum + (d.poll?.total_votes || 0), 0) || 0
      
      setStats({
        totalDiscussions: discussions.length || 0,
        flaggedDiscussions,
        totalComments: comments.length || 0,
        flaggedComments,
        totalViews,
        totalPolls,
        totalPollVotes
      })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch discussions data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingDiscussion 
        ? `/api/discussions/${editingDiscussion.id}`
        : '/api/discussions'
      
      const method = editingDiscussion ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(editingDiscussion ? 'Discussion updated successfully' : 'Discussion created successfully')
        setShowAddDiscussion(false)
        setEditingDiscussion(null)
        resetForm()
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to save discussion')
      }
    } catch (error) {
      console.error('Error saving discussion:', error)
      toast.error('Failed to save discussion')
    }
  }

  const handleDelete = async (discussionId: string) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Discussion deleted successfully')
        fetchData()
      } else {
        throw new Error('Failed to delete discussion')
      }
    } catch (error) {
      console.error('Error deleting discussion:', error)
      toast.error('Failed to delete discussion')
    }
  }

  const handleModeration = async (discussionId: string, action: string, value: boolean) => {
    try {
      let response;
      
      // Use specific endpoints for pin and lock actions
      if (action === 'is_pinned') {
        response = await fetch(`/api/discussions/${discussionId}/pin`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_pinned: value })
        });
      } else if (action === 'is_locked') {
        response = await fetch(`/api/discussions/${discussionId}/lock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_locked: value })
        });
      } else {
        // For other actions like archive, use the general PUT endpoint
        response = await fetch(`/api/discussions/${discussionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [action]: value })
        });
      }
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Discussion ${action} updated`);
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update discussion ${action}`);
      }
    } catch (error) {
      console.error('Error updating discussion:', error);
      toast.error(error instanceof Error ? error.message : `Failed to update discussion ${action}`);
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category_id: "",
      is_pinned: false,
      is_locked: false,
      is_archived: false
    })
  }

  const editDiscussion = (discussion: Discussion) => {
    setEditingDiscussion(discussion)
    setFormData({
      title: discussion.title,
      content: discussion.content,
      category_id: discussion.category_id || "",
      is_pinned: discussion.is_pinned,
      is_locked: discussion.is_locked,
      is_archived: discussion.is_archived
    })
    setShowAddDiscussion(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDiscussions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedDiscussions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedComments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalPolls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Poll Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPollVotes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="discussions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Discussions</h2>
            <Button onClick={() => setShowAddDiscussion(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Discussion
            </Button>
          </div>

          <div className="grid gap-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{discussion.title}</h3>
                        {discussion.poll && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <BarChart className="h-3 w-3 mr-1" />
                            Poll
                          </Badge>
                        )}
                        {discussion.is_pinned && (
                          <Badge variant="outline">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {discussion.is_locked && (
                          <Badge variant="destructive">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        {discussion.is_flagged && (
                          <Badge variant="destructive">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                        {discussion.is_archived && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {discussion.author?.full_name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {discussion.comment_count} comments
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {discussion.view_count} views
                        </div>
                        {discussion.category && (
                          <Badge variant="outline" style={{ backgroundColor: discussion.category.color + '20', color: discussion.category.color }}>
                            {discussion.category.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{discussion.content}</p>
                      
                      {/* Poll Information */}
                      {discussion.poll && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-purple-900">Poll: {discussion.poll.question}</h4>
                            <Badge variant="outline" className="text-purple-700">
                              {discussion.poll.total_votes} votes
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {discussion.poll.options?.map((option) => (
                              <div key={option.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1">
                                  <span>{option.emoji}</span>
                                  <span>{option.text}</span>
                                </span>
                                <span className="text-purple-600 font-medium">{option.vote_count} votes</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-purple-600">
                            {discussion.poll.is_multiple_choice ? 'Multiple choice' : 'Single choice'} • 
                            {discussion.poll.is_anonymous ? ' Anonymous' : ' Public'} voting
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editDiscussion(discussion)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{discussion.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(discussion.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Moderation Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModeration(discussion.id, 'is_pinned', !discussion.is_pinned)}
                    >
                      {discussion.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModeration(discussion.id, 'is_locked', !discussion.is_locked)}
                    >
                      {discussion.is_locked ? 'Unlock' : 'Lock'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModeration(discussion.id, 'is_archived', !discussion.is_archived)}
                    >
                      {discussion.is_archived ? 'Unarchive' : 'Archive'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Discussion</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{comment.author?.full_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{comment.author?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{comment.discussion?.title || 'Unknown Discussion'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{comment.content}</div>
                      </TableCell>
                      <TableCell>
                        {comment.is_flagged && (
                          <Badge variant="destructive">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Discussion Dialog */}
      <Dialog open={showAddDiscussion} onOpenChange={setShowAddDiscussion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDiscussion ? 'Edit Discussion' : 'Add New Discussion'}
            </DialogTitle>
            <DialogDescription>
              {editingDiscussion ? 'Update the discussion details.' : 'Create a new discussion.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                />
                <Label htmlFor="is_pinned">Pinned</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_locked"
                  checked={formData.is_locked}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_locked: checked })}
                />
                <Label htmlFor="is_locked">Locked</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_archived"
                  checked={formData.is_archived}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_archived: checked })}
                />
                <Label htmlFor="is_archived">Archived</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDiscussion(false)
                setEditingDiscussion(null)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDiscussion ? 'Update Discussion' : 'Create Discussion'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 