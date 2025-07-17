export interface JobTag {
  id: string
  name: string
}

export interface JobType {
  id: string
  name: string
  icon: string
  count?: number
}

export interface JobCategory {
  id: string
  name: string
  icon: string
  count: number
}

export interface ExperienceLevel {
  id: string
  name: string
  icon: string
  count?: number
}

export interface Company {
  id: string
  name: string
  logo?: string
  website?: string
  firstLetter: string
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  job_type: "full-time" | "part-time" | "contract" | "internship"
  experience_level: "entry-level" | "mid-level" | "senior-level" | "executive"
  minSalary?: number
  maxSalary?: number
  salary_range?: string
  description: string
  requirements?: string[]
  benefits?: string[]
  application_deadline?: string
  is_active: boolean
  category?: string
  company_logo?: string
  posted_by: string
  created_at: string
  updated_at: string
  postedDate?: string
}

export interface FilterState {
  category: string
  jobTypes: string[]
  experienceLevels: string[]
  salaryRange: [number, number]
  searchTerm: string
}
