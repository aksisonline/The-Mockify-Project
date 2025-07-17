"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Save,
  Mail,
  ShoppingCart,
  Briefcase,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface NotificationSettingsCarouselProps {
  onClose: () => void
  onSave: (settings: NotificationSettings) => void
  initialSettings?: NotificationSettings
}

export interface NotificationSettings {
  receive_newsletters: boolean
  get_ekart_notifications: boolean
  stay_updated_on_jobs: boolean
  receive_daily_event_updates: boolean
  get_trending_community_posts: boolean
}

const defaultSettings: NotificationSettings = {
  receive_newsletters: true,
  get_ekart_notifications: true,
  stay_updated_on_jobs: true,
  receive_daily_event_updates: false,
  get_trending_community_posts: true,
}

export function NotificationSettingsCarousel({
  onClose,
  onSave,
  initialSettings = defaultSettings,
}: NotificationSettingsCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings)

  const questions = [
    {
      title: "Receive Newsletters",
      description: "Would you like to receive our newsletters with updates and offers?",
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      iconBg: "bg-blue-50",
      component: (
        <div className="w-full py-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Newsletter Updates</h4>
                <p className="text-xs text-gray-500">Receive our latest news and updates</p>
              </div>
            </div>
            <RadioGroup
              value={settings.receive_newsletters ? "yes" : "no"}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, receive_newsletters: value === "yes" }))}
              className="flex justify-center gap-8 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="newsletter-yes" className="text-blue-500" />
                <Label htmlFor="newsletter-yes" className="font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="newsletter-no" className="text-gray-500" />
                <Label htmlFor="newsletter-no" className="font-medium">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
    },
    {
      title: "Ekart Notifications",
      description: "Would you like to receive notifications about Ekart orders and deliveries?",
      icon: <ShoppingCart className="h-5 w-5 text-indigo-500" />,
      iconBg: "bg-indigo-50",
      component: (
        <div className="w-full py-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-50 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Ekart Updates</h4>
                <p className="text-xs text-gray-500">Get notified about orders and deliveries</p>
              </div>
            </div>
            <RadioGroup
              value={settings.get_ekart_notifications ? "yes" : "no"}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, get_ekart_notifications: value === "yes" }))}
              className="flex justify-center gap-8 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="ekart-yes" className="text-indigo-500" />
                <Label htmlFor="ekart-yes" className="font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="ekart-no" className="text-gray-500" />
                <Label htmlFor="ekart-no" className="font-medium">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
    },
    {
      title: "Job Openings",
      description: "Would you like to stay updated on new job opportunities?",
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      iconBg: "bg-purple-50",
      component: (
        <div className="w-full py-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-50 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Job Alerts</h4>
                <p className="text-xs text-gray-500">Get notified about new job openings</p>
              </div>
            </div>
            <RadioGroup
              value={settings.stay_updated_on_jobs ? "yes" : "no"}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, stay_updated_on_jobs: value === "yes" }))}
              className="flex justify-center gap-8 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="jobs-yes" className="text-purple-500" />
                <Label htmlFor="jobs-yes" className="font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="jobs-no" className="text-gray-500" />
                <Label htmlFor="jobs-no" className="font-medium">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
    },
    {
      title: "Event Updates",
      description: "Would you like to receive daily updates about events?",
      icon: <Calendar className="h-5 w-5 text-teal-500" />,
      iconBg: "bg-teal-50",
      component: (
        <div className="w-full py-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-teal-50 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Event Updates</h4>
                <p className="text-xs text-gray-500">Get daily notifications about upcoming events</p>
              </div>
            </div>
            <RadioGroup
              value={settings.receive_daily_event_updates ? "yes" : "no"}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, receive_daily_event_updates: value === "yes" }))}
              className="flex justify-center gap-8 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="events-yes" className="text-teal-500" />
                <Label htmlFor="events-yes" className="font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="events-no" className="text-gray-500" />
                <Label htmlFor="events-no" className="font-medium">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
    },
    {
      title: "Community Posts",
      description: "Would you like to get notifications for trending community posts?",
      icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
      iconBg: "bg-amber-50",
      component: (
        <div className="w-full py-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-50 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Trending Posts</h4>
                <p className="text-xs text-gray-500">Get notified about popular community discussions</p>
              </div>
            </div>
            <RadioGroup
              value={settings.get_trending_community_posts ? "yes" : "no"}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, get_trending_community_posts: value === "yes" }))
              }
              className="flex justify-center gap-8 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="community-yes" className="text-amber-500" />
                <Label htmlFor="community-yes" className="font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="community-no" className="text-gray-500" />
                <Label htmlFor="community-no" className="font-medium">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white">
      <CardHeader className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="absolute inset-0 bg-white opacity-10 pattern-dots-lg"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">Notification Settings</CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-6 relative z-10">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-blue-500 w-10 mx-1"
                  : index < currentStep
                    ? "bg-blue-300 w-6 mx-1"
                    : "bg-gray-200 w-6 mx-1"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[180px] flex flex-col"
          >
            <h3 className="text-xl font-medium text-gray-800 flex items-center gap-2">
              <span
                className={`${questions[currentStep].iconBg} w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm`}
              >
                {questions[currentStep].icon}
              </span>
              {questions[currentStep].title}
            </h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">{questions[currentStep].description}</p>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex gap-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    const newValue = true
                    if (currentStep === 0) {
                      setSettings((prev) => ({ ...prev, receive_newsletters: newValue }))
                    } else if (currentStep === 1) {
                      setSettings((prev) => ({ ...prev, get_ekart_notifications: newValue }))
                    } else if (currentStep === 2) {
                      setSettings((prev) => ({ ...prev, stay_updated_on_jobs: newValue }))
                    } else if (currentStep === 3) {
                      setSettings((prev) => ({ ...prev, receive_daily_event_updates: newValue }))
                    } else {
                      setSettings((prev) => ({ ...prev, get_trending_community_posts: newValue }))
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-center transition-all ${
                    (currentStep === 0 && settings.receive_newsletters) ||
                    (currentStep === 1 && settings.get_ekart_notifications) ||
                    (currentStep === 2 && settings.stay_updated_on_jobs) ||
                    (currentStep === 3 && settings.receive_daily_event_updates) ||
                    (currentStep === 4 && settings.get_trending_community_posts)
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = false
                    if (currentStep === 0) {
                      setSettings((prev) => ({ ...prev, receive_newsletters: newValue }))
                    } else if (currentStep === 1) {
                      setSettings((prev) => ({ ...prev, get_ekart_notifications: newValue }))
                    } else if (currentStep === 2) {
                      setSettings((prev) => ({ ...prev, stay_updated_on_jobs: newValue }))
                    } else if (currentStep === 3) {
                      setSettings((prev) => ({ ...prev, receive_daily_event_updates: newValue }))
                    } else {
                      setSettings((prev) => ({ ...prev, get_trending_community_posts: newValue }))
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-center transition-all ${
                    (currentStep === 0 && !settings.receive_newsletters) ||
                    (currentStep === 1 && !settings.get_ekart_notifications) ||
                    (currentStep === 2 && !settings.stay_updated_on_jobs) ||
                    (currentStep === 3 && !settings.receive_daily_event_updates) ||
                    (currentStep === 4 && !settings.get_trending_community_posts)
                      ? "bg-gray-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-5 bg-gray-50">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-1 transition-all duration-200 bg-white ${
            currentStep === 0 ? "opacity-50" : "hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < questions.length - 1 ? (
          <Button
            onClick={nextStep}
            className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow text-white"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
  flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg text-white 
  font-medium px-5 py-2 rounded-lg transform hover:scale-105"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
