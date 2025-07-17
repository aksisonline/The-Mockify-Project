"use client"

import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getLatestEducationRecord, addEducationIfChanged } from "@/lib/profile-service"

interface EducationFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  initialData?: any
}

export function EducationForm({ onSave, onCancel, initialData = {} }: EducationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    educationLevel: initialData.educationLevel || "",
    university: initialData.university || "",
    course: initialData.course || "",
    specialization: initialData.specialization || "",
    courseType: initialData.courseType || "full-time",
    startYear: initialData.startYear || "",
    endYear: initialData.endYear || "",
    gradingSystem: initialData.gradingSystem || "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatest() {
      setLoading(true)
      try {
        if (user?.id) {
          const latest = await getLatestEducationRecord(user.id)
          if (latest) {
            setFormData({
              educationLevel: latest.level || "",
              university: latest.university || "",
              course: latest.course || "",
              specialization: latest.specialization || "",
              courseType: latest.course_type || "full-time",
              startYear: latest.start_year || "",
              endYear: latest.end_year || "",
              gradingSystem: latest.grading_system || "",
            })
          }
        }
      } catch (e) {}
      setLoading(false)
    }
    fetchLatest()
  }, [user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'education',
          data: {
            level: formData.educationLevel,
            university: formData.university,
            course: formData.course,
            specialization: formData.specialization,
            course_type: formData.courseType,
            start_date: formData.startYear,
            end_date: formData.endYear,
            grading_system: formData.gradingSystem,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update education');
      }

      const result = await response.json();

      onSave?.(formData)
    } catch (error) {
      console.error('Error updating education:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Education<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => handleSelectChange("educationLevel", value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                  <SelectItem value="post-graduation">Post Graduation/Masters</SelectItem>
                  <SelectItem value="graduation">Graduation/Bachelors</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="high-school">12th</SelectItem>
                  <SelectItem value="secondary">10th</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                University/Institute<span className="text-red-500">*</span>
              </Label>
              <Select value={formData.university} onValueChange={(value) => handleSelectChange("university", value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select university/institute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iit">Indian Institute of Technology (IIT)</SelectItem>
                  <SelectItem value="nit">National Institute of Technology (NIT)</SelectItem>
                  <SelectItem value="iiit">Indian Institute of Information Technology (IIIT)</SelectItem>
                  <SelectItem value="du">Delhi University</SelectItem>
                  <SelectItem value="jnu">Jawaharlal Nehru University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Course<span className="text-red-500">*</span>
              </Label>
              <Select value={formData.course} onValueChange={(value) => handleSelectChange("course", value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btech">B.Tech/B.E.</SelectItem>
                  <SelectItem value="mtech">M.Tech/M.E.</SelectItem>
                  <SelectItem value="bsc">B.Sc</SelectItem>
                  <SelectItem value="msc">M.Sc</SelectItem>
                  <SelectItem value="bca">BCA</SelectItem>
                  <SelectItem value="mca">MCA</SelectItem>
                  <SelectItem value="bba">BBA</SelectItem>
                  <SelectItem value="mba">MBA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Specialization<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => handleSelectChange("specialization", value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="ece">Electronics & Communication</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                  <SelectItem value="ce">Civil Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Course type<span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.courseType}
                onValueChange={(value) => handleRadioChange("courseType", value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-time" id="full-time-course" />
                  <Label htmlFor="full-time-course" className="text-gray-700">
                    Full time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="part-time" id="part-time-course" />
                  <Label htmlFor="part-time-course" className="text-gray-700">
                    Part time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="distance" id="distance-course" />
                  <Label htmlFor="distance-course" className="text-gray-700">
                    Correspondence/Distance learning
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Course duration<span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <Select value={formData.startYear} onValueChange={(value) => handleSelectChange("startYear", value)}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Starting year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <SelectItem key={i} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">To</span>
                  <Select value={formData.endYear} onValueChange={(value) => handleSelectChange("endYear", value)}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Ending year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i + 5
                        return (
                          <SelectItem key={i} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Grading system</Label>
              <Select
                value={formData.gradingSystem}
                onValueChange={(value) => handleSelectChange("gradingSystem", value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select grading system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="cgpa10">CGPA (Scale of 10)</SelectItem>
                  <SelectItem value="cgpa4">CGPA (Scale of 4)</SelectItem>
                  <SelectItem value="grade">Grade (A+/A/B+/B/C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
