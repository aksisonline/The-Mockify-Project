"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAddresses, upsertAddress } from "@/lib/profile-service"
import { useToast } from "@/hooks/use-toast"

// (removed, as useState is now imported above)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Flag, Building, Hash, Home, Globe, Map } from "lucide-react"

interface AddressFormProps {
  onSave: (data: any) => void
  onCancel: () => void
  initialData?: any
  userId: string
}

export function AddressForm({ onSave, onCancel, initialData = {}, userId }: AddressFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    addressline1: initialData.addressline1 || "",
    addressline2: initialData.addressline2 || "",
    country: initialData.country || "",
    state: initialData.state || "",
    city: initialData.city || "",
    zip_code: initialData.zip_code || "",
    is_indian: initialData.is_indian || false,
  })
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    // Only fetch from backend if initialData is empty (first time user)
    if ((!initialData || Object.keys(initialData).length === 0) && user?.id) {
      setLoading(true)
      getAddresses(user.id)
        .then((addresses) => {
          const latest = addresses && addresses.length > 0 ? addresses[0] : null
          if (latest) {
            setFormData({
              addressline1: latest.addressline1 || latest.address_line_1 || "",
              addressline2: latest.addressline2 || latest.address_line_2 || "",
              country: latest.country || "",
              state: latest.state || "",
              city: latest.city || "",
              zip_code: latest.zip_code || "",
              is_indian: latest.is_indian || false,
            })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [initialData, user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value === 'india' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Validate required fields
      if (!formData.addressline1 || !formData.country || !formData.state || !formData.city || !formData.zip_code) {
        toast(
          <div>
            <div className="font-semibold text-red-600">Missing Information</div>
            <div className="text-xs text-muted-foreground">Please fill in all required fields.</div>
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
          type: 'address',
          data: {
            id: initialData.id,
            addressline1: formData.addressline1,
            addressline2: formData.addressline2,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zip_code: formData.zip_code,
            is_indian: formData.is_indian
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update address');
      }

      const result = await response.json();

      toast(
        <div>
          <div className="font-semibold text-green-700">Success</div>
          <div className="text-xs text-muted-foreground">Address information updated successfully.</div>
        </div>
      );
      onSave(formData);
      onCancel(); // Close the form after successful save
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast(
        <div>
          <div className="font-semibold text-red-600">Error</div>
          <div className="text-xs text-muted-foreground">{error.message || "Failed to update address information."}</div>
        </div>
      );
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Address Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          {/* Location Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Location</h4>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Globe className="h-4 w-4 text-gray-500 mr-2" />
                  Current location<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <RadioGroup
                  value={formData.is_indian ? "india" : "outside-india"}
                  onValueChange={(value) => handleRadioChange("is_indian", value)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                    <RadioGroupItem value="india" id="india" />
                    <Label htmlFor="india" className="text-gray-700 cursor-pointer">
                      India
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
                    <RadioGroupItem value="outside-india" id="outside-india" />
                    <Label htmlFor="outside-india" className="text-gray-700 cursor-pointer">
                      Outside India
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Street Address Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Street Address</h4>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="addressline1" className="text-sm font-medium text-gray-700 flex items-center">
                    <Home className="h-4 w-4 text-gray-500 mr-2" />
                    Address Line 1<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="addressline1"
                    name="addressline1"
                    value={formData.addressline1}
                    onChange={handleInputChange}
                    placeholder="Enter your address line 1"
                    required
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.addressline1 || formData.addressline1 === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="addressline2" className="text-sm font-medium text-gray-700 flex items-center">
                    <Home className="h-4 w-4 text-gray-500 mr-2" />
                    Address Line 2
                  </Label>
                  <Input
                    id="addressline2"
                    name="addressline2"
                    value={formData.addressline2}
                    onChange={handleInputChange}
                    placeholder="Enter your address line 2"
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.addressline2 || formData.addressline2 === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Region Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Region</h4>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 flex items-center">
                    <Flag className="h-4 w-4 text-gray-500 mr-2" />
                    Country<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country"
                    required
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.country || formData.country === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700 flex items-center">
                    <Map className="h-4 w-4 text-gray-500 mr-2" />
                    State<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    required
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.state || formData.state === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                    City<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.city || formData.city === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700 flex items-center">
                    <Hash className="h-4 w-4 text-gray-500 mr-2" />
                    Zip Code<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setFormData(prev => ({ ...prev, zip_code: value }));
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter your zip code"
                    required
                    maxLength={6}
                    className="border-gray-300 focus:border-blue-500 h-11 transition-all duration-200"
                  />
                  {(!formData.zip_code || formData.zip_code === "") && (
                    <span className="text-gray-400 text-xs mt-1 block">-</span>
                  )}
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
      </CardContent>
    </Card>
  )
}
