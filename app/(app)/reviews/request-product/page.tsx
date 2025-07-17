"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AppHeader from "@/components/ui/AppHeader"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"

export default function RequestProductPage() {
  const [formData, setFormData] = useState({
    productName: "",
    brandName: "",
    category: "",
    description: "",
    reason: "",
    additionalInfo: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user } = useAuth()

  const categories = [
    "Media Bars",
    "Cameras",
    "Microphones", 
    "Speakers",
    "Displays",
    "Headsets",
    "Controllers",
    "Accessories",
    "Other"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please log in to submit a request")
      return
    }

    if (!formData.productName || !formData.brandName || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Product Request: ${formData.productName} by ${formData.brandName}
          
Category: ${formData.category || 'Not specified'}
Description: ${formData.description || 'Not provided'}
Reason for Request: ${formData.reason}
Additional Information: ${formData.additionalInfo || 'None'}`
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Request submitted successfully!")
      } else {
        toast.error("Failed to submit request")
      }
    } catch (error) {
      toast.error("Error submitting request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AppHeader title="Request Submitted" subtitle="Thank you for your request" />
        <div className="flex min-h-screen">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-2xl mx-auto">
                <Card className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                      Request Submitted Successfully!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      Thank you for requesting <strong>{formData.productName}</strong> by <strong>{formData.brandName}</strong>. 
                      Our team will review your request and add the product to our reviews system if approved.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You'll receive a notification once your request has been processed.
                    </p>
                    <div className="flex gap-4 justify-center pt-4">
                      <Link href="/reviews">
                        <Button>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Reviews
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormData({
                            productName: "",
                            brandName: "",
                            category: "",
                            description: "",
                            reason: "",
                            additionalInfo: ""
                          })
                        }}
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <AppHeader title="Request New Product" subtitle="Help us expand our reviews database" />
      <div className="flex min-h-screen">
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Link href="/reviews">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reviews
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Request a New Product</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">
                        Can't find a product you want to review? Let us know and we'll add it to our database.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="productName">Product Name *</Label>
                            <Input
                              id="productName"
                              value={formData.productName}
                              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                              placeholder="e.g., Jabra Speak 510"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="brandName">Brand Name *</Label>
                            <Input
                              id="brandName"
                              value={formData.brandName}
                              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                              placeholder="e.g., Jabra"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="description">Product Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the product..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="reason">Why do you want this product reviewed? *</Label>
                          <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Tell us why this product should be added to our reviews system..."
                            rows={4}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="additionalInfo">Additional Information</Label>
                          <Textarea
                            id="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                            placeholder="Any additional details, specifications, or context..."
                            rows={3}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Request
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How it Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Submit Request</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Fill out the form with product details and your reason for requesting it.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Review Process</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Our team reviews your request and adds the product if approved.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Start Reviewing</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Once added, you and other users can write reviews for the product.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Request Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Provide accurate product and brand names
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Explain why the product would be valuable to review
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Include relevant specifications if available
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          One request per product to avoid duplicates
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 6).map((category) => (
                          <Badge key={category} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
