"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, RefreshCw, Palette, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Color {
  hex: string
  rgb: string
  name: string
}

export function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<Color[]>([])
  const [baseColor, setBaseColor] = useState("#3B82F6")
  const [paletteType, setPaletteType] = useState<"monochromatic" | "analogous" | "complementary" | "triadic" | "random">("monochromatic")
  
  const { toast } = useToast()

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return "0, 0, 0"
    
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `${r}, ${g}, ${b}`
  }

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return [h * 360, s * 100, l * 100]
  }

  const generateColorName = (hex: string): string => {
    const names = [
      "Ocean", "Sky", "Forest", "Sunset", "Rose", "Lavender", "Mint", "Coral",
      "Amber", "Sage", "Plum", "Teal", "Crimson", "Gold", "Silver", "Copper"
    ]
    const [h] = hexToHsl(hex)
    const index = Math.floor((h / 360) * names.length)
    return names[index] || "Mystery"
  }

  const generatePalette = () => {
    const [h, s, l] = hexToHsl(baseColor)
    let colors: Color[] = []

    switch (paletteType) {
      case "monochromatic":
        colors = [
          { hex: hslToHex(h, s, Math.max(10, l - 40)), rgb: "", name: "" },
          { hex: hslToHex(h, s, Math.max(20, l - 20)), rgb: "", name: "" },
          { hex: baseColor, rgb: "", name: "" },
          { hex: hslToHex(h, s, Math.min(80, l + 20)), rgb: "", name: "" },
          { hex: hslToHex(h, s, Math.min(90, l + 40)), rgb: "", name: "" },
        ]
        break
      
      case "analogous":
        colors = [
          { hex: hslToHex((h - 60 + 360) % 360, s, l), rgb: "", name: "" },
          { hex: hslToHex((h - 30 + 360) % 360, s, l), rgb: "", name: "" },
          { hex: baseColor, rgb: "", name: "" },
          { hex: hslToHex((h + 30) % 360, s, l), rgb: "", name: "" },
          { hex: hslToHex((h + 60) % 360, s, l), rgb: "", name: "" },
        ]
        break
      
      case "complementary":
        colors = [
          { hex: hslToHex(h, s, Math.max(20, l - 20)), rgb: "", name: "" },
          { hex: baseColor, rgb: "", name: "" },
          { hex: hslToHex(h, s, Math.min(80, l + 20)), rgb: "", name: "" },
          { hex: hslToHex((h + 180) % 360, s, l), rgb: "", name: "" },
          { hex: hslToHex((h + 180) % 360, s, Math.min(80, l + 20)), rgb: "", name: "" },
        ]
        break
      
      case "triadic":
        colors = [
          { hex: baseColor, rgb: "", name: "" },
          { hex: hslToHex((h + 120) % 360, s, l), rgb: "", name: "" },
          { hex: hslToHex((h + 240) % 360, s, l), rgb: "", name: "" },
          { hex: hslToHex(h, s * 0.7, l * 1.2), rgb: "", name: "" },
          { hex: hslToHex((h + 120) % 360, s * 0.7, l * 1.2), rgb: "", name: "" },
        ]
        break
      
      case "random":
        colors = Array.from({ length: 5 }, () => {
          const randomH = Math.floor(Math.random() * 360)
          const randomS = 50 + Math.floor(Math.random() * 50)
          const randomL = 40 + Math.floor(Math.random() * 40)
          return { hex: hslToHex(randomH, randomS, randomL), rgb: "", name: "" }
        })
        break
    }

    // Add RGB and names
    colors = colors.map(color => ({
      ...color,
      rgb: hexToRgb(color.hex),
      name: generateColorName(color.hex)
    }))

    setPalette(colors)
  }

  const copyColor = async (color: Color) => {
    try {
      await navigator.clipboard.writeText(color.hex)
      toast({
        title: "Copied!",
        description: `${color.hex} copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy color",
        variant: "destructive",
      })
    }
  }

  const exportPalette = () => {
    const data = palette.map(color => ({
      name: color.name,
      hex: color.hex,
      rgb: color.rgb
    }))
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-palette-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Color Palette Generator</h1>
          <p className="text-gray-600">Create beautiful color palettes for your design projects</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Palette</CardTitle>
          <CardDescription>
            Choose a base color and palette type to generate a harmonious color scheme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="baseColor">Base Color</Label>
              <div className="flex gap-2">
                <Input
                  id="baseColor"
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paletteType">Palette Type</Label>
              <select
                id="paletteType"
                value={paletteType}
                onChange={(e) => setPaletteType(e.target.value as typeof paletteType)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="monochromatic">Monochromatic</option>
                <option value="analogous">Analogous</option>
                <option value="complementary">Complementary</option>
                <option value="triadic">Triadic</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>

          <Button onClick={generatePalette} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Palette
          </Button>
        </CardContent>
      </Card>

      {palette.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Color Palette</CardTitle>
              <CardDescription>Click on any color to copy its hex code</CardDescription>
            </div>
            <Button onClick={exportPalette} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => copyColor(color)}
                >
                  <div
                    className="w-full h-32 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <Copy className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3 bg-white border-x border-b rounded-b-lg">
                    <h3 className="font-medium text-sm text-gray-900">{color.name}</h3>
                    <p className="text-xs text-gray-600">{color.hex}</p>
                    <p className="text-xs text-gray-500">rgb({color.rgb})</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
