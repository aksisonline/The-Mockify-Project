"use client";

import React from "react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useSearchParams, useRouter } from "next/navigation";
import TabbedLayout from "./styles/tabbed-layout";
import { BasicDetailsForm } from "./components/profile-sections/basic-details-form";
import { EmploymentForm } from "./components/profile-sections/employment-form";
import { EducationForm } from "./components/profile-sections/education-form";
import { CertificationForm } from "./components/profile-sections/certification-form";
import { AddressForm } from "./components/profile-sections/address-form";
import { ProfileLoadingSkeleton } from "./components/profile-loading-skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import ContentWrapper from "@/components/ContentWrapper";
import AppHeader from "@/components/ui/AppHeader";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // SWR for profile with proper loading handling
  const { data, error, isLoading: profileLoading, mutate } = useSWR(
    user ? "/api/profile" : null, // Only fetch if we have a user
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Prevent too frequent refetches
    }
  );
  const profile = data?.profile;

  // Initial form data state
  const [formData, setFormData] = useState(() => profile ? mapProfileToFormData(profile) : {
    // Basic Details
    fullName: "",
    email: "",
    phoneCode: "+91",
    phoneNumber: "",
    gender: "",
    dob: "",
    work_status: "",
    totalExperienceYears: "",
    totalExperienceMonths: "",
    currentSalary: "",
    country: "",
    city: "",
    // Employment
    companyName: "",
    designation: "",
    employmentType: "full-time",
    isCurrentEmployment: "yes",
    experienceYears: "",
    experienceMonths: "",
    joiningYear: "",
    joiningMonth: "",
    noticePeriod: "",
    expectedSalary: "",
    salaryFrequency: "yearly",
    // Education
    educationLevel: "",
    university: "",
    course: "",
    specialization: "",
    courseType: "full-time",
    startYear: "",
    endYear: "",
    gradingSystem: "",
    // Address
    addressline1: "",
    addressline2: "",
    state: "",
    zip_code: "",
    location: "",
    is_indian: false,
    // Certifications
    certifications: [],
    // Social
    linkedin: "",
    twitter: "",
    facebook: "",
    // Other
    is_public: false,
    avc_id: "Not assigned",
    avatar_url: "",
    has_business_card: false,
    id: "",
    updated_at: "",
  });

  // Update formData when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData(mapProfileToFormData(profile));
    }
  }, [profile]);

  // Show loading state if either auth or profile is loading
  if (authLoading || profileLoading) {
    return <ProfileLoadingSkeleton />;
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  // Show error if profile fetch failed
  if (error) {
    return (
      <ContentWrapper>
        <div className="w-full mx-auto p-4 bg-gray-50 min-h-screen">
          <div className="text-center py-8 text-red-500">
            Failed to load profile. Please try again later.
          </div>
        </div>
      </ContentWrapper>
    );
  }

  // Helper to map backend profile to formData shape
  function mapProfileToFormData(profile: any) {
    const employmentList = profile.employment || [];
    const mostRecentEmployment = employmentList
      .slice()
      .sort((a: { updated_at: string }, b: { updated_at: string }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] || {};
    // Get the latest address (if any)
    const latestAddress = Array.isArray(profile.addresses) && profile.addresses.length > 0
      ? profile.addresses[0]
      : {};
    return {
      // Basic Details
      fullName: profile.full_name || "",
      email: profile.email || "",
      phoneCode: profile.phone_code || "+91",
      phoneNumber: profile.phone_number || "",
      gender: profile.gender || "",
      dob: profile.dob || "",
      work_status: mostRecentEmployment.work_status || "",
      totalExperienceYears: mostRecentEmployment.total_experience_years?.toString() || "",
      totalExperienceMonths: mostRecentEmployment.total_experience_months?.toString() || "",
      currentSalary: mostRecentEmployment.current_salary || "",
      country: latestAddress.country || "",
      city: latestAddress.city || "",
      // Employment
      companyName: mostRecentEmployment.company_name || "",
      designation: mostRecentEmployment.designation || "",
      employmentType: mostRecentEmployment.employment_type || "full-time",
      isCurrentEmployment: mostRecentEmployment.is_current_employment ? "yes" : "no",
      experienceYears: mostRecentEmployment.total_experience_years?.toString() || "",
      experienceMonths: mostRecentEmployment.total_experience_months?.toString() || "",
      joiningYear: mostRecentEmployment.joining_year || "",
      joiningMonth: mostRecentEmployment.joining_month || "",
      noticePeriod: mostRecentEmployment.notice_period || "",
      expectedSalary: mostRecentEmployment.expected_salary || "",
      salaryFrequency: mostRecentEmployment.salary_frequency || "yearly",
      // Education
      educationLevel: profile.education?.[0]?.education_level || "",
      university: profile.education?.[0]?.university || "",
      course: profile.education?.[0]?.course || "",
      specialization: profile.education?.[0]?.specialization || "",
      courseType: profile.education?.[0]?.course_type || "full-time",
      startYear: profile.education?.[0]?.start_year || "",
      endYear: profile.education?.[0]?.end_year || "",
      gradingSystem: profile.education?.[0]?.grading_system || "",
      // Address (always camelCase for UI)
      addressline1: latestAddress.addressline1 || "",
      addressline2: latestAddress.addressline2 || "",
      state: latestAddress.state || "",
      zip_code: latestAddress.zip_code || "",
      location: latestAddress.location || "",
      is_indian: latestAddress.is_indian ?? false,
      // Misc
      certifications: profile.certifications || [],
      is_public: profile.is_public || false,
      // Social
      linkedin: profile.linkedin || "",
      twitter: profile.twitter || "",
      facebook: profile.facebook || "",
      // Other
      avc_id: profile.avc_id || "Not assigned",
      avatar_url: profile.avatar_url || "",
      has_business_card: typeof profile.has_business_card === 'boolean' ? profile.has_business_card : false,
      id: profile.id || user?.id || "",
      updated_at: profile.updated_at || "",
    };
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await mutate(); // revalidate SWR cache

    } catch (error) {

    }
  };

  function isPlainObject(val: any): val is Record<string, any> {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  const handleFormSave = async (sectionData: any) => {
    let flatData = { ...sectionData };
    const sectionValue = Object.values(sectionData)[0];
    if (
      Object.keys(sectionData).length === 1 &&
      isPlainObject(sectionValue)
    ) {
      flatData = { ...sectionValue };
    }

    // If this is an address or employment update, don't update the profile here
    if (
      isPlainObject(flatData) &&
      (flatData.addressline1 || flatData.addressline2 || flatData.zip_code || flatData.designation || flatData.companyName)
    ) {
      // These updates are handled by their own form component directly
      return;
    }

    if (user) {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, ...flatData }),
        });
        await mutate();
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  const renderProfileStyle = () => {
    return (
      <TabbedLayout
        formData={formData}
        handleInputChange={handleInputChange}
        handleRadioChange={handleRadioChange}
        handleSelectChange={handleSelectChange}
        handleSave={handleSave}
        onEditSection={setActiveForm}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <ContentWrapper>
      <AppHeader title="Profile" subtitle="Manage your personal and professional information" />
      <div className="max-w-7xl mx-auto">
        {renderProfileStyle()}

        {/* Form Dialogs */}
        <Dialog
          open={activeForm === "basic"}
          onOpenChange={() => setActiveForm(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Basic Details</DialogTitle>
            <BasicDetailsForm
              initialData={formData}
              onSave={(data) => handleFormSave({ basic: data })}
              onCancel={() => setActiveForm(null)}
              userId={user?.id ?? ""}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeForm === "employment"}
          onOpenChange={() => setActiveForm(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Employment Details</DialogTitle>
            <EmploymentForm
              initialData={formData}
              onSave={(data) => handleFormSave({ employment: data })}
              onCancel={() => setActiveForm(null)}
              userId={user?.id ?? ""}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeForm === "education"}
          onOpenChange={() => setActiveForm(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Education Details</DialogTitle>
            <EducationForm
              initialData={formData}
              onSave={(data) => handleFormSave({ education: data })}
              onCancel={() => setActiveForm(null)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeForm === "certification"}
          onOpenChange={() => setActiveForm(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Certification Details</DialogTitle>
            <CertificationForm
              initialData={profile?.certifications?.[0] ? {
                certificationName: profile.certifications[0].certification_name || "",
                completionId: profile.certifications[0].completion_id || "",
                startMonth: profile.certifications[0].start_month || "",
                startYear: profile.certifications[0].start_year || "",
                endMonth: profile.certifications[0].end_month || "",
                endYear: profile.certifications[0].end_year || "",
                doesNotExpire: profile.certifications[0].does_not_expire || false,
              } : {}}
              onSave={(data) => handleFormSave({ certifications: data })}
              onCancel={() => setActiveForm(null)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeForm === "address"}
          onOpenChange={() => setActiveForm(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Address Details</DialogTitle>
            <AddressForm
              initialData={formData}
              onSave={(data) => handleFormSave({ addresses: data })}
              onCancel={() => setActiveForm(null)}
              userId={user?.id ?? ""}
            />
          </DialogContent>
        </Dialog>
      </div>
      </ContentWrapper>
    </div>
  );
}
