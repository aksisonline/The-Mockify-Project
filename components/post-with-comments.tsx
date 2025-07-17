"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Share, ThumbsUp } from "lucide-react"
import NestedComments from "./nested-comments"

// Add the import for useRouter and Link at the top of the file
import { useRouter } from "next/navigation"

// Update the PostWithComments component to include a back button
export default function PostWithComments() {
  const [activeTab, setActiveTab] = useState("comments")
  const router = useRouter()

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Add a back button at the top */}
      <div className="mb-4">
        <Button variant="ghost" className="flex items-center text-blue-600" onClick={() => router.push("/discussions")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Discussions
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback> </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">Mockify Official</div>
              <div className="text-xs text-muted-foreground">Posted 3 hours ago</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <h2 className="text-xl font-bold mb-3">Introducing the New Interactive Design Feature</h2>
          <p className="mb-4">
            We're excited to announce the latest update to our Interactive Design tool. This update includes enhanced
            layout visualization, improved coverage prediction, and a new placement optimizer.
          </p>
          <div className="aspect-ratio bg-gray-100 rounded-md flex items-center justify-center mb-4">
            <span className="text-muted-foreground">Feature Preview Image</span>
          </div>
          <p>
            Let us know what you think about these new features in the comments below. We're particularly interested in
            hearing how the productivity optimizer is working for your projects.
          </p>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" className="gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>42</span>
            </Button>
            <Button variant="ghost" className="gap-1" onClick={() => setActiveTab("comments")}>
              <MessageSquare className="h-4 w-4" />
              <span>24</span>
            </Button>
            <Button variant="ghost" className="gap-1 ml-auto">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="comments" className="flex-1">
            Comments (24)
          </TabsTrigger>
          <TabsTrigger value="related" className="flex-1">
            Related Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          <NestedComments />
        </TabsContent>

        <TabsContent value="related">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold">Getting Started with the VC BAR SIMULATOR</h3>
                <p className="text-sm text-muted-foreground mt-2">A beginner's guide to using our visualization tool</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold">Advanced Camera Placement Techniques</h3>
                <p className="text-sm text-muted-foreground mt-2">Tips from our expert   engineers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
