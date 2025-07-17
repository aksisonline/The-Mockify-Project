import { createServerClient } from "@/lib/supabase/server"
import { awardCategoryPoints, getPointsCategoryByName } from "./points-category-service"
import { sendTrainingNotification } from "./notification-service"
import { emailService } from "@/lib/email-service"

export type TrainingProgram = {
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
  weekly_curriculum?: any[]
  hardware_requirements?: string[]
  software_requirements?: string[]
  advantages?: string[]
  learning_outcomes?: string[]
  instructors?: any[]
  created_at: string
  updated_at: string
}

export type TrainingEnrollment = {
  id: string
  program_id: string
  full_name: string
  email: string
  mobile_number: string
  location: string
  working_status: "yes" | "no"
  preferred_mode: "online" | "classroom"
  enrollment_status: "pending" | "confirmed" | "cancelled" | "completed"
  enrolled_at: string
  updated_at: string
  program?: TrainingProgram
}

export type EnrollmentFormData = {
  program_id: string
  mobile_number?: string
  working_status: "yes" | "no"
  preferred_mode: "online" | "classroom"
}

// Mock data as fallback
export const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: "1",
    title: "Getting Started with Mockify",
    description: "An introduction to Mockify, its features, and how to navigate the platform.",
    topics: "Platform Overview, User Onboarding, Basic Features, First Project",
    duration: "4 Weeks",
    mode: "Online",
    fees: "Free",
    image_url: "/placeholder-1.png",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Core Concepts and Workflows",
    description: "Learn the core concepts and workflows to use Mockify effectively.",
    topics: "User Workflows, Best Practices, Collaboration Tools",
    duration: "2 Weeks",
    mode: "Online",
    fees: "$0",
    image_url: "/placeholder-2.png",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Advanced Platform Features",
    description: "Explore advanced features like integrations, automation, and analytics.",
    topics: "Integrations, Automation, Analytics, Customization",
    duration: "3 Weeks",
    mode: "Online",
    fees: "$100",
    image_url: "/placeholder-3.png",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Collaboration and Community",
    description: "Best practices for team collaboration and community engagement on Mockify.",
    topics: "Team Workflows, Permissions, Forums, Networking",
    duration: "2 Weeks",
    mode: "Online",
    fees: "$50",
    image_url: "/placeholder-4.png",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Building Your First Mockup",
    description: "Hands-on project to create, export, and share your first mockup using Mockify.",
    topics: "Project Setup, Tools Overview, Export Options, Sharing",
    duration: "1 Week",
    mode: "Online",
    fees: "$25",
    image_url: "/placeholder-5.png",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function getTrainingPrograms() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("training_programs")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("title")

    if (error) {
      console.error("Supabase error fetching training programs:", error)
      // Return mock data as fallback
      return mockTrainingPrograms
    }

    return data as TrainingProgram[]
  } catch (error) {
    console.error("Error in getTrainingPrograms:", error)
    // Return mock data as fallback
    return mockTrainingPrograms
  }
}

export async function getTrainingProgram(id: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("training_programs").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching training program:", error)
      // Return mock data as fallback
      return mockTrainingPrograms.find((p) => p.id === id) || mockTrainingPrograms[0]
    }

    return data as TrainingProgram
  } catch (error) {
    console.error("Error in getTrainingProgram:", error)
    // Return mock data as fallback
    return mockTrainingPrograms.find((p) => p.id === id) || mockTrainingPrograms[0]
  }
}

export async function createEnrollment(enrollment: EnrollmentFormData, userEmail: string) {
  try {
    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user profile information with address data
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select(`
        id, 
        full_name, 
        email, 
        phone_number
      `)
      .eq("email", userEmail)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError)
      throw new Error("User profile not found")
    }

    // Get user's address information separately
    const { data: addresses, error: addressError } = await serviceClient
      .from("addresses")
      .select("city, country")
      .eq("user_id", profile.id)
      .limit(1)

    if (addressError) {
      console.error("Error fetching user address:", addressError)
    }

    // Check if user is already enrolled in this program
    const { data: existingEnrollment, error: checkError } = await serviceClient
      .from("training_enrollments")
      .select("id")
      .eq("email", userEmail)
      .eq("program_id", enrollment.program_id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing enrollment:", checkError)
      throw new Error(checkError.message)
    }

    if (existingEnrollment) {
      throw new Error("You are already enrolled in this program")
    }

    // Get program details for email notification
    const { data: program, error: programError } = await serviceClient
      .from("training_programs")
      .select("title")
      .eq("id", enrollment.program_id)
      .single()

    if (programError) {
      console.error("Error fetching program details:", programError)
    }

    // Get the first address for location data
    const address = addresses && addresses.length > 0 ? addresses[0] : null
    const location = address ? `${address.city || ''}${address.city && address.country ? ', ' : ''}${address.country || ''}`.trim() : "Not specified"

    // Prepare enrollment data using profile information
    const enrollmentData = {
      program_id: enrollment.program_id,
      full_name: profile.full_name,
      email: profile.email,
      mobile_number: enrollment.mobile_number || profile.phone_number || "",
      location: location,
      working_status: enrollment.working_status,
      preferred_mode: enrollment.preferred_mode,
      enrollment_status: "pending",
    }

    // Create new enrollment using service client
    const { data, error } = await serviceClient
      .from("training_enrollments")
      .insert(enrollmentData)
      .select()
      .single()

    if (error) {
      console.error("Error creating enrollment:", error)
      throw new Error(error.message)
    }

    // Award points in 'training' category
    const basePoints = 25 // Set the points to award for training enrollment here
    await awardCategoryPoints(profile.id, "training", basePoints, "Training enrollment", { program_id: enrollment.program_id })

    // Send pending status email notification
    try {
      const programTitle = program?.title || "Training Program"
      await emailService.sendTrainingNotificationEmails(
        [{
          email: profile.email,
          full_name: profile.full_name,
          id: data.id
        }],
        "Training Application Received - Pending Review",
        `Thank you for applying to our ${programTitle}! Your application has been received and is currently under review. We will contact you soon with further details about the program schedule and requirements.`,
        programTitle,
        enrollment.program_id
      )
      // console.log(`✅ Sent pending status email to ${profile.email} for ${programTitle}`)
    } catch (notificationError) {
      console.error("Error sending pending status notification:", notificationError)
      // Don't throw error here as the enrollment was successful
    }

    return data as TrainingEnrollment
  } catch (error) {
    console.error("Error in createEnrollment:", error)
    throw error
  }
}

export async function getUserEnrollments(userEmail: string) {
  try {
    const supabase = await createServerClient()

    // Fetch all enrollments where the user's email matches
    const { data, error } = await supabase
      .from("training_enrollments")
      .select(`
        *,
        program:program_id(*)
      `)
      .eq("email", userEmail)
      .order("enrolled_at", { ascending: false })

    if (error) {
      console.error("Error fetching user enrollments:", error)
      throw new Error(error.message)
    }

    return data as TrainingEnrollment[]
  } catch (error) {
    console.error("Error in getUserEnrollments:", error)
    throw error
  }
}

export async function isUserEnrolledInProgram(userEmail: string, programId: string) {
  try {
    const supabase = await createServerClient()

    // Check if user's email exists for this specific program
    const { data, error } = await supabase
      .from("training_enrollments")
      .select("id, enrollment_status")
      .eq("email", userEmail)
      .eq("program_id", programId)
      .maybeSingle()

    if (error) {
      console.error("Error checking enrollment status:", error)
      throw new Error(error.message)
    }

    return {
      isEnrolled: !!data,
      enrollmentStatus: data?.enrollment_status || null,
      enrollmentId: data?.id || null
    }
  } catch (error) {
    console.error("Error in isUserEnrolledInProgram:", error)
    throw error
  }
}

export async function updateEnrollmentStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
  try {
    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current enrollment data to calculate completion time if needed
    const { data: currentEnrollment, error: fetchError } = await serviceClient
      .from("training_enrollments")
      .select("enrolled_at, program_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching current enrollment:", fetchError)
      throw new Error(fetchError.message)
    }

    const { data, error } = await serviceClient
      .from("training_enrollments")
      .update({ enrollment_status: status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating enrollment status:", error)
      throw new Error(error.message)
    }

    // Get program details for email notification
    const { data: program, error: programError } = await serviceClient
      .from("training_programs")
      .select("title")
      .eq("id", data.program_id)
      .single()

    const programTitle = program?.title || "Training Program"

    // Send email notification for status changes
    try {
      let subject = ""
      let message = ""
      let completionTime = ""

      if (status === "confirmed") {
        subject = "Training Enrollment Confirmed - Payment Received"
        message = "Great news! Your training enrollment has been confirmed and payment has been received. We will contact you soon with further details about the program schedule and requirements."
      } else if (status === "completed") {
        // Calculate completion time
        const enrollmentDate = new Date(currentEnrollment.enrolled_at)
        const completionDate = new Date()
        const timeDiff = completionDate.getTime() - enrollmentDate.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        completionTime = daysDiff === 1 ? "1 day" : `${daysDiff} days`
        
        subject = "Congratulations! Training Program Completed"
        message = `Congratulations! You have successfully completed the ${programTitle} training program in ${completionTime} from your enrollment date. Your certificate will be issued shortly.`
      } else if (status === "cancelled") {
        subject = "Training Enrollment Cancelled"
        message = "Your training enrollment has been cancelled. If you have any questions or would like to re-enroll, please contact our support team."
      }

      if (subject && message) {
        await emailService.sendTrainingNotificationEmails(
          [{
            email: data.email,
            full_name: data.full_name,
            id: data.id
          }],
          subject,
          message,
          programTitle,
          data.program_id
        )
        // console.log(`✅ Sent ${status} status email to ${data.email} for ${programTitle}`)
      }
    } catch (notificationError) {
      console.error("Error sending status update notification:", notificationError)
      // Don't throw error here as the status update was successful
    }

    return data as TrainingEnrollment
  } catch (error) {
    console.error("Error in updateEnrollmentStatus:", error)
    throw error
  }
}

export async function getAllEnrollments() {
  try {
    //  console.log("getAllEnrollments: Starting to fetch all enrollments")
    
    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // console.log("getAllEnrollments: Service client created, fetching data")

    const { data, error } = await serviceClient
      .from("training_enrollments")
      .select(`
        *,
        program:program_id(*)
      `)
      .order("enrolled_at", { ascending: false })

    if (error) {
      console.error("Error fetching all enrollments:", error)
      throw new Error(error.message)
    }

    // console.log("getAllEnrollments: Successfully fetched", data?.length || 0, "enrollments")
    return data as TrainingEnrollment[]
  } catch (error) {
    console.error("Error in getAllEnrollments:", error)
    throw error
  }
}
