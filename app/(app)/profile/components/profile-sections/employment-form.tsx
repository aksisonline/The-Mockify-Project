"use client"

import React, { useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Calendar, Building } from "lucide-react"
import { getLatestEmploymentRecord } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import debounce from "lodash/debounce"

const EmploymentFormSchema = z.object({
  isCurrentEmployment: z.string(),
  employmentType: z.string(),
  totalExperienceYears: z.string(),
  totalExperienceMonths: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  designation: z.string().min(1, "Designation is required"),
  joiningYear: z.string().min(1, "Joining year is required"),
  joiningMonth: z.string().min(1, "Joining month is required"),
  currentSalary: z.string().optional(),
  salaryFrequency: z.string(),
})

interface EmploymentFormValues {
  isCurrentEmployment: string;
  employmentType: string;
  totalExperienceYears: string;
  totalExperienceMonths: string;
  companyName: string;
  designation: string;
  joiningYear: string;
  joiningMonth: string;
  currentSalary: string;
  salaryFrequency: string;
}

interface EmploymentFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  initialData?: Partial<EmploymentFormValues>
  userId: string
}

export function EmploymentForm({ onSave, onCancel, initialData = {}, userId }: EmploymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Pre-compute default values
  const defaultValues = React.useMemo(() => ({
    isCurrentEmployment: typeof initialData?.isCurrentEmployment === 'string' ? initialData.isCurrentEmployment : "yes",
    employmentType: typeof initialData?.employmentType === 'string' ? initialData.employmentType : "full-time",
    totalExperienceYears: typeof initialData?.totalExperienceYears === 'string' ? initialData.totalExperienceYears : "0",
    totalExperienceMonths: typeof initialData?.totalExperienceMonths === 'string' ? initialData.totalExperienceMonths : "0",
    companyName: typeof initialData?.companyName === 'string' ? initialData.companyName : "",
    designation: typeof initialData?.designation === 'string' ? initialData.designation : "",
    joiningYear: typeof initialData?.joiningYear === 'string' ? initialData.joiningYear : "",
    joiningMonth: typeof initialData?.joiningMonth === 'string' ? initialData.joiningMonth : "",
    currentSalary: typeof initialData?.currentSalary === 'string' ? initialData.currentSalary : "",
    salaryFrequency: typeof initialData?.salaryFrequency === 'string' ? initialData.salaryFrequency : "Yearly",
  }), [initialData])

  const form = useForm<EmploymentFormValues>({
    resolver: zodResolver(EmploymentFormSchema),
    mode: "onChange",
    defaultValues,
    shouldFocusError: false,
    shouldUnregister: false,
  })

  // Debounced validation with cleanup
  const debouncedValidate = React.useCallback(
    debounce(() => {
      if (isInitialized) {
        form.trigger()
      }
    }, 300),
    [form, isInitialized]
  )

  // Optimized input handlers with initialization check
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value
    field.onChange(value)
    if (isInitialized) {
      debouncedValidate()
    }
  }, [debouncedValidate, isInitialized])

  const handleSelectChange = React.useCallback((value: string, field: any) => {
    field.onChange(value)
    if (isInitialized) {
      debouncedValidate()
    }
  }, [debouncedValidate, isInitialized])

  // Initialize form data
  React.useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      setLoading(true)
      getLatestEmploymentRecord(userId)
        .then((latest) => {
          if (latest) {
            form.reset({
              isCurrentEmployment: latest.is_current_employment || "yes",
              employmentType: latest.employment_type || "full-time",
              totalExperienceYears: latest.total_experience_years?.toString() || "0",
              totalExperienceMonths: latest.total_experience_months?.toString() || "0",
              companyName: latest.company_name || "",
              designation: latest.designation || "",
              joiningYear: latest.joining_year || "",
              joiningMonth: latest.joining_month || "",
              currentSalary: latest.current_salary || "",
              salaryFrequency: latest.salary_frequency || "Yearly",
            })
          }
        })
        .finally(() => {
          setLoading(false)
          setIsInitialized(true)
        })
    } else {
      setIsInitialized(true)
    }
  }, [initialData, userId, form])

  // Cleanup debounced function
  React.useEffect(() => {
    return () => {
      debouncedValidate.cancel()
    }
  }, [debouncedValidate])

  const onSubmit = async (data: EmploymentFormValues) => {
    setLoading(true)
    try {

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'employment',
          data: {
            is_current_employment: data.isCurrentEmployment,
            employment_type: data.employmentType,
            total_experience_years: data.totalExperienceYears,
            total_experience_months: data.totalExperienceMonths,
            company_name: data.companyName,
            designation: data.designation,
            joining_year: data.joiningYear,
            joining_month: data.joiningMonth,
            current_salary: data.currentSalary,
            salary_frequency: data.salaryFrequency,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update employment')
      }

      const result = await response.json()

      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Employment information updated successfully.</div>
        </div>
      )
      onSave(data)
      onCancel()
    } catch (error: any) {
      console.error('Error updating employment:', error)
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{error.message || "Failed to update employment information."}</div>
        </div>
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl font-medium flex items-center gap-2 text-gray-900">Professional Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gray-50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
            {/* Current Employment Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Employment Status</h4>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="isCurrentEmployment"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">Is this your current employment?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="yes" id="current-yes" />
                            <Label htmlFor="current-yes" className="text-gray-700 cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="no" id="current-no" />
                            <Label htmlFor="current-no" className="text-gray-700 cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">Employment type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="full-time" id="full-time" />
                            <Label htmlFor="full-time" className="text-gray-700 cursor-pointer">Full-time</Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="internship" id="internship" />
                            <Label htmlFor="internship" className="text-gray-700 cursor-pointer">Internship</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Experience Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Experience Details</h4>
              <div className="space-y-5">
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    Total experience<span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalExperienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 h-11">
                                <SelectValue placeholder="Years" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 30 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i} {i === 1 ? "year" : "years"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalExperienceMonths"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 h-11">
                                <SelectValue placeholder="Months" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i} {i === 1 ? "month" : "months"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Company Details</h4>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        Company Name<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleInputChange(e, field)}
                          placeholder="Enter your company name"
                          className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                        Designation<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleInputChange(e, field)}
                          placeholder="Enter your designation"
                          className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    Joining date<span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="joiningYear"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 h-11">
                                <SelectValue placeholder="Select Year" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="joiningMonth"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 h-11">
                                <SelectValue placeholder="Select Month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                              ].map((month, index) => (
                                <SelectItem key={index} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Salary Details</h4>
              <div className="space-y-5">
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    Current salary
                  </FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentSalary"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <span className="inline-block w-8 text-lg font-bold text-gray-700">₹</span>
                            <FormControl>
                              <Input
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '')
                                  field.onChange(value)
                                  if (isInitialized) {
                                    debouncedValidate()
                                  }
                                }}
                                onKeyPress={(e) => {
                                  if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault()
                                  }
                                }}
                                placeholder="Enter amount"
                                className="flex-1 border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salaryFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={(value) => handleSelectChange(value, field)}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 h-11">
                                <SelectValue placeholder="Frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yearly">Per Year</SelectItem>
                              <SelectItem value="Monthly">Per Month</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6 h-11 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 shadow-sm hover:shadow transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
