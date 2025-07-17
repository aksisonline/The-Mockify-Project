// @ts-nocheck
"use client";

import type React from "react";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NotificationCard } from "@/components/notification-card";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import DynamicIcon from "@/components/dynamic-icon";
import { notificationService } from "@/lib/notification-service-client";
import { LogIn } from "lucide-react";
import { getProfile } from "@/lib/profile-service";

// Define types for better type safety
interface Icon {
  type: "svg" | "text" | "gradient";
  bgColor?: string;
  color?: string;
  shape?: string;
  path?: string;
  fillRule?: "evenodd" | "nonzero";
  text?: string;
  gradient?: string;
}

interface NavItem {
  id: string;
  name: string;
  route: string;
  hasPointer?: boolean;
  icon: Icon;
  iconName: string;
  bgColor: string;
}

interface ProfileMenuOption {
  id: string;
  name: string;
  route?: string;
  icon: React.ReactNode;
}

// Add prop type
interface VerticalSidebarDockProps {
  variant?: 'desktop' | 'mobile';
}

// Sample notification data
const initialNotifications = [
  {
    id: "1",
    title: "New message received",
    description:
      "You have a new message from John Doe about your recent project.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    type: "info" as const,
  },
  {
    id: "2",
    title: "Payment successful",
    description:
      "Your payment of $199 for Premium Plan has been processed successfully.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: false,
    type: "success" as const,
  },
  {
    id: "3",
    title: "System update",
    description:
      "The system will undergo maintenance on Sunday, 10 PM to 2 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    type: "warning" as const,
  },
  {
    id: "4",
    title: "Login attempt",
    description:
      "Unusual login attempt detected from a new device. Please verify it was you.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    type: "error" as const,
  },
];

export default function VerticalSidebarDock({ variant = 'desktop' }: VerticalSidebarDockProps) {
  const { user, session, signOut, isLoading } = useAuth();
  const [sidebarProfile, setSidebarProfile] = useState<any>(null);
  const router = useRouter();

  // Add authentication check with better error handling
  useEffect(() => {
    if (!isLoading && !user && !session) {
      console.log("🔄 [Sidebar] No authenticated user, redirecting to login")
      // Clear any cached data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      router.push('/login');
    }
  }, [user, session, isLoading, router]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const expandedHeightRef = useRef<number>(0);
  const collapsedHeightRef = useRef<number>(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle drag constraints for the mobile dock
  useEffect(() => {
    const calculateConstraints = () => {
      if (scrollContainerRef.current && scrollContentRef.current) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const contentWidth = scrollContentRef.current.scrollWidth;
        const newLeftConstraint = Math.min(0, containerWidth - contentWidth);
        setDragConstraints({ left: newLeftConstraint, right: 0 });
      }
    };

    if (variant === 'mobile' && scrollContainerRef.current && scrollContentRef.current) {
      const timeoutId = setTimeout(calculateConstraints, 100);
      window.addEventListener('resize', calculateConstraints);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculateConstraints);
      };
    }
  }, [variant]);

  // Close profile menu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (isProcessingAction) return;
    const target = event.target as HTMLElement;

    // Check if click is within the dock container
    const isClickInDock = dockRef.current?.contains(target);
    const isClickInProfileMenu = profileMenuRef.current?.contains(target);
    const isClickInNotificationsMenu = notificationsMenuRef.current?.contains(target);
    const isClickOnProfileButton = profileButtonRef.current?.contains(target);
    const isClickOnNotificationsButton = notificationsButtonRef.current?.contains(target);

    // Handle profile menu
    if (profileMenuOpen && !isClickInProfileMenu && !isClickOnProfileButton) {
      setProfileMenuOpen(false);
      if (!isClickInDock) {
        setIsExpanded(false);
      }
    }

    // Handle notifications menu
    if (notificationsOpen && !isClickInNotificationsMenu && !isClickOnNotificationsButton) {
      setNotificationsOpen(false);
      if (!isClickInDock) {
        setIsExpanded(false);
      }
    }

    // If clicking outside both menus and the dock, collapse the sidebar
    if (!isClickInDock && !isClickInProfileMenu && !isClickInNotificationsMenu) {
      setIsExpanded(false);
    }
  };

  // Handle profile button click
  const handleProfileButtonClick = () => {
    setIsExpanded(true);
    // If notifications menu is open, close it first
    if (notificationsOpen) {
      setNotificationsOpen(false);
    }
    setProfileMenuOpen((open) => !open);
  };

  // Handle notifications button click
  const handleNotificationsButtonClick = () => {
    setIsExpanded(true);
    // If profile menu is open, close it first
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
    }
    setNotificationsOpen((open) => !open);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen, notificationsOpen, isProcessingAction]);

  // User points (would come from your user state/context in a real app)
  const userPoints = 2750;
  // Dynamic navigation items configuration
  const navItems: NavItem[] = [
    {
      id: "tools",
      name: "Tools",
      route: "/tools",
      iconName: "settings",
      bgColor: "bg-blue-500",
    },
    {
      id: "careers",
      name: "Careers",
      route: "/careers",
      iconName: "send",
      bgColor: "bg-purple-500",
    },
    {
      id: "directory",
      name: "Directory",
      route: "/directory",
      iconName: "users",
      bgColor: "bg-green-500",
    },
    {
      id: "discussions",
      name: "Discussions",
      route: "/discussions",
      iconName: "message-square",
      bgColor: "bg-indigo-500",
    },
    {
      id: "events",
      name: "Events",
      route: "/events",
      iconName: "calendar",
      bgColor: "bg-cyan-600",
    },
    {
      id: "ekart",
      name: "E-Kart",
      route: "/ekart",
      iconName: "shopping-cart",
      bgColor: "bg-red-500",
    },
    {
      id: "reviews",
      name: "Reviews",
      route: "/reviews",
      iconName: "star",
      bgColor: "bg-yellow-500",
    },
    {
      id: "training",
      name: "Training",
      route: "/training",
      iconName: "graduation-cap",
      bgColor: "bg-indigo-500",
    },
    {
      id: "rewards",
      name: "Rewards",
      route: "/rewards",
      iconName: "arrow-right",
      bgColor: "bg-pink-500",
    },
  ];

  // Profile menu options
  const profileMenuOptions: ProfileMenuOption[] = [
    {
      id: "profile-settings",
      name: "Profile Settings",
      route: "/profile",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "dashboard",
      name: "Dashboard",
      route: "/profile/dashboard",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    // Add Admin Panel option conditionally
    ...(sidebarProfile?.is_admin ? [{
      id: "admin-panel",
      name: "Admin Panel",
      route: "/admin",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    }] : []),
    {
      id: "sign-out",
      name: "Sign Out",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  // Fetch notifications for the logged-in user
  useEffect(() => {
    let cleanupPolling: (() => void) | undefined;
    async function fetchNotifications() {
      if (!user) return;
      try {
        const notifs = await notificationService.getUserNotifications(user.id, {
          limit: 20,
          unreadOnly: false
        });
        setNotifications(
          notifs.map((n) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            timestamp: new Date(n.created_at),
            read: n.is_read,
            type: mapNotificationType(n.notification_type),
          }))
        );

        // Start polling for new notifications with focus detection
        cleanupPolling = notificationService.startPolling(user.id, (newNotifs) => {
          setNotifications((prev) => {
            // Create a Set of existing notification IDs for efficient lookup
            const existingIds = new Set(prev.map(n => n.id));
            
            // Filter out notifications that already exist
            const uniqueNewNotifs = newNotifs.filter(n => !existingIds.has(n.id));
            
            // Only update state if there are actually new notifications
            if (uniqueNewNotifs.length === 0) {
              return prev;
            }
            
            // Add new notifications to the beginning of the array
            return [
              ...uniqueNewNotifs.map((n) => ({
                id: n.id,
                title: n.title,
                description: n.message,
                timestamp: new Date(n.created_at),
                read: n.is_read,
                type: mapNotificationType(n.notification_type),
              })),
              ...prev,
            ];
          });
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    fetchNotifications();
    return () => {
      if (cleanupPolling) {
        cleanupPolling();
      }
    };
  }, [user]);

  // Map backend notification_type to NotificationCard type
  function mapNotificationType(type) {
    if (type === "system_update" || type === "announcement" || type === "newsletter" || type === "welcome") return "info";
    if (type === "job_posted" || type === "points_earned" || type === "reward_purchased" || type === "level_up" || type === "payment_received" || type === "enrollment_confirmed" || type === "course_completed" || type === "certificate_issued") return "success";
    if (type === "event_reminder" || type === "event_updated" || type === "discussion_update" || type === "poll_vote") return "warning";
    if (type === "order_cancelled" || type === "payment_failed" || type === "event_cancelled" || type === "error" || type === "login_attempt") return "error";
    return "info";
  }

  // Handle marking notification as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProcessingAction(true);
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    toast.success("Notification marked as read");
    setTimeout(() => setIsProcessingAction(false), 100);
  };

  // Handle dismissing notification
  const handleDismissNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProcessingAction(true);
    setNotifications((prev) => prev.filter((n) => n.id !== id)); // Remove from UI immediately
    await notificationService.deleteNotification(id); // Remove from DB
    toast.success("Notification dismissed");
    setTimeout(() => setIsProcessingAction(false), 100);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProcessingAction(true);
    if (user) await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
    setTimeout(() => setIsProcessingAction(false), 100);
  };

  // Calculate and store the heights for expanded and collapsed states
  useEffect(() => {
    if (variant === 'mobile') {
      return;
    }
    if (!containerRef.current) return;

    // Function to measure heights
    const measureHeights = () => {
      // First measure collapsed height
      setIsExpanded(false);
      requestAnimationFrame(() => {
        if (containerRef.current) {
          collapsedHeightRef.current = containerRef.current.scrollHeight;

          // Then temporarily expand to measure expanded height
          setIsExpanded(true);
          // Wait longer for all animations and content to settle
          setTimeout(() => {
            if (containerRef.current) {
              expandedHeightRef.current = containerRef.current.scrollHeight;

              // Reset to collapsed state
              setIsExpanded(false);
              requestAnimationFrame(() => {
                setContainerHeight(collapsedHeightRef.current);
              });
            }
          }, 300); // Increased delay to ensure all content is rendered
        }
      });
    };

    // Run once on mount or when switching from mobile to desktop view
    measureHeights();

    // Cleanup
    return () => {
      setIsExpanded(false);
    };
  }, [variant]);

  // Update height when expanded state changes
  useEffect(() => {
    if (variant === 'mobile') return;

    if (isExpanded) {
      // Use the pre-measured expanded height immediately
      setContainerHeight(expandedHeightRef.current);
    } else {
      setContainerHeight(collapsedHeightRef.current);
    }
  }, [isExpanded, variant]);

  // Add scroll detection and bounce animation for mobile
  useEffect(() => {
    if (variant !== 'mobile' || !scrollContainerRef.current) return;

    const handleScroll = () => {
      if (
        scrollContainerRef.current &&
        scrollContainerRef.current.scrollLeft > 10
      ) {
        setHasScrolled(true);
      }
    };

    const scrollElement = scrollContainerRef.current;
    scrollElement.addEventListener("scroll", handleScroll);

    // Check if scroll is possible (content width > container width)
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const isScrollable =
          scrollContainerRef.current.scrollWidth >
          scrollContainerRef.current.clientWidth;
        if (isScrollable && !hasScrolled) {
          // Show scroll hint animation after a short delay
          setTimeout(() => {
            setShowScrollHint(true);

            // Hide the hint after animation completes
            setTimeout(() => {
              setShowScrollHint(false);
            }, 2500);
          }, 1000);
        }
      }
    };

    // Run after component mounts and animations complete
    setTimeout(checkScrollable, 500);

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [variant, hasScrolled]);

  // Programmatically scroll the container for the bounce effect
  useEffect(() => {
    if (showScrollHint && scrollContainerRef.current && !hasScrolled) {
      const scrollContainer = scrollContainerRef.current;

      // Scroll sequence: right then back
      const scrollSequence = async () => {
        // Scroll right
        scrollContainer.scrollTo({
          left: 40,
          behavior: "smooth",
        });

        // Wait a moment
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Scroll back
        scrollContainer.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      };

      scrollSequence();
    }
  }, [showScrollHint, hasScrolled]);

  const pathname = usePathname();
  const activeNavItem = useMemo(
    () =>
      navItems.find((item) =>
        pathname === item.route ||
        pathname.startsWith(item.route + "/")
      ),
    [pathname, navItems]
  );

  const handleProfileMenuClick = async (option: ProfileMenuOption) => {
    // Immediately close the menu and update UI state
    setProfileMenuOpen(false);
    setIsExpanded(false);
    
    if (option.id === "sign-out") {
      const loadingToast = toast.loading("Signing out...");
      
      try {
        // Perform sign out
        await signOut();
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        toast.success("Signed out successfully");
        
        // Redirect to login
        router.push('/login');
        
      } catch (err) {
        // Ensure loading toast is dismissed even if there's an error
        toast.dismiss(loadingToast);
        toast.error("Sign out failed. Please try again.");
        
        // Still redirect to login even if there's an error
        router.push('/login');
      }
    } else if (option.route) {
      // For other menu options with routes, navigate to the route
      router.push(option.route);
    }
  };

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat().format(points);
  };

  // Animation variants for consistent animations
  const containerVariants = {
    expanded: { width: 256 },
    collapsed: { width: 70 },
  };

  const textContainerVariants = {
    expanded: {
      width: "auto",
      opacity: 1,
      transition: {
        width: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.1, ease: "easeOut" },
      },
    },
    collapsed: {
      width: 0,
      opacity: 0,
      transition: {
        width: { duration: 0.2, ease: "easeIn" },
        opacity: { duration: 0.1, ease: "easeIn" },
      },
    },
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Update the fetchProfileData function with better error handling
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !session) {
        // console.log("🔄 [Sidebar] No user or session, skipping profile fetch")
        setSidebarProfile(null);
        return;
      }
      
      try {
        // console.log(" [Sidebar] Fetching profile data for user:", user.id)
        const profile = await getProfile(user.id);
        if (profile) {
          // console.log("✅ [Sidebar] Profile data loaded successfully")
          setSidebarProfile(profile);
        }
      } catch (error: any) {
        console.error("❌ [Sidebar] Error fetching profile:", error);
        
        // Handle auth error - redirect to login if unauthorized
        if (error.message?.includes('unauthorized') || 
            error.message?.includes('not authenticated') ||
            error.message?.includes('401')) {
          console.log("🔄 [Sidebar] Auth error, redirecting to login")
          router.push('/login');
        }
      }
    };

    if (user && session && !isLoading) {
      fetchProfileData();
    }
  }, [user?.id, session?.access_token, isLoading, router]);

  // Don't render sidebar if user is not authenticated or still loading
  if (isLoading) {
    // console.log("🔄 [Sidebar] Still loading, not rendering")
    return null;
  }
  
  if (!user || !session) {
    // console.log("🔄 [Sidebar] No user or session, not rendering")
    return null;
  }

  if (variant === 'mobile') {
    // Mobile bottom dock
    return (
      <div className="">

        {/* Mobile Floating Dock */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-2xl">
          <motion.div
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 px-4 py-3 flex items-center justify-between w-full"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Scrollable App Icons */}
            <div
              ref={scrollContainerRef}
              className="flex-1 flex items-center overflow-hidden cursor-grab min-w-0"
            >
              <motion.div
                ref={scrollContentRef}
                className="flex items-center gap-2"
                drag="x"
                dragConstraints={dragConstraints}
                whileTap={{ cursor: 'grabbing' }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
              >
                {navItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isDragging) {
                        router.push(item.route);
                      }
                    }}
                  >
                    <motion.div
                      className={`
                        relative flex-shrink-0 flex items-center justify-center p-1.5 rounded-xl cursor-pointer
                        ${activeNavItem?.id === item.id ? "bg-blue-50" : "hover:bg-gray-100"}
                        transition-colors duration-200
                      `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                        <DynamicIcon iconName={item.iconName} iconColor="white" size={20} />
                      </div>
                      {/* Tooltip on hover */}
                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className="absolute -top-8 left-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
                          >
                            {item.name}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 flex-shrink-0 mx-2"></div>

            {/* Fixed Right Section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                // User is signed in
                <>
                  {/* Notifications Button */}
                  <motion.div
                    id="notifications-button"
                    ref={notificationsButtonRef}
                    className={`
                  relative flex items-center justify-center p-1.5 rounded-xl cursor-pointer
                  hover:bg-gray-100 transition-colors duration-200
                  ${notificationsOpen ? "bg-gray-100" : ""}
                `}
                    onClick={handleNotificationsButtonClick}
                    onMouseEnter={() => setHoveredItem("notifications")}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}

                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === "notifications" && !notificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, y: 2, x: "-50%" }}
                          className="absolute -top-8 left-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
                        >
                          Notifications
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Notifications Menu */}
                    <AnimatePresence>
                      {notificationsOpen && (
                        <motion.div
                          ref={notificationsMenuRef}
                          className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-80"
                          variants={menuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                            <div className="font-medium text-sm">Notifications</div>
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="py-2 px-3 max-h-[60vh] overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notification) => (
                                <NotificationCard
                                  key={notification.id}
                                  id={notification.id}
                                  title={notification.title}
                                  description={notification.description}
                                  timestamp={notification.timestamp}
                                  read={notification.read}
                                  type={notification.type}
                                  onMarkAsRead={handleMarkAsRead}
                                  onDismiss={handleDismissNotification}
                                />
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <svg
                                  className="w-12 h-12 mx-auto text-gray-300 mb-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                  />
                                </svg>
                                <p className="text-sm">No notifications yet</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Profile Button */}
                  <motion.div
                    id="profile-button"
                    ref={profileButtonRef}
                    className={`
                  relative flex items-center justify-center p-1.5 rounded-xl cursor-pointer
                  hover:bg-gray-100 transition-colors duration-200
                  ${profileMenuOpen ? "bg-gray-100" : ""}
                `}
                    onClick={handleProfileButtonClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
                      <AvatarImage 
                        src={sidebarProfile?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.avatar_url} 
                        alt={sidebarProfile?.full_name || "Profile"} 
                      />
                      <AvatarFallback className="text-xl md:text-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                        {(sidebarProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User Name")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {sidebarProfile?.full_name && (
                      <span className="ml-2 text-sm font-medium text-gray-700 truncate max-w-[100px] sm: hidden">
                        {sidebarProfile.full_name}
                      </span>
                    )}

                    {/* Profile Menu */}
                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          ref={profileMenuRef}
                          className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-48"
                          variants={menuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="p-3 border-b border-gray-100">
                            <div className="font-medium text-sm">{sidebarProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}</div>
                            <div className="text-xs text-gray-500">{sidebarProfile?.email || user?.email || "No email"}</div>
                          </div>
                          <div className="py-1">
                            {profileMenuOptions.map((option) => (
                              <div key={option.id}>
                                {option.route ? (
                                  <Link href={option.route}>
                                    <div
                                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => handleProfileMenuClick(option)}
                                    >
                                      <span className="text-gray-500">{option.icon}</span>
                                      {option.name}
                                    </div>
                                  </Link>
                                ) : (
                                  <div
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleProfileMenuClick(option)}
                                  >
                                    <span className="text-gray-500">{option.icon}</span>
                                    {option.name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : (
                // User is not signed in
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Desktop vertical dock
  return (
    <div className="">

      {/* Desktop Dock */}
      <motion.div
        ref={dockRef}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 overflow-visible"
        onMouseEnter={() => { setIsExpanded(true); }}
        onMouseLeave={() => {
          if (!profileMenuOpen && !notificationsOpen) {
            setIsExpanded(false);
          }
        }}
        variants={containerVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          ref={containerRef}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 overflow-visible"
          animate={{
            height: containerHeight > 0 ? containerHeight : "auto",
          }}
          transition={{
            height: {
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.25,
            },
          }}
        >
          {/* Apps Section */}
          <div
            className={`text-xs text-gray-500 font-medium mb-2 ${
              isExpanded ? "px-2" : "text-center"
            }`}
          >
            APPS
          </div>
          <div
            className={`flex flex-col gap-1 ${!isExpanded && "items-center"}`}
          >
            {navItems.map((item) => (
              <Link key={item.id} href={item.route}>
                <motion.div
                  className={`
                    flex items-center rounded-xl cursor-pointer
                    ${isExpanded ? "p-2 gap-3" : ""}
                    ${
                      activeNavItem?.id === item.id ? "bg-blue-50" : "hover:bg-gray-100"
                    }
                    transition-colors duration-200
                  `}
                  onClick={() => {}}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={!isExpanded ? { scale: 1.1 } : {}}
                >
                  <motion.div
                    className={`
                      relative w-12 h-12 rounded-xl flex items-center justify-center
                      transition-colors duration-200
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                      <DynamicIcon iconName={item.iconName} iconColor="white" size={20} />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={textContainerVariants}
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                    className="flex items-center overflow-hidden"
                  >
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap pr-2">
                      {item.name}
                    </span>
                    {item.hasPointer && (
                      <svg
                        className="w-4 h-4 text-gray-400 ml-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        />
                      </svg>
                    )}
                  </motion.div>

                  {/* Tooltip for collapsed state */}
                  <AnimatePresence>
                    {hoveredItem === item.id && !isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
                      >
                        {item.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className={`my-3 ${isExpanded ? "mx-2" : "mx-1"}`}>
            <div className="h-px bg-gray-200"></div>
          </div>

          {/* Notifications Button */}
          {user && (
            <motion.div
              id="notifications-button"
              ref={notificationsButtonRef}
              className={`
                flex items-center rounded-xl mb-2 cursor-pointer
                transition-colors duration-200 relative
                ${isExpanded ? "p-2 gap-3 mx-1" : "justify-center h-12 w-12 p-0 gap-0"}
                ${notificationsOpen ? "bg-gray-100" : "hover:bg-gray-100"}
              `}
              onClick={handleNotificationsButtonClick}
              onMouseEnter={() => setHoveredItem("notifications")}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={!isExpanded ? { scale: 1.1 } : {}}
            >
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {/* Unread badge */}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
              </div>
              <motion.div
                variants={textContainerVariants}
                initial="collapsed"
                animate={isExpanded ? "expanded" : "collapsed"}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-xs font-medium text-amber-800">
                  Notifications
                </span>
                <span className="text-sm font-bold text-amber-900">
                  {unreadCount > 0 ? `${unreadCount} unread` : "No new alerts"}
                </span>
              </motion.div>
              {/* Tooltip for collapsed state */}
              <AnimatePresence>
                {hoveredItem === "notifications" &&
                  !isExpanded &&
                  !notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.9 }}
                      className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
                    >
                      <div>Notifications</div>
                      {unreadCount > 0 && (
                        <div className="font-bold">{unreadCount} unread</div>
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>
              {/* Notifications Menu */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    ref={notificationsMenuRef}
                    className="absolute bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-80"
                    style={{
                      left: isExpanded ? "100%" : "100%",
                      bottom: "0",
                      transform: isExpanded
                        ? "translateX(12px)"
                        : "translateX(12px)",
                    }}
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <div className="font-medium text-sm">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="py-2 px-3 max-h-[60vh] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <NotificationCard
                            key={notification.id}
                            id={notification.id}
                            title={notification.title}
                            description={notification.description}
                            timestamp={notification.timestamp}
                            read={notification.read}
                            type={notification.type}
                            onMarkAsRead={handleMarkAsRead}
                            onDismiss={handleDismissNotification}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-300 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Profile Button or Sign In (Desktop) */}
          {user ? (
            <motion.div
              id="profile-button"
              ref={profileButtonRef}
              className={`
                flex items-center rounded-xl cursor-pointer
                transition-colors duration-200 relative
                ${isExpanded ? "p-2 gap-3 mx-1 h-14" : "justify-center h-12 w-12 p-0 gap-0"}
                ${profileMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"}
              `}
              onClick={handleProfileButtonClick}
              onMouseEnter={() => setHoveredItem("profile")}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={!isExpanded ? { scale: 1.1 } : {}}
            >
              <Avatar className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
                <AvatarImage 
                  src={sidebarProfile?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.avatar_url} 
                  alt={sidebarProfile?.full_name || "Profile"} 
                />
                <AvatarFallback className="text-xl md:text-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700">
                  {(sidebarProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User Name")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isExpanded && sidebarProfile?.full_name && (
                <span className="ml-3 text-sm font-medium text-gray-700 truncate max-w-[120px]">{sidebarProfile.full_name}</span>
              )}

              {/* Profile Menu */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    ref={profileMenuRef}
                    className="absolute bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-48"
                    style={{
                      left: isExpanded ? "100%" : "100%",
                      bottom: "0",
                      transform: isExpanded
                        ? "translateX(12px)"
                        : "translateX(12px)",
                    }}
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium text-sm">{sidebarProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}</div>
                      <div className="text-xs text-gray-500">{sidebarProfile?.email || user?.email || "No email"}</div>
                    </div>
                    <div className="py-1">
                      {profileMenuOptions.map((option) => (
                        <div key={option.id}>
                          {option.route ? (
                            <Link href={option.route}>
                              <div
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleProfileMenuClick(option)}
                              >
                                <span className="text-gray-500">{option.icon}</span>
                                {option.name}
                              </div>
                            </Link>
                          ) : (
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleProfileMenuClick(option)}
                            >
                              <span className="text-gray-500">{option.icon}</span>
                              {option.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Link href="/login" onClick={(e) => {
              e.preventDefault();
              router.push('/login');
            }}>
              <motion.div
                className={`
                  flex items-center justify-center rounded-xl cursor-pointer transition-colors duration-200
                  ${isExpanded ? "p-2 gap-3 mx-1 h-14 w-full" : "h-12 w-12 p-0"}
                  hover:bg-gray-100
                `}
                whileHover={!isExpanded ? { scale: 1.1 } : {}}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
                  <LogIn className="w-6 h-6 text-blue-600" />
                </div>
                {isExpanded && (
                  <span className="ml-3 text-sm font-medium text-blue-700 truncate max-w-[120px]">Sign In</span>
                )}
              </motion.div>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}