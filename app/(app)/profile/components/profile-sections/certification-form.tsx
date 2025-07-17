"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Award, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getLatestCertificationRecord, addCertificationIfChanged, deleteCertification } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/file-service"

interface CertificationFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  initialData?: any
}

export function CertificationForm({ onSave, onCancel, initialData = {} }: CertificationFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    certificationName: initialData.certificationName || "",
    completionId: initialData.completionId || "",
    startMonth: initialData.startMonth || "",
    startYear: initialData.startYear || "",
    endMonth: initialData.endMonth || "",
    endYear: initialData.endYear || "",
    doesNotExpire: initialData.doesNotExpire || false,
    url: initialData.url || "",
  })
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  React.useEffect(() => {
    // Only fetch from backend if editing (e.g., initialData has an id)
    if (initialData && initialData.id && user?.id) {
      setLoading(true)
      getLatestCertificationRecord(user.id)
        .then((latest) => {
          if (latest) {
            setFormData({
              certificationName: latest.name || "",
              completionId: latest.completion_id || "",
              startMonth: latest.start_month || "",
              startYear: latest.start_year || "",
              endMonth: latest.end_month || "",
              endYear: latest.end_year || "",
              doesNotExpire: latest.does_not_expire || false,
              url: latest.url || "",
            })
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false);
    }
  }, [initialData, user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, doesNotExpire: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.certificationName || !formData.completionId || !formData.startYear) {
        toast(
          <div>
            <div className="font-semibold text-red-600">Missing Information</div>
            <div className="text-xs text-muted-foreground">Please fill in all required fields.</div>
          </div>
        );
        setLoading(false);
        return;
      }

      // If not doesNotExpire, validate end date
      if (!formData.doesNotExpire && (!formData.endMonth || !formData.endYear)) {
        toast(
          <div>
            <div className="font-semibold text-red-600">Missing Information</div>
            <div className="text-xs text-muted-foreground">End date is required unless certification does not expire.</div>
          </div>
        );
        setLoading(false);
        return;
      }


      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'certification',
          data: formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update certification');
      }

      const result = await response.json();
  
      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Certification information updated successfully.</div>
        </div>
      );
      onSave(formData);
      onCancel();
    } catch (error: any) {
      console.error('Error updating certification:', error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{error.message || "Failed to update certification information."}</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'certification',
          data: {
            completion_id: formData.completionId,
            delete: true
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete certification');
      }

      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Certification deleted successfully.</div>
        </div>
      );
      onSave({ deleted: true });
      onCancel();
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{error.message || "Failed to delete certification."}</div>
        </div>
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const { url } = await uploadFile(file);
      
      setFormData(prev => ({
        ...prev,
        url
      }));

      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Certificate uploaded successfully</div>
        </div>
      );
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{error.message || "Failed to upload certificate"}</div>
        </div>
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // Sync formData with initialData when initialData changes
  React.useEffect(() => {
    setFormData({
      certificationName: initialData.certificationName || "",
      completionId: initialData.completionId || "",
      startMonth: initialData.startMonth || "",
      startYear: initialData.startYear || "",
      endMonth: initialData.endMonth || "",
      endYear: initialData.endYear || "",
      doesNotExpire: initialData.doesNotExpire || false,
      url: initialData.url || "",
    })
  }, [initialData])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          Certifications
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          {/* Certification Details Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Certification Details</h4>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="certificationName" className="text-sm font-medium text-gray-700 flex items-center">
                  <Award className="h-4 w-4 text-blue-500 mr-2" />
                  Certification name<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="certificationName"
                  name="certificationName"
                  value={formData.certificationName}
                  onChange={handleInputChange}
                  placeholder="Please enter your certification name"
                  required
                  className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200 hover:border-blue-400"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="completionId" className="text-sm font-medium text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 9h10" />
                    <path d="M7 13h10" />
                    <path d="M7 17h4" />
                  </svg>
                  Certification completion ID<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="completionId"
                  name="completionId"
                  value={formData.completionId}
                  onChange={handleInputChange}
                  placeholder="Please mention your course completion ID"
                  className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200 hover:border-blue-400"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="url" className="text-sm font-medium text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Certificate
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="url"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="flex-1 border-gray-300 focus:border-blue-500 h-11 transition-all duration-200 hover:border-blue-400"
                    disabled={uploadLoading}
                  />
                  {uploadLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Validity Period Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Validity Period</h4>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Certification validity
                </Label>
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.startMonth}
                      onValueChange={(value) => handleSelectChange("startMonth", value)}
                    >
                      <SelectTrigger className="border-gray-300 w-[80px] h-11 transition-all duration-200 hover:border-blue-400">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1
                          return (
                            <SelectItem key={i} value={month.toString().padStart(2, "0")}>
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.startYear}
                      onValueChange={(value) => handleSelectChange("startYear", value)}
                    >
                      <SelectTrigger className="border-gray-300 w-[100px] h-11 transition-all duration-200 hover:border-blue-400">
                        <SelectValue placeholder="YYYY" />
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

                  <span className="text-gray-500 px-1 font-medium">To</span>

                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.endMonth}
                      onValueChange={(value) => handleSelectChange("endMonth", value)}
                      disabled={formData.doesNotExpire}
                    >
                      <SelectTrigger
                        className={`border-gray-300 w-[80px] h-11 transition-all duration-200 ${!formData.doesNotExpire && "hover:border-blue-400"} ${formData.doesNotExpire && "opacity-50"}`}
                      >
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1
                          return (
                            <SelectItem key={i} value={month.toString().padStart(2, "0")}>
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.endYear}
                      onValueChange={(value) => handleSelectChange("endYear", value)}
                      disabled={formData.doesNotExpire}
                    >
                      <SelectTrigger
                        className={`border-gray-300 w-[100px] h-11 transition-all duration-200 ${!formData.doesNotExpire && "hover:border-blue-400"} ${formData.doesNotExpire && "opacity-50"}`}
                      >
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => {
                          const year = new Date().getFullYear() + i
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

                <div className="flex items-center space-x-2 mt-2 ml-1">
                  <Checkbox
                    id="doesNotExpire"
                    checked={formData.doesNotExpire}
                    onCheckedChange={handleCheckboxChange}
                    className="text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="doesNotExpire" className="text-sm text-gray-700 cursor-pointer">
                    This certification does not expire
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-6 transition-all duration-200 hover:bg-gray-50"
              disabled={loading || uploadLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading || uploadLoading}
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
          {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
        </form>
      </CardContent>
    </Card>
  )
}
