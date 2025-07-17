"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  Flag,
  Building,
  Hash,
  Smartphone,
  AtSign,
  Clock,
  Pencil,
  Award,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Phone,
} from "lucide-react"
import { motion } from "framer-motion"
import { ProfileCard } from "../components/profile-sections/profile-card"
import { useMediaQuery } from "@/hooks/use-mobile"
import React from "react"

export default function TabbedLayout({
  formData,
  handleInputChange,
  handleRadioChange,
  handleSelectChange,
  handleSave,
  onEditSection,
}: any) {
  const [editMode, setEditMode] = useState(false)
  const [editTab, setEditTab] = useState("personal")
  const [activeTab, setActiveTab] = useState("personal")
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")



  return (
    <div className="min-h-screen">
      <div className="container pb-8 px-0">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <ProfileCard
            formData={formData}
            onEdit={() => (onEditSection ? onEditSection("basic") : setEditMode(true))}
            style="modern"
          />
        </motion.div>

        {/* Main Content - Tabbed Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 md:mt-8"
        >
          <Card className="border-blue-100 shadow-sm overflow-hidden rounded-xl">
            <CardContent className="p-0">
              <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList
                  className={`w-full grid grid-cols-3 rounded-none bg-white border-b border-blue-100 p-0 h-auto ${isMobile ? "text-xs" : ""}`}
                >
                  <TabsTrigger
                    value="personal"
                    className="py-3 md:py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 transition-all duration-200"
                  >
                    <User className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Personal</span> <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="py-3 md:py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 transition-all duration-200"
                  >
                    <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Professional</span> <span className="sm:hidden">Pro</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="address"
                    className="py-3 md:py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 transition-all duration-200"
                  >
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Address</span> <span className="sm:hidden">Addr</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="p-0 bg-white">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="p-4 md:p-6 border-b border-blue-200 bg-blue-50 flex flex-row justify-between items-center shadow-sm">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                        <User className="h-4 md:h-5 w-4 md:w-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 md:h-9 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none hover:shadow-md transition-all duration-200 rounded-full flex items-center gap-1.5 px-3 md:px-4 relative overflow-hidden group focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5"
                        onClick={() => (onEditSection ? onEditSection("basic") : setEditMode(true))}
                      >
                        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                        <Pencil className="h-3 md:h-3.5 w-3 md:w-3.5 text-white group-hover:animate-wiggle" />
                        <span className="font-medium text-xs md:text-sm">Edit</span>
                      </Button>
                    </div>

                    <div className="p-4 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-6 md:gap-y-8">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.fullName}</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                          <div className="flex items-center">
                            <AtSign className="h-4 w-4 mr-2 text-blue-500" />
                            <p className="text-gray-800 font-medium text-base md:text-lg flex items-center gap-2">
                              {showEmail ? formData.email : <span>•••••••••••••••</span>}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full hover:bg-blue-50"
                                onClick={() => setShowEmail(!showEmail)}
                              >
                                {showEmail ? (
                                  <EyeOff className="h-3.5 w-3.5 text-blue-500" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                                )}
                              </Button>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            <p className="text-gray-800 font-medium text-base md:text-lg flex items-center gap-2">
                              {showPhone ? (
                                formData.phoneCode && formData.phoneNumber ? 
                                  `${formData.phoneCode} ${formData.phoneNumber}` : 
                                  <span className="text-gray-400">Not provided</span>
                              ) : (
                                <span>••••••</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full hover:bg-blue-50"
                                onClick={() => setShowPhone(!showPhone)}
                              >
                                {showPhone ? (
                                  <EyeOff className="h-3.5 w-3.5 text-blue-500" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                                )}
                              </Button>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <p className="text-gray-800 font-medium text-base md:text-lg">
                              {formData.dob ? new Date(formData.dob).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }) : <span className="text-gray-400">Not specified</span>}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Gender</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">
                            {formData.gender ? (formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)) : <span className="text-gray-400">Not specified</span>}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Work Status</Label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                            <p className="text-gray-800 font-medium text-base md:text-lg">
                              {formData.work_status === "experienced" ? "Experienced" : "Fresher"}
                            </p>
                          </div>
                        </div>

                        {formData.work_status === "experienced" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500">Total Experience</Label>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              <p className="text-gray-800 font-medium text-base md:text-lg">
                                {formData.totalExperienceYears || "0"} Years {formData.totalExperienceMonths || "0"}{" "}
                                Months
                              </p>
                            </div>
                          </div>
                        )}

                        {/* <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Current Location</Label>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <p className="text-gray-800 font-medium text-base md:text-lg">
                              {formData.city || formData.state ? `${formData.city || <span className="text-gray-400">Not specified</span>}, ${formData.state || <span className="text-gray-400">Not specified</span>}` : <span className="text-gray-400">Not specified</span>}
                            </p>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="professional" className="p-0 bg-white">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="p-4 md:p-6 border-b border-blue-200 bg-blue-50 flex flex-row justify-between items-center shadow-sm">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                        <Briefcase className="h-4 md:h-5 w-4 md:w-5 mr-2 text-blue-600" />
                        Professional Information
                      </h3>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 md:h-9 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none hover:shadow-md transition-all duration-200 rounded-full flex items-center gap-1.5 px-3 md:px-4 relative overflow-hidden group focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5"
                        onClick={() => (onEditSection ? onEditSection("employment") : setEditMode(true))}
                      >
                        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                        <Pencil className="h-3 md:h-3.5 w-3 md:w-3.5 text-white group-hover:animate-wiggle" />
                        <span className="font-medium text-xs md:text-sm">Edit</span>
                      </Button>
                    </div>

                    <div className="p-4 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-6 md:gap-y-8 mb-6 md:mb-10">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.companyName || <span className="text-gray-400">Not specified</span>}</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Designation</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.designation || <span className="text-gray-400">Not specified</span>}</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Employment Status</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">
                            {formData.isCurrentEmployment === "yes" ? "Current Employment" : "Previous Employment"} • {formData.employmentType === "full-time" ? "Full-time" : "Internship"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Experience</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">
                            {formData.totalExperienceYears} years {formData.totalExperienceMonths} months
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Joining Date</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">
                            {formData.joiningMonth && formData.joiningYear ? 
                              `${formData.joiningMonth}/${formData.joiningYear}` : 
                              <span className="text-gray-400">Not specified</span>
                            }
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500">Current Salary</Label>
                          <p className="text-gray-800 font-medium text-base md:text-lg">
                            {formData.currentSalary ? 
                              `${formData.currentSalary} (${formData.salaryFrequency})` : 
                              <span className="text-gray-400">Not provided</span>
                            }
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-blue-100 pt-6 md:pt-8">
                        <div className="flex flex-row justify-between items-center mb-4 md:mb-6">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                            <Award className="h-4 md:h-5 w-4 md:w-5 mr-2 text-blue-600" />
                            Certifications
                          </h3>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 md:h-9 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none hover:shadow-md transition-all duration-200 rounded-full flex items-center gap-1.5 px-3 md:px-4 relative overflow-hidden group focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5"
                            onClick={() => (onEditSection ? onEditSection("certification") : setEditMode(true))}
                          >
                            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                            <Plus className="h-3 md:h-3.5 w-3 md:w-3.5 text-white group-hover:animate-wiggle" />
                            <span className="font-medium text-xs md:text-sm">Add</span>
                          </Button>
                        </div>

                        {formData.certifications && formData.certifications.filter(
                          (cert: any) => cert && (cert.certification_name || cert.name || cert.completion_id || cert.completionId)
                        ).length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.certifications.filter(
                              (cert: any) => cert && (cert.certification_name || cert.name || cert.completion_id || cert.completionId)
                            ).map((cert: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 md:p-5 border border-blue-100 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-blue-700">{cert.certification_name || cert.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-700 border-0">{cert.validity || cert.valid_until || cert.endYear || "Valid"}</Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch('/api/profile', {
                                            method: 'PUT',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                              type: 'certification',
                                              data: {
                                                completion_id: cert.completion_id || cert.completionId,
                                                delete: true
                                              }
                                            })
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to delete certification');
                                          }

                                          // Refresh the profile data by triggering a re-render
                                          if (onEditSection) {
                                            onEditSection('refresh');
                                          }
                                        } catch (error) {
                                          console.error('Error deleting certification:', error);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {cert.completion_id || cert.completionId ? (
                                  <p className="text-sm text-gray-600 mt-2">ID: {cert.completion_id || cert.completionId}</p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 md:py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <Award className="h-12 md:h-16 w-12 md:w-16 mx-auto text-gray-300 mb-3" />
                            <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1">
                              No certifications added yet
                            </h3>
                            <p className="text-gray-500 mb-4">Showcase your skills with professional certifications</p>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
                              onClick={() => (onEditSection ? onEditSection("certification") : setEditMode(true))}
                            >
                              <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                              <Plus className="h-3.5 md:h-4 w-3.5 md:w-4 mr-1.5 group-hover:animate-wiggle" />
                              Add Certification
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="address" className="p-0 bg-white">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="p-4 md:p-6 border-b border-blue-200 bg-blue-50 flex flex-row justify-between items-center shadow-sm">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                        <MapPin className="h-4 md:h-5 w-4 md:w-5 mr-2 text-blue-600" />
                        Address Information
                      </h3>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 md:h-9 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none hover:shadow-md transition-all duration-200 rounded-full flex items-center gap-1.5 px-3 md:px-4 relative overflow-hidden group focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5"
                        onClick={() => (onEditSection ? onEditSection("address") : setEditMode(true))}
                      >
                        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                        <Pencil className="h-3 md:h-3.5 w-3 md:w-3.5 text-white group-hover:animate-wiggle" />
                        <span className="font-medium text-xs md:text-sm">Edit</span>
                      </Button>
                    </div>

                    <div className="p-4 md:p-8">
                      <div className="p-4 md:p-5 bg-blue-50/50 rounded-xl border border-blue-100 mb-6 md:mb-8">
                        <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3 md:mb-4">Mailing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-3 md:gap-y-4">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-500">Address Line 1</Label>
                            <p className="text-gray-800 font-medium">{formData.addressline1 || <span className="text-gray-400">—</span>}</p>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-500">Address Line 2</Label>
                            <p className="text-gray-800 font-medium">{formData.addressline2 || <span className="text-gray-400">—</span>}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="p-3 md:p-4 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Flag className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-500">Country</Label>
                          </div>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.country || <span className="text-gray-400">—</span>}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-500">State</Label>
                          </div>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.state || <span className="text-gray-400">—</span>}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Building className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-500">City</Label>
                          </div>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.city || <span className="text-gray-400">—</span>}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Hash className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-500">Zip Code</Label>
                          </div>
                          <p className="text-gray-800 font-medium text-base md:text-lg">{formData.zip_code || <span className="text-gray-400">—</span>}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile Dialog */}
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white p-0 border-blue-100 rounded-xl">
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6 rounded-t-xl">
              <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Pencil className="h-4 md:h-5 w-4 md:w-5" />
                Edit Profile
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="personal" className="p-4 md:p-6" value={editTab} onValueChange={setEditTab}>
              <TabsList className="grid grid-cols-3 mb-4 md:mb-6 bg-blue-50 rounded-lg p-1">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1 rounded-md py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Personal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1 rounded-md py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Professional</span>
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1 rounded-md py-1.5 md:py-2 text-xs md:text-sm"
                >
                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Address</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 p-1">
                {/* Personal edit form fields */}
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 p-1">
                {/* Professional edit form fields */}
              </TabsContent>

              <TabsContent value="address" className="space-y-4 p-1">
                {/* Address edit form fields */}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 bg-gray-50 border-t border-blue-100 rounded-b-xl gap-3">
              <div className="flex items-center text-sm text-blue-700 w-full sm:w-auto justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-1.5 text-blue-600"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5 2 0 3 1.5 3 3 0 1-1 2-3 3-2 1-3 2-3 3 0 .5 0 1 .5 1.5" />
                </svg>
                <span className="font-medium">100 Coins</span>
              </div>

              <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 active:scale-95 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 transform hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
                    Save Changes
                  </Button>
                </motion.div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Add this to your globals.css or as a style tag
const AnimationStyle = () => (
  <style jsx global>{`
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
    .animate-wiggle {
      animation: wiggle 0.3s ease-in-out;
    }
  `}</style>
)

export { AnimationStyle }
