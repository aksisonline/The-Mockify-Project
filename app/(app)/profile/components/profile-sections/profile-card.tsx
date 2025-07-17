"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Briefcase,
  Calendar,
  CheckCircle,
  CreditCard,
  Edit,
  Facebook,
  Mail,
  MapPin,
  Phone,
  Clock,
  Linkedin,
  Twitter,
  User as UserIcon,
  FileText,
  MessageSquare,
  Award,
  Eye,
  EyeOff,
  LinkIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell } from "lucide-react"
import { NotificationSettingsCarousel, type NotificationSettings } from "../notification-settings-carousel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"
import { getNotificationSettings, updateNotificationSettings, getSocialLinks, upsertSocialLink, getProfileCompletion, updateProfileAvatar } from "@/lib/profile-service"
import { toast } from "sonner"
import { useCategoryPoints } from "@/hooks/use-category-points"
import { uploadFile, getPublicUrl } from "@/lib/file-service"
import { useProfile } from "@/hooks/use-profile"
import { usePoints } from "@/hooks/use-points"
import { purchaseTool } from "@/lib/tool-purchases-service"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { PublicProfileToggle } from "./public-profile-toggle"
import { useToolPurchases } from "@/hooks/use-tool-purchases"

// Add interface for Google identity data
interface GoogleIdentityData {
  picture?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Add interface for provider identity data
interface ProviderIdentityData {
  picture?: string;
  avatar_url?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Add this CSS keyframe animation
const animationKeyframes = `
@keyframes shine {
  0% {
    left: -100%;
    opacity: 0;
  }
  50% {
    opacity: 0.15;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-shine {
  animation: shine 2.5s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-rotate-slow {
  animation: rotate 20s linear infinite;
}
`

// Add the style tag to the component
const AnimationStyle = () => (
  <style jsx global>
    {animationKeyframes}
  </style>
)

interface ProfileCardProps {
  formData: any
  onEdit: () => void
  style?: "modern" | "minimal" | "dark" | "colorful"
}

interface CategoryPoints {
  category_name: string;
  category_display_name: string;
  net_points: number;
  total_earned: number;
  total_spent: number;
}

interface PointsDataItem {
  category: string;
  icon: any;
  points: number;
  percentage: number;
  color: string;
  earned: number;
  spent: number;
}

interface Transaction {
  category: string;
  amount: number;
}

export function ProfileCard({ formData, onEdit, style = "modern" }: ProfileCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [activePointCategory, setActivePointCategory] = useState<string | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    receive_newsletters: true,
    get_ekart_notifications: true,
    stay_updated_on_jobs: true,
    receive_daily_event_updates: false,
    get_trending_community_posts: true,
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const { buyTool } = useToolPurchases()

  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [socialLinkDialogOpen, setSocialLinkDialogOpen] = useState(false)
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<string | null>(null)
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    facebook: "",
  })
  const [providerAvatarUrl, setProviderAvatarUrl] = useState<string | null>(null)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useAuth()
  const { pointsByCategory, totalPoints: realTotalPoints, isLoading: pointsLoading } = useCategoryPoints()
  const supabase = createBrowserClient()

  // Profile completion percentage from backend
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [completionLoading, setCompletionLoading] = useState(true)

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(formData.avatar_url || null)

  const { updateProfile, fetchProfile } = useProfile() as unknown as { updateProfile: (data: any) => Promise<any>; fetchProfile: () => Promise<void> };
  const { fetchPoints } = usePoints ? usePoints() : { fetchPoints: () => {} };
  const [businessCardDialogOpen, setBusinessCardDialogOpen] = useState(false);
  const [businessCardLoading, setBusinessCardLoading] = useState(false);

  const hasBusinessCard = formData.has_business_card;
  const canBuyBusinessCard = realTotalPoints >= 50 && !hasBusinessCard;

  const router = useRouter();

  const authName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User Name"

  // Fetch provider avatar URL on component mount
  useEffect(() => {
    async function fetchProviderAvatar() {
      if (!user?.id) return;

      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error || !sessionData?.session?.user) {
          console.error('Error getting session data:', error);
          return;
        }

        const identityData = sessionData.session.user.user_metadata;
        const avatarUrl = identityData?.picture || identityData?.avatar_url;

        if (avatarUrl) {
          setProviderAvatarUrl(avatarUrl);
        }
      } catch (error) {
        console.error('Error fetching provider avatar:', error);
      }
    }

    fetchProviderAvatar();
  }, [user?.id]);

  useEffect(() => {
    async function fetchCompletion() {
      if (!user?.id) return
      setCompletionLoading(true)
      try {
        const completion = await getProfileCompletion(user.id)
        // If all booleans are true, force 100%
        const allTrue = completion.basic_details && 
                       completion.employment && 
                       completion.certifications && 
                       completion.address && 
                       completion.social_links
        setCompletionPercentage(allTrue ? 100 : (typeof completion.completion_percentage === 'number' ? completion.completion_percentage : 0))
      } catch (e) {
        setCompletionPercentage(0)
      }
      setCompletionLoading(false)
    }
    fetchCompletion()
  }, [user?.id])

  useEffect(() => {
    setAvatarUrl(formData.avatar_url || null)
  }, [formData.avatar_url])

  // Load notification settings when user is available
  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/profile/notification-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      setNotificationSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Failed to load notification settings</div>
          <div className="text-xs text-muted-foreground">{error.message || "An error occurred while loading notification settings."}</div>
        </div>
      );
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      const response = await fetch('/api/profile/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }

      const data = await response.json();
      setNotificationSettings(data);
      toast(
        <div>
          <div className="font-semibold text-green-700">Notification settings updated successfully</div>
          <div className="text-xs text-muted-foreground">Your notification settings have been updated successfully.</div>
        </div>
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Failed to save notification settings</div>
          <div className="text-xs text-muted-foreground">{error.message || "An error occurred while saving notification settings."}</div>
        </div>
      );
    }
  };

  // Fetch social links and prefill the socialLinks state
  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!user?.id) return;
      try {
        const links = await getSocialLinks(user.id);
        setSocialLinks({
          linkedin: typeof links.find((l: any) => l.platform === "linkedin")?.url === 'string' ? links.find((l: any) => l.platform === "linkedin")?.url as string : "",
          twitter: typeof links.find((l: any) => l.platform === "twitter")?.url === 'string' ? links.find((l: any) => l.platform === "twitter")?.url as string : "",
          facebook: typeof links.find((l: any) => l.platform === "facebook")?.url === 'string' ? links.find((l: any) => l.platform === "facebook")?.url as string : "",
        });
      } catch (e) {
        setSocialLinks({ linkedin: "", twitter: "", facebook: "" });
      }
    };
    fetchSocialLinks();
  }, [user?.id]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getCardStyles = () => {
    switch (style) {
      case "minimal":
        return {
          card: "bg-white border border-gray-200 shadow-sm rounded-lg",
          name: "text-gray-900",
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          icon: "text-gray-400",
          text: "text-gray-800",
          button: "bg-gray-900 hover:bg-gray-800 text-white",
          outlineButton: "border border-gray-200 text-gray-700 hover:bg-gray-50",
          progressColor: "#4B5563",
          divider: "border-gray-200",
          sectionTitle: "text-gray-500",
          verified: "#10B981",
          highlight: "bg-gray-50",
          accent: "#4B5563",
        }
      case "dark":
        return {
          card: "bg-gray-800 border-gray-700 shadow-xl",
          name: "text-white",
          badge: "bg-purple-900 text-purple-200 border-purple-700",
          icon: "text-blue-400",
          text: "text-gray-200",
          button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
          outlineButton: "border border-gray-700 text-blue-300 hover:bg-gray-800",
          progressColor: "#8B5CF6",
          divider: "border-gray-700",
          sectionTitle: "text-gray-400",
          verified: "#10B981",
          highlight: "bg-gray-700",
          accent: "#8B5CF6",
        }
      case "colorful":
        return {
          card: "bg-white border-none shadow-lg rounded-2xl",
          name: "text-gray-900",
          badge: "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-purple-300",
          icon: "text-purple-500",
          text: "text-gray-800",
          button: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
          outlineButton: "border border-purple-200 text-purple-700 hover:bg-purple-50",
          progressColor: "#EC4899",
          divider: "border-purple-100",
          sectionTitle: "text-purple-500",
          verified: "#10B981",
          highlight: "bg-pink-50",
          accent: "#EC4899",
        }
      case "modern":
      default:
        return {
          card: "bg-white border-blue-100 shadow-md",
          name: "text-gray-900",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          icon: "text-blue-500",
          text: "text-gray-800",
          button: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
          outlineButton: "border border-blue-200 text-blue-700 hover:bg-blue-50",
          progressColor: "#2563EB",
          divider: "border-blue-100",
          sectionTitle: "text-blue-600",
          verified: "#10B981",
          highlight: "bg-blue-50",
          accent: "#2563EB",
        }
    }
  }

  const styles = getCardStyles()
  
  // Sample data for the expanded sections - these could be loaded from formData in the future
  const achievements = formData.achievements || []

  const projects = formData.projects || []

  const recommendations = formData.recommendations || []

  const languages = formData.languages || []
  const certifications = formData.certifications || []

  // Icon mapping for categories
  const categoryIcons = {
    events: Calendar,
    community: MessageSquare,
    ekart: CreditCard,
    reviews: FileText,
    profile: UserIcon,
    training: Award,
    referrals: UserIcon,
    achievements: Award,
  } as const

  // Color mapping for categories
  const categoryColors = {
    events: "blue",
    community: "indigo",
    ekart: "purple",
    reviews: "pink",
    profile: "green",
    training: "orange",
    referrals: "cyan",
    achievements: "yellow",
  } as const

  // Convert real points data to display format
  const pointsData = pointsByCategory.map((category: CategoryPoints) => {
    const iconKey = category.category_name as keyof typeof categoryIcons
    const colorKey = category.category_name as keyof typeof categoryColors
    
    return {
      category: category.category_display_name,
      icon: categoryIcons[iconKey] || Award,
      points: category.net_points,
      percentage: realTotalPoints > 0 ? Math.round((category.net_points / realTotalPoints) * 100) : 0,
      color: categoryColors[colorKey] || "blue",
      earned: category.total_earned || 0,
      spent: category.total_spent || 0,
    }
  })

  // Use real total points or fallback to calculated total
  const totalPoints = realTotalPoints || pointsData.reduce((sum: number, item: PointsDataItem) => sum + item.points, 0)

  // Add loading state for social link save
  const [savingSocialLink, setSavingSocialLink] = useState(false)

  const handleBuyBusinessCard = async () => {
    if (!user?.id) return;
    setBusinessCardLoading(true);
    try {
      const result = await buyTool({
        id: "business_card",
        name: "Business Card",
        description: "Unlock your digital business card.",
        iconName: "CreditCard",
        iconColor: "#2563EB",
        category: "profile",
        tags: ["business", "card", "profile"],
        isPremium: false,
        pointsRequired: 50,
      });
      
      if (result) {
        setBusinessCardDialogOpen(false);
        // Refresh both points and profile data
        fetchPoints && fetchPoints();
        fetchProfile && fetchProfile();
        toast(
          <div>
            <div className="font-semibold text-green-700">Business Card unlocked successfully!</div>
            <div className="text-xs text-muted-foreground">Please refresh the page to see the changes.</div>
          </div>
        );
      }
    } catch (e: any) {
      toast(
        <div>
          <div className="font-semibold text-red-600">Failed to purchase Business Card</div>
          <div className="text-xs text-muted-foreground">{e.message || "An error occurred while purchasing the tool."}</div>
        </div>
      );
    }
    setBusinessCardLoading(false);
  }

  const calculateTotalPoints = (category: string) => {
    const transactions: Transaction[] = [] // Initialize with empty array since transactions is not defined
    return transactions
      .filter((item: Transaction) => item.category === category)
      .reduce((sum: number, item: Transaction) => sum + item.amount, 0)
  }

  const sections = [
    {
      title: "Profile Visibility",
      content: (
        <div className="space-y-4">
          <PublicProfileToggle 
            userId={user?.id || ""} 
            initialValue={formData.is_public || false}
            onToggle={(isPublic) => {
              // Update local state if needed
              if (formData) {
                formData.is_public = isPublic;
              }
            }}
          />
        </div>
      ),
    }
  ]

  const renderSection = (item: { title: string; content: React.ReactNode }, index: number) => {
    return (
      <div key={index} className="border-t border-gray-100 px-4 md:px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.title}</h3>
        {item.content}
      </div>
    )
  }

  const handleSaveSocialLink = async () => {
    if (!activeSocialPlatform || !user?.id) return;
    setSavingSocialLink(true);
    try {
      // Format the URL based on platform
      let formattedUrl = socialLinks[activeSocialPlatform as keyof typeof socialLinks];
      
      // Remove any whitespace
      formattedUrl = formattedUrl.trim();
      
      // Validate URL is not empty
      if (!formattedUrl) {
        toast(
          <div>
            <div className="font-semibold text-red-600">Invalid URL</div>
            <div className="text-xs text-muted-foreground">Please enter a valid social media URL</div>
          </div>
        );
        return;
      }

      // Add https:// if not present
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      // Platform-specific URL validation
      switch (activeSocialPlatform) {
        case 'linkedin':
          if (!formattedUrl.includes('linkedin.com/in/')) {
            toast(
              <div>
                <div className="font-semibold text-red-600">Invalid LinkedIn URL</div>
                <div className="text-xs text-muted-foreground">Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username)</div>
              </div>
            );
            return;
          }
          break;
        case 'twitter':
          if (!formattedUrl.includes('twitter.com/') && !formattedUrl.includes('x.com/')) {
            toast(
              <div>
                <div className="font-semibold text-red-600">Invalid Twitter URL</div>
                <div className="text-xs text-muted-foreground">Please enter a valid Twitter profile URL (e.g., twitter.com/username)</div>
              </div>
            );
            return;
          }
          break;
        case 'facebook':
          if (!formattedUrl.includes('facebook.com/')) {
            toast(
              <div>
                <div className="font-semibold text-red-600">Invalid Facebook URL</div>
                <div className="text-xs text-muted-foreground">Please enter a valid Facebook profile URL (e.g., facebook.com/username)</div>
              </div>
            );
            return;
          }
          break;
      }

      // Use the profile service to upsert the social link
      await upsertSocialLink({
        user_id: user.id,
        platform: activeSocialPlatform,
        url: formattedUrl,
        updated_at: new Date().toISOString()
      });

      // Update local state with the new URL
      setSocialLinks(prev => ({
        ...prev,
        [activeSocialPlatform]: formattedUrl
      }));
      
      // Show success toast and close dialog
      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Social link saved successfully!</div>
        </div>
      );
      setSocialLinkDialogOpen(false);
    } catch (e: any) {
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{e.message || "An unexpected error occurred. Please try again."}</div>
        </div>
      );
    } finally {
      setSavingSocialLink(false);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${styles.card} border-0 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-white`}
    >
      <AnimationStyle />
      <CardContent className="p-0 relative">
        {/* <div className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
          </svg>
        </div> */}

        {/* Main profile section */}
        <div className="relative">
          {/* Background design elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Solid color orbs */}
            {/* <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-blue-100/40 blur-xl"></div>ns */}

            {/* Subtle pattern overlay */}
            {/* <div className="absolute inset-0 opacity-[0.03]">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
              </svg>
            </div> */}

            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-40 h-40 rounded-full border border-blue-100/20"></div>
            <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full border border-purple-100/20"></div>

            {/* Solid color line at the top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30"></div>
          </div>

          {/* Main content with improved layout */}
          <div className="relative p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Left column with avatar and progress - enhanced */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {/* More aesthetic subtle glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full opacity-0 group-hover:opacity-5 blur-sm transition-opacity duration-1000 ease-in-out"></div>

                  {/* Circular progress indicator - improved */}
                  <svg className="w-28 md:w-36 h-28 md:h-36" viewBox="0 0 120 120">
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={styles.accent}
                      strokeWidth="6"
                      strokeDasharray="339.3"
                      strokeDashoffset={339.3 - (339.3 * completionPercentage) / 100}
                      transform="rotate(-90 60 60)"
                      filter="url(#glow)"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Avatar positioned in center of progress circle - enhanced */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="p-1 rounded-full bg-white shadow-inner relative group cursor-pointer" onClick={() => setAvatarDialogOpen(true)}>
                      <Avatar
                        className="h-20 w-20 md:h-28 md:w-28 border-2 border-white shadow-sm transition-all duration-300 group-hover:opacity-75"
                      >
                        <AvatarImage 
                          src={avatarUrl || providerAvatarUrl || "/placeholder.svg?height=112&width=112"} 
                          alt={formData.fullName || authName} 
                        />
                        <AvatarFallback className="text-xl md:text-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                          {(formData.fullName || authName)
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile completion text */}
                <div className="mt-4 text-center">
                  <span className="text-xs font-medium text-gray-500">Profile Completion</span>
                  <div className="text-lg font-bold text-blue-600">{completionLoading ? <span className="animate-pulse">...</span> : `${completionPercentage}%`}</div>
                </div>
              </div>

              {/* Middle column with name and details - enhanced */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={`text-xl md:text-2xl font-bold ${styles.name}`}>
                        {formData.fullName || authName}
                      </h2>
                      <Badge className="bg-green-500 text-white border border-green-400 shadow-sm ml-0 md:ml-2 animate-fadeIn hover:bg-green-500 hover:text-white hover:border-green-400 transition-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-blue-50 transition-colors"
                        onClick={onEdit}
                      >
                        <Edit className="h-3.5 w-3.5 text-blue-500" />
                      </Button>
                    </div>

                    <p className="text-gray-600 mt-2 flex items-center gap-1.5 text-sm md:text-base">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formData.designation || <span className="text-gray-400">Your Role</span>}</span>
                      {formData.companyName && (
                        <>
                          <span className="text-gray-400 mx-1">at</span>
                          <span className="font-medium text-gray-700">{formData.companyName}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formData.city && formData.country ? `${formData.city}, ${formData.country}` : <span className="text-gray-400">Location not specified</span>}
                  </span>
                </div>
                <div className="flex flex-wrap mt-6 gap-4 border-t border-gray-100 pt-4">
                  {/* Phone */}
                  <div className="flex items-center gap-3 min-w-[160px] flex-1">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-gray-500">Phone</div>
                      <div className="text-gray-700 font-medium flex flex-nowrap items-center gap-2">
                        {showPhone ? (
                          <>
                            {(formData.phoneCode && formData.phoneNumber) ? 
                              `${formData.phoneCode} ${formData.phoneNumber}` : 
                              <span className="text-gray-400">Not provided</span>
                            }
                          </>
                        ) : (
                          <span>••••••</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-blue-50"
                          onClick={() => setShowPhone(!showPhone)}
                        >
                          {showPhone ? (
                            <EyeOff className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Eye className="h-3 w-3 text-blue-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 min-w-[160px] flex-1">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500">Email</div>
                      <div className="text-gray-700 font-medium flex flex-nowrap items-center gap-2">
                        <div className="truncate">
                          {showEmail ? formData.email || <span className="text-gray-400">Not provided</span> : "•••••••"}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-blue-50"
                          onClick={() => setShowEmail(!showEmail)}
                        >
                          {showEmail ? (
                            <EyeOff className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Eye className="h-3 w-3 text-blue-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-3 min-w-[160px] flex-1">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-gray-500">Experience</div>
                      <div className="text-gray-700 font-medium flex flex-nowrap items-center gap-2">
                        {formData.work_status === "fresher"
                          ? "Fresher"
                          : (formData.totalExperienceYears || formData.totalExperienceMonths
                              ? `${formData.totalExperienceYears || "0"} Years ${formData.totalExperienceMonths || "0"} Months`
                              : <span className="text-gray-400">Not specified</span>
                            )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Points Summary Card - Simplified Design */}
              <div className={`${isMobile ? "mt-6" : "md:w-64 md:border-l md:border-gray-100 md:pl-6"}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Card header with total points */}
                  <div className="p-3 bg-blue-700 border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-blue-50" />
                      <h3 className="text-sm font-medium text-white">Total Points</h3>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {pointsLoading ? (
                        <div className="animate-pulse bg-blue-200 h-8 w-20 rounded"></div>
                      ) : (
                        totalPoints.toLocaleString()
                      )}
                    </div>
                  </div>

                  {/* Points breakdown - Simplified */}
                  <div className="p-3">
                    {pointsLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                              <div className="bg-gray-200 h-4 w-16 rounded animate-pulse"></div>
                            </div>
                            <div className="bg-gray-200 h-4 w-12 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : pointsData.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto hide-scrollbar">
                        {pointsData.map((item: PointsDataItem, index: number) => (
                          <div
                            key={item.category}
                            className="flex items-center m-0 justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                <item.icon className="h-3.5 w-3.5 text-blue-500" />
                              </div>
                              <span className="text-gray-700 text-sm">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-700 text-sm font-medium">{item.points.toLocaleString()} pts</span>
                              {(item.earned > 0 || item.spent > 0) && (
                                <div className="text-xs text-gray-400">
                                  {item.earned > 0 && <span className="text-green-600">+{item.earned}</span>}
                                  {item.earned > 0 && item.spent > 0 && " | "}
                                  {item.spent > 0 && <span className="text-red-500">-{item.spent}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No points earned yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start engaging to earn points!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, index) => renderSection(section, index))}

        {/* Social links section - simplified */}
        <div
          className={`border-t ${styles.divider} px-4 md:px-6 py-3 flex flex-wrap md:flex-nowrap justify-between items-center gap-3`}
        >
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                setActiveSocialPlatform("linkedin")
                setSocialLinkDialogOpen(true)
              }}
            >
              <Linkedin className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                setActiveSocialPlatform("twitter")
                setSocialLinkDialogOpen(true)
              }}
            >
              <Twitter className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                setActiveSocialPlatform("facebook")
                setSocialLinkDialogOpen(true)
              }}
            >
              <Facebook className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full relative"
              onClick={() => setNotificationDialogOpen(true)}
            >
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="text-sm text-gray-500 flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="hidden sm:inline">Updated:</span> {new Date(formData.updated_at).toLocaleDateString() || "Not updated"}
            </div>
            <Button
              className={`relative rounded-full transition-all duration-300 text-white ${hasBusinessCard ? 'bg-green-500 cursor-pointer' : canBuyBusinessCard ? 'bg-blue-600 hover:shadow-md hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed opacity-60'}`}
              size="sm"
              disabled={!canBuyBusinessCard && !hasBusinessCard}
              onClick={() => {
                if (hasBusinessCard) {
                  // Redirect to /[id]
                  const profileId = formData.id;
                  if (profileId) {
                    router.push(`/${profileId}`);
                  }
                } else if (canBuyBusinessCard) {
                  setBusinessCardDialogOpen(true);
                }
              }}
            >
              <span className="relative flex items-center">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                {hasBusinessCard ? 'Business Card (Unlocked)' : 'Business Card'}
                {!hasBusinessCard && canBuyBusinessCard && (
                  <span className="ml-2 text-xs font-normal">50 pts</span>
                )}
                {!hasBusinessCard && !canBuyBusinessCard && (
                  <span className="ml-2 text-xs font-normal">Locked</span>
                )}
              </span>
            </Button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 text-xs text-gray-500 flex flex-wrap md:flex-nowrap justify-between items-center border-t border-gray-100 gap-2">
          <div>© 2024 mockify Professional Network</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Verified Profile
            </span>
            <span className="hidden sm:inline">•</span>
            <span>ID: {formData.avc_id || "Not assigned"}</span>
          </div>
        </div>
        {/* Notification Settings Dialog */}
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md">
            <DialogTitle className="sr-only">Notification Settings</DialogTitle>
            <NotificationSettingsCarousel
              onClose={() => setNotificationDialogOpen(false)}
              onSave={handleSaveNotificationSettings}
              initialSettings={notificationSettings}
            />
          </DialogContent>
        </Dialog>

        {/* Social Media URL Dialog */}
        <Dialog open={socialLinkDialogOpen} onOpenChange={setSocialLinkDialogOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-xl bg-white rounded-xl">
            <DialogTitle className="sr-only">Social Media Links</DialogTitle>
            <div className="relative p-6">
              <DialogHeader className="pb-4 border-b border-gray-100">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  {activeSocialPlatform === "linkedin" && (
                    <>
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      Add LinkedIn Profile
                    </>
                  )}
                  {activeSocialPlatform === "twitter" && (
                    <>
                      <Twitter className="h-5 w-5 text-blue-400" />
                      Add Twitter Handle
                    </>
                  )}
                  {activeSocialPlatform === "facebook" && (
                    <>
                      <Facebook className="h-5 w-5 text-blue-600" />
                      Add Facebook URL
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                    Enter your URL
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="url"
                      className="pl-10 border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg transition-all duration-200"
                      placeholder={
                        activeSocialPlatform && socialLinks[activeSocialPlatform as keyof typeof socialLinks]
                          ? socialLinks[activeSocialPlatform as keyof typeof socialLinks]
                          : activeSocialPlatform === "linkedin"
                            ? "https://linkedin.com/in/yourprofile"
                            : activeSocialPlatform === "twitter"
                              ? "https://twitter.com/yourusername"
                              : "https://facebook.com/yourusername"
                      }
                      value={activeSocialPlatform ? socialLinks[activeSocialPlatform as keyof typeof socialLinks] : ""}
                      onChange={(e) => {
                        if (activeSocialPlatform) {
                          setSocialLinks((prev) => ({
                            ...prev,
                            [activeSocialPlatform]: e.target.value,
                          }))
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeSocialPlatform === "linkedin" && "Add your LinkedIn profile to connect with professionals"}
                    {activeSocialPlatform === "twitter" && "Share your Twitter handle to stay connected"}
                    {activeSocialPlatform === "facebook" && "Link your Facebook profile to connect with professionals"}
                  </p>
                </div>
              </div>

              <DialogFooter className="border-t border-gray-100 pt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSocialLinkDialogOpen(false)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSocialLink}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                  disabled={!activeSocialPlatform || savingSocialLink}
                >
                  {savingSocialLink ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Avatar Upload Dialog */}
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-xl bg-white rounded-xl">
            <DialogHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 px-6 py-4">
                <UserIcon className="h-5 w-5 text-blue-600" />
                Update Profile Photo
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={avatarUrl || providerAvatarUrl || "/placeholder.svg?height=112&width=112"} 
                      alt={formData.fullName || authName} 
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      {(formData.fullName || authName)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {avatarUrl && (
                    <div className="absolute -top-2 -right-2 bg-blue-100 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="w-full max-w-xs space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload-input"
                    className="hidden"
                    onChange={async (e) => {
                      setAvatarError(null)
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 5 * 1024 * 1024) {
                        setAvatarError("File size must be less than 5MB.")
                        return
                      }
                      setAvatarUploading(true)
                      try {
                        if (!user?.id) throw new Error("User not authenticated")
                        
                        // Use the new file service to upload
                        const uploadResult = await uploadFile(file)
                        const imageUrl = uploadResult.url

                        // Update profile avatar using the new API endpoint
                        const response = await fetch('/api/profile/avatar', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ avatar_url: imageUrl }),
                        })

                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.message || 'Failed to update avatar')
                        }

                        const result = await response.json()
                        setAvatarUrl(result.avatar_url)
                        toast(
                          <div>
                            <div className="font-semibold text-green-700">Profile photo updated successfully!</div>
                            <div className="text-xs text-muted-foreground">Your new profile picture is now visible to others.</div>
                          </div>
                        );
                        setAvatarDialogOpen(false)
                      } catch (err: any) {
                        setAvatarError(err.message || "Failed to upload avatar.")
                      }
                      setAvatarUploading(false)
                    }}
                  />
                  <label htmlFor="avatar-upload-input" className="w-full">
                    <Button 
                      asChild 
                      type="button" 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 h-11 relative overflow-hidden group"
                      disabled={avatarUploading}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {avatarUploading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            {avatarUrl ? 'Change Photo' : 'Add Photo'}
                          </>
                        )}
                      </span>
                    </Button>
                  </label>

                  {avatarError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {avatarError}
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium text-blue-900">Photo Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                        Maximum file size: 5MB
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                        Supported formats: JPG, PNG, GIF, WebP
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                        Recommended: Square image, minimum 400x400px
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Business Card Purchase Dialog */}
        <Dialog open={businessCardDialogOpen} onOpenChange={setBusinessCardDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle>Unlock Business Card</DialogTitle>
            <div className="py-4 text-gray-700">
              Unlock your digital Business Card for <b>50 points</b>!<br />
              This will allow you to share your professional card with others.<br />
              Are you sure you want to proceed?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBusinessCardDialogOpen(false)} disabled={businessCardLoading}>Cancel</Button>
              <Button onClick={handleBuyBusinessCard} disabled={businessCardLoading} className="bg-blue-600 text-white hover:bg-blue-700">
                {businessCardLoading ? 'Processing...' : 'Unlock for 50 pts'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <AnimationStyle />
    </Card>
  )
}
