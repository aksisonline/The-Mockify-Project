"use client"

import { useEffect, useState } from "react"
import { BadgeInfo } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { getActiveAdvertisements } from "@/lib/advertisements-service"
import { getPublicUrl } from "@/lib/file-service"
import type { Advertisement } from "@/types/supabase"
import { useAuth } from "@/contexts/auth-context"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"

export default function SponsoredContent() {
  const { isLoading: authLoading } = useAuth()
  const { data: ads, isLoading, error } = useSWR(
    authLoading ? null : "/api/ads",
    fetcher,
    { revalidateOnFocus: true, revalidateIfStale: true }
  )
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    if (!ads || !ads.length) return
    setCurrentAdIndex(0)
    setCurrentAd(ads[0])
  }, [ads])

  useEffect(() => {
    if (!ads || !ads.length) return
    if (ads.length === 1) {
      setCurrentAdIndex(0)
      setCurrentAd(ads[0])
      return
    }
    setCurrentAd(ads[currentAdIndex])
    const interval = setInterval(() => {
      setCurrentAdIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % ads.length
        setCurrentAd(ads[nextIndex])
        return nextIndex
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [ads, currentAdIndex])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base text-muted-foreground flex items-center">
          <BadgeInfo className="h-4 w-4 mr-2" /> Sponsored Content
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-muted-foreground">
            <span className="mr-1 text-[10px]">ADVERTISEMENT</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
          <div className="flex flex-col items-center justify-center z-10 text-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            ) : currentAd ? (
              <>
                {currentAd.link ? (
                  <a href={currentAd.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={currentAd.image_url}
                      alt={currentAd.title}
                      width={300}
                      height={200}
                      className="rounded shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ objectFit: "cover", maxHeight: 200 }}
                    />
                  </a>
                ) : (
                  <img
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    width={300}
                    height={200}
                    className="rounded shadow-sm"
                    style={{ objectFit: "cover", maxHeight: 200 }}
                  />
                )}
              </>
            ) : (
              <>
                <img
                  src="/placeholder-ad.png"
                  alt="No Advertisement"
                  width={300}
                  height={200}
                  className="rounded shadow-sm"
                />
                <h3 className="text-xl font-semibold mb-2">No Sponsored Ads</h3>
                <p className="text-muted-foreground mb-4 text-base">Check back later for new opportunities.</p>
              </>
            )}
          </div>
        </div>
        {/* Google Ads Placeholder */}
        <div className="w-full flex flex-col items-center justify-center py-4 border-t border-muted-foreground/10">
          {/* TODO: Replace with your Google Ads code below */}
          <div className="w-full flex flex-col items-center justify-center min-h-[90px]">
            <span className="text-xs text-muted-foreground">Google Ad Slot</span>
            {/* <ins className="adsbygoogle" ...></ins> */}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground py-3">
        Advertisement ·{" "}
        <a href="#" className="underline hover:text-primary ml-1">
          Report this ad
        </a>
      </CardFooter>
    </Card>
  )
}
