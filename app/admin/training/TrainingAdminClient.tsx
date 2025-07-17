"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Users, BookOpen, Clock, DollarSign, Eye, EyeOff, Upload, X, Send, CheckSquare, Square, Filter, Search, Calendar, Mail, Phone, MapPin, Briefcase, Download } from "lucide-react"
import { uploadFile } from "@/lib/file-service"
import { Toaster } from "@/components/ui/sonner"

interface TrainingProgram {
  id: string
  title: string
  description: string
  topics: string
  duration: string
  mode: string
  fees: string
  image_url?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TrainingEnrollment {
  id: string
  program_id: string
  full_name: string
  email: string
  mobile_number: string
  location: string
  working_status: 'yes' | 'no'
  preferred_mode: 'online' | 'classroom'
  enrollment_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  enrolled_at: string
  program?: TrainingProgram
}

interface ProgramEnrollments {
  program: TrainingProgram
  enrollments: TrainingEnrollment[]
  stats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

export default function TrainingAdminClient() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([])
  const [programEnrollments, setProgramEnrollments] = useState<ProgramEnrollments[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    totalEnrollments: 0,
    pendingEnrollments: 0,
    completedEnrollments: 0
  })

  // Form states
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topics: "",
    duration: "",
    mode: "",
    fees: "",
    feesNumber: "",
    image_url: "",
    is_featured: false,
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Mass update states
  const [selectedEnrollments, setSelectedEnrollments] = useState<Map<string, Set<string>>>(new Map())
  const [showMassUpdateDialog, setShowMassUpdateDialog] = useState(false)
  const [massUpdateStatus, setMassUpdateStatus] = useState<string>("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingIndividualStatus, setUpdatingIndividualStatus] = useState<string | null>(null)

  // Delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingEnrollment, setDeletingEnrollment] = useState<string | null>(null)
  const [showMassDeleteDialog, setShowMassDeleteDialog] = useState(false)
  const [deletingEnrollments, setDeletingEnrollments] = useState(false)

  // Notification states
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [notificationData, setNotificationData] = useState({
    subject: "",
    message: "",
    programId: "",
    enrollmentIds: [] as string[]
  })
  const [sendingNotification, setSendingNotification] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Group enrollments by program
    const grouped = programs.map(program => {
      const programEnrollments = enrollments.filter(e => e.program_id === program.id)
      const stats = {
        total: programEnrollments.length,
        pending: programEnrollments.filter(e => e.enrollment_status === 'pending').length,
        confirmed: programEnrollments.filter(e => e.enrollment_status === 'confirmed').length,
        completed: programEnrollments.filter(e => e.enrollment_status === 'completed').length,
        cancelled: programEnrollments.filter(e => e.enrollment_status === 'cancelled').length
      }
      return { program, enrollments: programEnrollments, stats }
    }).filter(group => group.enrollments.length > 0)

    setProgramEnrollments(grouped)
  }, [programs, enrollments])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch programs
      const programsResponse = await fetch('/api/training/programs')
      const programsData = await programsResponse.json()
      
      // Fetch enrollments with admin parameter
      const enrollmentsResponse = await fetch('/api/training/enrollments?admin=true')
      const enrollmentsData = await enrollmentsResponse.json()
      
      if (programsResponse.ok) {
        // Handle both array and object response formats
        const programs = Array.isArray(programsData) ? programsData : (programsData.programs || [])
        setPrograms(programs)
      } else {
        console.error('Failed to fetch programs:', programsData)
        toast.error('Failed to fetch training programs')
      }
      
      if (enrollmentsResponse.ok) {
        const enrollments = enrollmentsData.enrollments || []
        setEnrollments(enrollments)
      } else {
        console.error('Failed to fetch enrollments:', enrollmentsData)
        toast.error('Failed to fetch training enrollments')
      }
      
      // Calculate stats
      const programs = Array.isArray(programsData) ? programsData : (programsData.programs || [])
      const enrollments = enrollmentsData.enrollments || []
      
      const activePrograms = programs.filter((p: TrainingProgram) => p.is_active).length || 0
      const pendingEnrollments = enrollments.filter((e: TrainingEnrollment) => e.enrollment_status === 'pending').length || 0
      const completedEnrollments = enrollments.filter((e: TrainingEnrollment) => e.enrollment_status === 'completed').length || 0
      
      setStats({
        totalPrograms: programs.length || 0,
        activePrograms,
        totalEnrollments: enrollments.length || 0,
        pendingEnrollments,
        completedEnrollments
      })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch training data')
    } finally {
      setLoading(false)
    }
  }

  // Format number to Indian currency format
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}/-`
  }

  // Parse currency string back to number
  const parseCurrency = (currencyString: string): number => {
    const match = currencyString.match(/₹([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true)
      const result = await uploadFile(file)
      setFormData({ ...formData, image_url: result.url })
      setImagePreview(result.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setFormData({ ...formData, image_url: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Format fees if feesNumber is provided
      let finalFees = formData.fees
      if (formData.feesNumber) {
        finalFees = formatCurrency(parseInt(formData.feesNumber))
      }

      const url = editingProgram 
        ? `/api/training/programs/${editingProgram.id}`
        : '/api/training/programs'
      
      const method = editingProgram ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          topics: formData.topics,
          duration: formData.duration,
          mode: formData.mode,
          fees: finalFees,
          image_url: formData.image_url,
          is_featured: formData.is_featured,
          is_active: formData.is_active
        })
      })

      if (response.ok) {
        toast.success(editingProgram ? 'Program updated successfully' : 'Program created successfully')
        setShowAddProgram(false)
        setEditingProgram(null)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save program')
      }
    } catch (error: any) {
      console.error('Error saving program:', error)
      toast.error(error.message || 'Failed to save program')
    }
  }

  const handleDelete = async (programId: string) => {
    try {
      const response = await fetch(`/api/training/programs/${programId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Program deleted successfully')
        fetchData()
      } else {
        throw new Error('Failed to delete program')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to delete program')
    }
  }

  const handleStatusChange = async (enrollmentId: string, status: string) => {
    try {
      setUpdatingIndividualStatus(enrollmentId)
      
      // Show processing message for status changes that will send emails
      if (status !== 'pending') {
        toast.info(`Updating status and sending email notification...`, {
          duration: 2000
        })
      }
      
      const response = await fetch(`/api/training/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_status: status })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show success message with email notification info
        if (status !== 'pending') {
          toast.success(`✅ Status updated to ${status} and email notification sent`)
        } else {
          toast.success('✅ Enrollment status updated successfully')
        }
        
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update enrollment status')
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error)
      toast.error(`Failed to update enrollment status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingIndividualStatus(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      topics: "",
      duration: "",
      mode: "",
      fees: "",
      feesNumber: "",
      image_url: "",
      is_featured: false,
      is_active: true
    })
    setImageFile(null)
    setImagePreview("")
  }

  const editProgram = (program: TrainingProgram) => {
    setEditingProgram(program)
    setFormData({
      title: program.title,
      description: program.description,
      topics: program.topics,
      duration: program.duration,
      mode: program.mode,
      fees: program.fees,
      feesNumber: parseCurrency(program.fees).toString(),
      image_url: program.image_url || "",
      is_featured: program.is_featured,
      is_active: program.is_active
    })
    setImagePreview(program.image_url || "")
    setShowAddProgram(true)
  }

  // Mass update functions
  const handleSelectAll = (programId: string, enrollmentIds: string[]) => {
    const newSelected = new Map(selectedEnrollments)
    const programSelections = new Set(newSelected.get(programId) || [])
    
    if (programSelections.size === enrollmentIds.length) {
      // If all are selected, deselect all
      newSelected.delete(programId)
    } else {
      // Select all enrollments for this program
      newSelected.set(programId, new Set(enrollmentIds))
    }
    
    setSelectedEnrollments(newSelected)
  }

  const handleSelectEnrollment = (programId: string, enrollmentId: string) => {
    const newSelected = new Map(selectedEnrollments)
    const programSelections = new Set(newSelected.get(programId) || [])
    
    if (programSelections.has(enrollmentId)) {
      programSelections.delete(enrollmentId)
    } else {
      programSelections.add(enrollmentId)
    }
    
    if (programSelections.size === 0) {
      newSelected.delete(programId)
    } else {
      newSelected.set(programId, programSelections)
    }
    
    setSelectedEnrollments(newSelected)
  }

  const getAllSelectedEnrollmentIds = (): string[] => {
    const allIds: string[] = []
    selectedEnrollments.forEach((enrollmentIds) => {
      enrollmentIds.forEach(id => allIds.push(id))
    })
    return allIds
  }

  const getSelectedCountForProgram = (programId: string): number => {
    return selectedEnrollments.get(programId)?.size || 0
  }

  const isAllSelectedForProgram = (programId: string, enrollmentIds: string[]): boolean => {
    const programSelections = selectedEnrollments.get(programId)
    return programSelections ? programSelections.size === enrollmentIds.length && enrollmentIds.length > 0 : false
  }

  const isEnrollmentSelected = (programId: string, enrollmentId: string): boolean => {
    return selectedEnrollments.get(programId)?.has(enrollmentId) || false
  }

  const handleMassStatusUpdate = async () => {
    const allSelectedIds = getAllSelectedEnrollmentIds()
    if (!massUpdateStatus || allSelectedIds.length === 0) {
      toast.error('Please select a status and enrollments')
      return
    }

    try {
      setUpdatingStatus(true)
      
      // Show initial processing message
      toast.info(`Processing ${allSelectedIds.length} enrollments...`, {
        duration: 2000
      })
      
      const response = await fetch('/api/training/enrollments/mass-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentIds: allSelectedIds,
          status: massUpdateStatus
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show success message with email notification info
        if (massUpdateStatus !== 'pending') {
          toast.success(`✅ Updated ${allSelectedIds.length} enrollments to ${massUpdateStatus} and sent email notifications`, {
            duration: 4000
          })
        } else {
          toast.success(`✅ Updated ${allSelectedIds.length} enrollments to ${massUpdateStatus}`)
        }
        
        setSelectedEnrollments(new Map())
        setShowMassUpdateDialog(false)
        setMassUpdateStatus("")
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update enrollments')
      }
    } catch (error) {
      console.error('Error updating enrollments:', error)
      toast.error(`Failed to update enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Notification functions
  const handleSendNotification = async () => {
    if (!notificationData.subject || !notificationData.message || notificationData.enrollmentIds.length === 0) {
      toast.error('Please fill in all notification fields and select recipients')
      return
    }

    try {
      setSendingNotification(true)
      const response = await fetch('/api/training/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      if (response.ok) {
        toast.success(`Notification sent to ${notificationData.enrollmentIds.length} users`)
        setShowNotificationDialog(false)
        setNotificationData({ subject: "", message: "", programId: "", enrollmentIds: [] })
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setSendingNotification(false)
    }
  }

  const openNotificationDialog = (programId?: string, enrollmentIds?: string[]) => {
    setNotificationData({
      subject: "",
      message: "",
      programId: programId || "",
      enrollmentIds: enrollmentIds || getAllSelectedEnrollmentIds()
    })
    setShowNotificationDialog(true)
  }

  // Filter functions
  const getFilteredProgramEnrollments = () => {
    return programEnrollments.filter(group => {
      // Filter by program
      if (selectedProgram !== "all" && group.program.id !== selectedProgram) {
        return false
      }

      // Filter enrollments by search and status
      const filteredEnrollments = group.enrollments.filter(enrollment => {
        const matchesSearch = enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || enrollment.enrollment_status === statusFilter
        return matchesSearch && matchesStatus
      })

      return filteredEnrollments.length > 0
    }).map(group => ({
      ...group,
      enrollments: group.enrollments.filter(enrollment => {
        const matchesSearch = enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || enrollment.enrollment_status === statusFilter
        return matchesSearch && matchesStatus
      })
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Export functions
  const exportEnrollments = (enrollments: TrainingEnrollment[], programTitle?: string) => {
    const csvData = [
      [
        'Name',
        'Email',
        'Phone',
        'Location',
        'Working Status',
        'Preferred Mode',
        'Enrollment Status',
        'Enrolled Date',
        'Program'
      ].join(','),
      ...enrollments.map(enrollment => [
        `"${enrollment.full_name}"`,
        `"${enrollment.email}"`,
        `"${enrollment.mobile_number}"`,
        `"${enrollment.location}"`,
        `"${enrollment.working_status}"`,
        `"${enrollment.preferred_mode}"`,
        `"${enrollment.enrollment_status}"`,
        `"${new Date(enrollment.enrolled_at).toLocaleDateString()}"`,
        `"${enrollment.program?.title || programTitle || 'Unknown'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `training-enrollments-${programTitle || 'all'}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportAllEnrollments = () => {
    const allEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      program: programs.find(p => p.id === enrollment.program_id)
    }))
    exportEnrollments(allEnrollments, 'all-programs')
  }

  const exportProgramEnrollments = (programId: string, programTitle: string) => {
    const programEnrollments = enrollments
      .filter(e => e.program_id === programId)
      .map(enrollment => ({
        ...enrollment,
        program: programs.find(p => p.id === enrollment.program_id)
      }))
    exportEnrollments(programEnrollments, programTitle)
  }

  const exportSelectedEnrollments = () => {
    const allSelectedIds = getAllSelectedEnrollmentIds()
    if (allSelectedIds.length === 0) {
      toast.error('Please select enrollments to export')
      return
    }

    const selectedEnrollments = enrollments.filter(enrollment => 
      allSelectedIds.includes(enrollment.id)
    )
    exportEnrollments(selectedEnrollments, 'Selected Enrollments')
  }

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    try {
      setDeletingEnrollment(enrollmentId)
      const response = await fetch(`/api/training/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Enrollment deleted successfully')
        fetchData()
      } else {
        throw new Error('Failed to delete enrollment')
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      toast.error('Failed to delete enrollment')
    } finally {
      setDeletingEnrollment(null)
      setShowDeleteDialog(false)
    }
  }

  const handleMassDeleteEnrollments = async () => {
    const allSelectedIds = getAllSelectedEnrollmentIds()
    if (allSelectedIds.length === 0) {
      toast.error('Please select enrollments to delete')
      return
    }

    try {
      setDeletingEnrollments(true)
      const response = await fetch('/api/training/enrollments/mass-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentIds: allSelectedIds })
      })

      if (response.ok) {
        toast.success(`Deleted ${allSelectedIds.length} enrollments`)
        setSelectedEnrollments(new Map())
        setShowMassDeleteDialog(false)
        fetchData()
      } else {
        throw new Error('Failed to delete enrollments')
      }
    } catch (error) {
      console.error('Error deleting enrollments:', error)
      toast.error('Failed to delete enrollments')
    } finally {
      setDeletingEnrollments(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const filteredGroups = getFilteredProgramEnrollments()

  return (
    <div className="container py-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingEnrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments by Program</TabsTrigger>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAllSelectedEnrollmentIds().length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMassUpdateDialog(true)}
                    >
                      Update {getAllSelectedEnrollmentIds().length} Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowMassDeleteDialog(true)}
                    >
                      Delete {getAllSelectedEnrollmentIds().length} Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportSelectedEnrollments}
                    >
                      Export {getAllSelectedEnrollmentIds().length} Selected
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={exportAllEnrollments}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Program Groups */}
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <Card key={group.program.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {group.program.title}
                      </CardTitle>
                      <CardDescription className="mt-2 max-w-md line-clamp-2 text-sm">
                        {group.program.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Enrollments</div>
                        <div className="text-2xl font-bold">{group.stats.total}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Pending: {group.stats.pending}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Confirmed: {group.stats.confirmed}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Completed: {group.stats.completed}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNotificationDialog(group.program.id, group.enrollments.map(e => e.id))}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Notify All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportProgramEnrollments(group.program.id, group.program.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={isAllSelectedForProgram(group.program.id, group.enrollments.map(e => e.id))}
                              onCheckedChange={(checked) => handleSelectAll(group.program.id, group.enrollments.map(e => e.id))}
                            />
                          </TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              <Checkbox
                                checked={isEnrollmentSelected(group.program.id, enrollment.id)}
                                onCheckedChange={(checked) => handleSelectEnrollment(group.program.id, enrollment.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {enrollment.full_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{enrollment.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{enrollment.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {enrollment.mobile_number}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {enrollment.location}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Briefcase className="h-3 w-3" />
                                  Working: {enrollment.working_status === 'yes' ? 'Yes' : 'No'}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <BookOpen className="h-3 w-3" />
                                  Preferred: {enrollment.preferred_mode}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={enrollment.enrollment_status}
                                onValueChange={(value) => handleStatusChange(enrollment.id, value)}
                                disabled={updatingIndividualStatus === enrollment.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                  {updatingIndividualStatus === enrollment.id && (
                                    <div className="ml-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                    </div>
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openNotificationDialog(group.program.id, [enrollment.id])}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setDeletingEnrollment(enrollment.id)
                                    setShowDeleteDialog(true)
                                  }}
                                  disabled={deletingEnrollment === enrollment.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Training Programs</h2>
            <Button onClick={() => setShowAddProgram(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
          </div>

          <div className="grid gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{program.title}</h3>
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {program.is_featured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 max-w-md">{program.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {program.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {program.mode}
                        </div>
                        <div className="flex items-center gap-1">
                          {program.fees}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editProgram(program)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{program.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(program.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Program Dialog */}
      <Dialog open={showAddProgram} onOpenChange={setShowAddProgram}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Training Program' : 'Add New Training Program'}
            </DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Update the training program details.' : 'Create a new training program.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 12 Weeks"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) => setFormData({ ...formData, mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online/Offline">Online/Offline</SelectItem>
                    <SelectItem value="Online Session">Online Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feesNumber">Fees (₹)</Label>
                <Input
                  id="feesNumber"
                  type="number"
                  value={formData.feesNumber}
                  onChange={(e) => setFormData({ ...formData, feesNumber: e.target.value })}
                  placeholder="e.g., 25000"
                  required
                />
                {formData.feesNumber && (
                  <p className="text-sm text-muted-foreground">
                    Will be saved as: {formatCurrency(parseInt(formData.feesNumber) || 0)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topics">Topics</Label>
              <Textarea
                id="topics"
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                rows={3}
                placeholder="Comma-separated topics"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Program Image</Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Program preview" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:text-primary/80">
                          {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                        </span>
                      </Label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddProgram(false)
                setEditingProgram(null)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mass Update Dialog */}
      <Dialog open={showMassUpdateDialog} onOpenChange={setShowMassUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mass Update Enrollments</DialogTitle>
            <DialogDescription>
              Update status for {getAllSelectedEnrollmentIds().length} selected enrollments
              {massUpdateStatus && massUpdateStatus !== 'pending' && (
                <span className="block mt-1 text-sm text-blue-600">
                  📧 Email notifications will be sent to all students
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mass-status">New Status</Label>
              <Select value={massUpdateStatus} onValueChange={setMassUpdateStatus} disabled={updatingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updatingStatus && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Processing {getAllSelectedEnrollmentIds().length} enrollments...
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMassUpdateDialog(false)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleMassStatusUpdate} disabled={updatingStatus || !massUpdateStatus}>
              {updatingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Update Enrollments"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Custom Notification</DialogTitle>
            <DialogDescription>
              Send a custom notification to selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification-subject">Subject</Label>
              <Input
                id="notification-subject"
                value={notificationData.subject}
                onChange={(e) => setNotificationData({...notificationData, subject: e.target.value})}
                placeholder="Notification subject"
                required
              />
            </div>
            <div>
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={notificationData.message}
                onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                rows={4}
                placeholder="Notification message"
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This notification will be sent to {notificationData.enrollmentIds.length} user(s)
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={sendingNotification}>
              {sendingNotification ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Delete Dialog */}
      <Dialog open={showMassDeleteDialog} onOpenChange={setShowMassDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enrollments</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedEnrollments.size} selected enrollment(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMassDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleMassDeleteEnrollments} 
              disabled={deletingEnrollments}
            >
              {deletingEnrollments ? "Deleting..." : "Delete Enrollments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enrollment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingEnrollment && handleDeleteEnrollment(deletingEnrollment)}
              disabled={!deletingEnrollment}
            >
              {deletingEnrollment ? "Deleting..." : "Delete Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  )
} 