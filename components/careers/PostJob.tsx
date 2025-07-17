import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { jobCategories, jobTypes, experienceLevels } from "@/data/jobs-data";
import { useAuth } from "@/contexts/auth-context";
import { uploadFile, getPublicUrl } from "@/lib/file-service"
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export default function PostJobDialog({ 
  open, 
  onClose, 
  editingJob 
}: { 
  open: boolean; 
  onClose: () => void; 
  editingJob?: any;
}) {
  const { user } = useAuth();
  
  const [jobData, setJobData] = useState<{
    title: string
    description: string
    company: string
    location: string
    salaryRange: [number, number]
    job_type: "full-time" | "part-time" | "contract" | "internship" | "remote" | ""
    experience_level: "entry-level" | "mid-level" | "senior-level" | "executive" | ""
    category: string
    requirements: string
    benefits: string
    application_deadline: string
    company_logo: string
  }>({
    title: "",
    description: "",
    company: "",
    location: "",
    salaryRange: [0, 50],
    job_type: "",
    experience_level: "",
    category: "",
    requirements: "",
    benefits: "",
    application_deadline: "",
    company_logo: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingJob) {
      // Populate form with existing job data
      setJobData({
        title: editingJob.title || "",
        description: editingJob.description || "",
        company: editingJob.company || "",
        location: editingJob.location || "",
        salaryRange: editingJob.salary_range ? 
          (() => {
            try {
              const parsed = JSON.parse(editingJob.salary_range)
              return [parsed.minSalary || 0, parsed.maxSalary || 0]
            } catch {
              return [0, 0]
            }
          })() : [0, 0],
        job_type: editingJob.job_type || "full-time",
        experience_level: editingJob.experience_level || "mid-level",
        category: editingJob.category || "all",
        requirements: Array.isArray(editingJob.requirements) ? 
          editingJob.requirements.join(', ') : 
          (editingJob.requirements || ""),
        benefits: Array.isArray(editingJob.benefits) ? 
          editingJob.benefits.join(', ') : 
          (editingJob.benefits || ""),
        application_deadline: editingJob.application_deadline ? 
          (() => {
            // Convert date to YYYY-MM-DD format for HTML date input
            const date = new Date(editingJob.application_deadline)
            return date.toISOString().split('T')[0]
          })() : "",
        company_logo: editingJob.company_logo || ""
      })
      
      // Set logo preview if there's an existing logo
      if (editingJob.company_logo) {
        setLogoPreview(editingJob.company_logo)
      }
    } else {
      // Reset form for new job
      setJobData({
        title: "",
        description: "",
        company: "",
        location: "",
        salaryRange: [0, 0],
        job_type: "full-time",
        experience_level: "mid-level",
        category: "all",
        requirements: "",
        benefits: "",
        application_deadline: "",
        company_logo: ""
      })
      setLogoPreview("")
    }
  }, [editingJob, open])

  const handleCancel = () => {
    // Reset form data
    setJobData({
      title: "",
      description: "",
      company: "",
      location: "",
      salaryRange: [0, 50],
      job_type: "",
      experience_level: "",
      category: "",
      requirements: "",
      benefits: "",
      application_deadline: "",
      company_logo: "",
    });
    setLogoPreview("");
    setLogoFile(null);
    onClose();
  };

  const handleSuccess = () => {
    // Reset form data
    setJobData({
      title: "",
      description: "",
      company: "",
      location: "",
      salaryRange: [0, 50],
      job_type: "",
      experience_level: "",
      category: "",
      requirements: "",
      benefits: "",
      application_deadline: "",
      company_logo: "",
    });
    setLogoPreview("");
    setLogoFile(null);
    onClose(); // This will trigger the refetch
  };

  const handlePostJob = async () => {
    if (!user?.id) {
      alert("You must be logged in to post a job.");
      return;
    }

    // Validation - ensure required fields are selected
    if (!jobData.job_type || !jobData.experience_level) {
      alert("Please select job type and experience level.");
      return;
    }

    // Additional validation
    if (!jobData.title.trim() || !jobData.company.trim() || !jobData.description.trim()) {
      alert("Please fill in all required fields: title, company, and description.");
      return;
    }

    setLoading(true);

    // Save salary range as JSON string
    const salaryRangeJson = JSON.stringify({ minSalary: jobData.salaryRange[0], maxSalary: jobData.salaryRange[1] });

    // Convert string requirements and benefits to arrays as required by the Job type
    const formattedJob = {
      title: jobData.title,
      description: jobData.description,
      company: jobData.company,
      location: jobData.location,
      salary_range: salaryRangeJson,
      job_type: jobData.job_type as "full-time" | "part-time" | "contract" | "internship" | "remote",
      experience_level: jobData.experience_level as "entry-level" | "mid-level" | "senior-level" | "executive",
      category: jobData.category,
      requirements: jobData.requirements ? jobData.requirements.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
      benefits: jobData.benefits ? jobData.benefits.split(',').map((b: string) => b.trim()).filter(Boolean) : [],
      application_deadline: jobData.application_deadline || null,
      company_logo: jobData.company_logo
    };

    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs'
      const method = editingJob ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedJob),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingJob ? "Job updated successfully!" : "Job posted successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to post job. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while posting the job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      if (!user?.id) throw new Error("User not authenticated")
      const ext = file.name.split('.').pop()
      const uniqueName = `${user.id}-${Date.now()}.${ext}`
      // Use the unique name for upload
      const uploaded = await uploadFile(new File([file], uniqueName, { type: file.type }))
      setJobData((prev) => ({ ...prev, company_logo: uploaded.url }))
    } catch (err) {
      alert("Failed to upload logo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="md:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Post a New Job'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Job Title *</label>
                <Input
                  placeholder="e.g., Senior   Engineer"
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name *</label>
                <Input
                  placeholder="e.g.,   Solutions Inc."
                  value={jobData.company}
                  onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Description *</label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <Input
                placeholder="e.g., Mumbai, Maharashtra"
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Job Type *</label>
                <Select
                  value={jobData.job_type}
                  onValueChange={(value: string) => setJobData({ ...jobData, job_type: value as "full-time" | "part-time" | "contract" | "internship" | "remote" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Experience Level *</label>
                <Select
                  value={jobData.experience_level}
                  onValueChange={(value: string) => setJobData({ ...jobData, experience_level: value as "entry-level" | "mid-level" | "senior-level" | "executive" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select
                  value={jobData.category}
                  onValueChange={(value) => setJobData({ ...jobData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.filter(category => category.id !== "all").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Salary Range</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">₹{jobData.salaryRange[0]}L - ₹{jobData.salaryRange[1]}L</span>
                </div>
                <div className="px-2">
                  <Slider
                    value={jobData.salaryRange}
                    max={50}
                    min={0}
                    step={1}
                    onValueChange={(values: number[]) => setJobData({ ...jobData, salaryRange: [values[0], values[1]] })}
                    className="w-full"
                    minStepsBetweenThumbs={1}
                  />
                </div>
                <div className="grid grid-cols-3 text-xs text-muted-foreground">
                  <div>₹0L</div>
                  <div className="text-center">₹25L</div>
                  <div className="text-right">₹50L+</div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements & Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Requirements & Benefits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Requirements</label>
                <Textarea
                  placeholder="e.g., 5+ years experience, AutoCAD, Crestron programming"
                  value={jobData.requirements}
                  onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                  rows={3}
                />
                <div className="text-xs text-muted-foreground">Separate multiple requirements with commas</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Benefits</label>
                <Textarea
                  placeholder="e.g., Health insurance, Flexible hours, Remote work"
                  value={jobData.benefits}
                  onChange={(e) => setJobData({ ...jobData, benefits: e.target.value })}
                  rows={3}
                />
                <div className="text-xs text-muted-foreground">Separate multiple benefits with commas</div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Application Deadline</label>
                <Input
                  type="date"
                  value={jobData.application_deadline}
                  onChange={(e) => setJobData({ ...jobData, application_deadline: e.target.value })}
                />
                <div className="text-xs text-muted-foreground">Last date for candidates to apply</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  disabled={uploading}
                />
                <div className="text-xs text-muted-foreground">Upload your company's logo</div>
                {uploading && <div className="text-xs text-blue-600">Uploading...</div>}
                {(logoPreview || jobData.company_logo) && (
                  <div className="mt-2">
                    <img 
                      src={logoPreview || jobData.company_logo} 
                      alt="Logo Preview" 
                      className="h-12 w-12 object-contain rounded border" 
                    />
                    {editingJob && jobData.company_logo && !logoPreview && (
                      <div className="text-xs text-gray-500 mt-1">Current logo</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handlePostJob}
            disabled={loading || uploading}
          >
            {loading ? (editingJob ? "Updating..." : "Posting...") : (editingJob ? "Update Job" : "Post Job")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}