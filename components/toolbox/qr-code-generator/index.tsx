"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function QrCodeGenerator() {
  const [inputText, setInputText] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [qrType, setQrType] = useState<"text" | "url" | "email" | "phone" | "sms">("text")
  const [size, setSize] = useState(200)
  
  const { toast } = useToast()

  const generateQRCode = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text or data",
        variant: "destructive",
      })
      return
    }

    let data = inputText
    
    // Format data based on type
    switch (qrType) {
      case "email":
        data = `mailto:${inputText}`
        break
      case "phone":
        data = `tel:${inputText}`
        break
      case "sms":
        data = `sms:${inputText}`
        break
      case "url":
        if (!inputText.startsWith("http://") && !inputText.startsWith("https://")) {
          data = `https://${inputText}`
        }
        break
      default:
        data = inputText
    }

    // Using QR Server API for generating QR codes
    const encodedData = encodeURIComponent(data)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`
    setQrCodeUrl(url)
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-code-${Date.now()}.png`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Downloaded!",
        description: "QR code saved to your downloads",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
    }
  }

  const copyQRCodeUrl = async () => {
    if (!qrCodeUrl) return

    try {
      await navigator.clipboard.writeText(qrCodeUrl)
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const getPlaceholder = () => {
    switch (qrType) {
      case "url":
        return "https://example.com or example.com"
      case "email":
        return "user@example.com"
      case "phone":
        return "+1234567890"
      case "sms":
        return "+1234567890"
      default:
        return "Enter your text here..."
    }
  }

  const getInputLabel = () => {
    switch (qrType) {
      case "url":
        return "Website URL"
      case "email":
        return "Email Address"
      case "phone":
        return "Phone Number"
      case "sms":
        return "Phone Number"
      default:
        return "Text"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for URLs, text, contact info, and more</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
            <CardDescription>
              Enter your data and customize your QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="qrType">QR Code Type</Label>
              <select
                id="qrType"
                value={qrType}
                onChange={(e) => setQrType(e.target.value as typeof qrType)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="text">Plain Text</option>
                <option value="url">Website URL</option>
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inputText">{getInputLabel()}</Label>
              {qrType === "text" ? (
                <Textarea
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getPlaceholder()}
                  rows={4}
                />
              ) : (
                <Input
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getPlaceholder()}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size: {size}x{size}px</Label>
              <Input
                id="size"
                type="range"
                min="100"
                max="500"
                step="50"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button onClick={generateQRCode} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your QR Code</CardTitle>
            <CardDescription>
              {qrCodeUrl ? "Right-click to save or use the buttons below" : "Generate a QR code to see it here"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCodeUrl ? (
              <>
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="Generated QR Code"
                    className="border border-gray-200 rounded-lg"
                    style={{ width: size, height: size }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadQRCode} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyQRCodeUrl} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Data Encoded:</h4>
                  <p className="text-sm text-gray-600 break-all">
                    {qrType === "email" && !inputText.startsWith("mailto:") ? `mailto:${inputText}` :
                     qrType === "phone" && !inputText.startsWith("tel:") ? `tel:${inputText}` :
                     qrType === "sms" && !inputText.startsWith("sms:") ? `sms:${inputText}` :
                     qrType === "url" && !inputText.startsWith("http") ? `https://${inputText}` :
                     inputText}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Your QR code will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
