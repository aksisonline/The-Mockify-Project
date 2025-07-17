import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css"
import { Analytics } from "@vercel/analytics/next"
import { PreRenderProvider } from "@/components/providers/pre-render-provider"
import { AuthErrorBoundary } from '@/components/auth-error-boundary'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mockify - Connect, Collaborate, and Elevate in the   World",
  description:
    "A vibrant platform uniting productivity professionals, enthusiasts, and learners for networking, knowledge-sharing, job exploration, and tool trading.",
  keywords: "platform, professionals, productivity tools, productivity community, productivity jobs, productivity training",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_DOMAIN,
    title: "Mockify - Connect, Collaborate, and Elevate in the Productivity World",
    description: "A vibrant platform uniting productivity professionals, enthusiasts, and learners.",
    siteName: "Mockify",
  },
  generator: "v0.dev",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="x-pre-render-routes" content="" />
        <meta name="x-pre-fetch-data" content="" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <AuthErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
            >
              <PreRenderProvider>
                {children}
              </PreRenderProvider>
              <Toaster />
            </ThemeProvider>
          </AuthErrorBoundary>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
