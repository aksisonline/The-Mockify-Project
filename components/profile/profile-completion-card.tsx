import { useProfile } from "@/hooks/use-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, User, Briefcase, GraduationCap, Award, MapPin, Link } from "lucide-react"
import { useRouter } from "next/navigation"

export function ProfileCompletionCard() {
  const { profile, isLoading } = useProfile()
  const router = useRouter()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completion = profile?.profile_completion || {
    basic_details: false,
    employment: false,
    education: false,
    certifications: false,
    address: false,
    social_links: false,
    completion_percentage: 0,
  }

  const sections = [
    {
      name: "Basic Details",
      completed: completion.basic_details,
      icon: User,
      action: () => router.push("/profile?section=basic"),
    },
    {
      name: "Employment",
      completed: completion.employment,
      icon: Briefcase,
      action: () => router.push("/profile?section=employment"),
    },
    {
      name: "Certifications",
      completed: completion.certifications,
      icon: Award,
      action: () => router.push("/profile?section=certification"),
    },
    {
      name: "Address",
      completed: completion.address,
      icon: MapPin,
      action: () => router.push("/profile?section=address"),
    },
    {
      name: "Social Links",
      completed: completion.social_links,
      icon: Link,
      action: () => router.push("/profile?section=social"),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{completion.completion_percentage}% Complete</span>
              {completion.completion_percentage === 100 && (
                <span className="text-sm text-green-600 font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </span>
              )}
            </div>
            <Progress value={completion.completion_percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className="text-sm">{section.name}</span>
                </div>
                {!section.completed && (
                  <Button variant="ghost" size="sm" onClick={section.action}>
                    Complete
                  </Button>
                )}
              </div>
            ))}
          </div>

          {completion.completion_percentage < 100 && (
            <Button className="w-full mt-2" onClick={() => router.push("/profile")}>
              Complete Your Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
