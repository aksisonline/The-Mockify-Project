"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getBasicDetails } from "@/lib/profile-service"

const BasicDetailsFormSchema = z.object({
  full_name: z.string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Name should only contain alphabets and spaces.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone_code: z.string().regex(/^\+[0-9]{1,4}$/, {
    message: "Please enter a valid country code (e.g., +91)",
  }),
  phone_number: z.string()
    .min(10, {
      message: "Phone number must be at least 10 digits.",
    })
    .max(10, {
      message: "Phone number must not exceed 10 digits.",
    })
    .regex(/^[0-9]+$/, {
      message: "Phone number must contain only digits.",
    }),
  work_status: z.string().nullable(),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  dob: z.string().min(1, {
    message: "Please select a date of birth.",
  }),
})

type BasicDetailsFormValues = z.infer<typeof BasicDetailsFormSchema>

interface ProfileDetails {
  full_name: string | null;
  email: string | null;
  phone_code: string | null;
  phone_number: string | null;
  gender: string | null;
  dob: string | null;
  employment: Array<{
    work_status: string | null;
  }> | null;
}

interface BasicDetailsFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  initialData?: {
    fullName?: string
    email?: string
    phoneCode?: string
    phoneNumber?: string
    work_status?: string | null
    gender?: string
    dob?: string
    designation?: string
    companyName?: string
  }
  userId: string
}

export function BasicDetailsForm({ onSave, onCancel, initialData = {}, userId }: BasicDetailsFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const form = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(BasicDetailsFormSchema),
    defaultValues: {
      full_name: initialData.fullName || "",
      email: initialData.email || "",
      phone_code: initialData.phoneCode || "+91",
      phone_number: initialData.phoneNumber || "",
      work_status: initialData.work_status || null,
      gender: initialData.gender || "",
      dob: initialData.dob || "",
    },
  })

  // Fetch basic details from backend if initialData is empty
  React.useEffect(() => {
    if ((!initialData || Object.keys(initialData).length === 0) && user?.id) {
      setLoading(true)
      getBasicDetails(user.id)
        .then((details: any) => {
          if (details) {

            // Get work status from employment data if available
            const employment = Array.isArray(details.employment) ? details.employment[0] : null;
            const workStatus = employment?.work_status || null;
            
            // Set form values directly from the API response
            const formValues = {
              full_name: details.full_name || "",
              email: details.email || "",
              phone_code: details.phone_code || "+91",
              phone_number: details.phone_number || "",
              work_status: workStatus,
              gender: details.gender || "",
              dob: details.dob || "",
            };

            form.reset(formValues);
          }
        })
        .catch(error => {
          console.error('Error fetching details:', error);
          toast({
            title: "Error",
            description: "Failed to load profile details.",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false))
    }
  }, [initialData, user?.id, form, toast])

  // Sync form with initialData when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {

      const formValues = {
        full_name: initialData.fullName || "",
        email: initialData.email || "",
        phone_code: initialData.phoneCode || "+91",
        phone_number: initialData.phoneNumber || "",
        work_status: initialData.work_status || null,
        gender: initialData.gender || "",
        dob: initialData.dob || "",
      };

      form.reset(formValues);
    }
  }, [initialData, form])

  const onSubmit = async (data: BasicDetailsFormValues) => {
    try {
      setLoading(true)

      
      // First update basic profile details
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'basic_details',
          data: {
            full_name: data.full_name,
            email: data.email,
            phone_code: data.phone_code,
            phone_number: data.phone_number,
            gender: data.gender,
            dob: data.dob,
          }
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Then update work status in employment table
      const employmentResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'employment',
          data: {
            work_status: data.work_status || null,
          }
        }),
      });

      if (!employmentResponse.ok) {
        const errorData = await employmentResponse.json();
        throw new Error(errorData.error || 'Failed to update employment status');
      }

      const result = await profileResponse.json();

      toast({
        title: "Success",
        description: "Profile information updated successfully.",
      });
      onSave(data);
      onCancel(); // Close the form after successful save
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <CardTitle className="text-xl font-medium flex items-center gap-2 text-gray-900">Personal Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-gray-50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
            {/* Personal Information Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Personal Information</h4>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        Name<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          className="border-gray-300 focus:border-blue-500 transition-all duration-200 h-11"
                          onKeyPress={(e) => {
                            // Only allow alphabets and spaces
                            if (!/^[A-Za-z\s]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            // Remove any non-alphabetic characters that might have been pasted
                            const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        Gender<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 h-11">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        Date of Birth<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="border-gray-300 focus:border-blue-500 transition-all duration-200 h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {(initialData.designation || initialData.companyName) && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                    <p className="text-gray-700 font-medium mb-1">
                      {initialData.designation && initialData.companyName 
                        ? `${initialData.designation} at ${initialData.companyName}`
                        : initialData.designation || initialData.companyName || "Employment not specified"
                      }
                    </p>
                    <p className="text-sm text-blue-600">
                      To edit go to Employment section.
                      <br />
                      Please remove your current employment if you want to mark yourself as fresher
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Work Status Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Work Status</h4>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="work_status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">Work status</FormLabel>
                      <p className="text-sm text-gray-500">We will personalize your mockify experience based on this</p>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="fresher" id="fresher" />
                            <Label htmlFor="fresher" className="text-gray-700 cursor-pointer">
                              Fresher
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <RadioGroupItem value="experienced" id="experienced" />
                            <Label htmlFor="experienced" className="text-gray-700 cursor-pointer">
                              Experienced
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Information</h4>
              <div className="space-y-6">
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    Mobile number<span className="text-red-500 ml-0.5">*</span>
                  </FormLabel>
                  <p className="text-sm text-gray-500">Recruiters will contact you on this number</p>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="phone_code"
                      render={({ field }) => {
                    
                        return (
                          <FormItem className="w-20">
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="+91"
                                className="border-gray-300 h-11 text-center"
                                value={field.value || "+91"}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Ensure the value starts with +
                                  if (!value.startsWith('+')) {
                                    value = '+' + value;
                                  }
                                  // Remove any non-digit characters except +
                                  value = value.replace(/[^\d+]/g, '');
                                  // Limit to 5 characters (including +)
                                  value = value.slice(0, 5);
                                
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-500 whitespace-nowrap" />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => {
                       
                        return (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="123456789"
                                className="border-gray-300 focus:border-blue-500 h-11"
                                value={field.value || ""}
                                onKeyPress={(e) => {
                                  if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                              
                                  field.onChange(value);
                                }}
                                maxLength={10}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-500" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                        Email address<span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <p className="text-sm text-gray-500">We will send relevant jobs and updates to this email</p>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@email.com"
                          className="border-gray-300 focus:border-blue-500 h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
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
