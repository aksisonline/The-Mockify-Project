import { v4 as uuidv4 } from 'uuid'
import type { Job } from '@/types/supabase'

const companies = [
  'Media Solutions Inc',
  'TechVision Systems',
  'Digital Integration Pro',
  'Smart Media Solutions',
  'Future Tech Media',
  'Innovative Media Systems',
  'Global Media Technologies',
  'Elite Media Services',
  'NextGen Media Solutions',
  'Premier Media Systems'
]

const locations = [
  'New York, NY',
  'San Francisco, CA',
  'Chicago, IL',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Denver, CO',
  'Atlanta, GA',
  'Los Angeles, CA',
  'Portland, OR'
]

const jobTitles = [
  'Senior Media Engineer',
  'Media Systems Designer',
  'CAD Engineer',
  'Pre-Sales Engineer',
  'Media Support Specialist',
  'Project Manager',
  'Technical Support Engineer',
  'Solutions Architect',
  'Field Service Engineer',
  'Integration Specialist'
]

const descriptions = [
  'Design and implement advanced media solutions for corporate environments.',
  'Create detailed CAD drawings and system designs for complex media installations.',
  'Provide technical expertise and support for media system deployments.',
  'Lead pre-sales activities and technical presentations to clients.',
  'Manage media projects from conception to completion.',
  'Troubleshoot and maintain media systems across multiple locations.',
  'Develop innovative media solutions for modern workspaces.',
  'Coordinate with clients and stakeholders to deliver exceptional media experiences.',
  'Implement cutting-edge media technologies in enterprise environments.',
  'Provide technical leadership and mentorship to junior team members.'
]

const requirements = [
  ['CTS certification', '5+ years experience', 'Strong communication skills'],
  ['CTS-D certification', '3+ years design experience', 'Proficiency in AutoCAD'],
  ['CAD certification', '2+ years experience', 'Knowledge of media systems'],
  ['Sales experience', 'Technical background', 'Presentation skills'],
  ['Customer service experience', 'Technical troubleshooting', 'Problem-solving skills'],
  ['Project management certification', 'Leadership experience', 'Budget management'],
  ['Technical support experience', 'Media system knowledge', 'Customer service skills'],
  ['System design experience', 'Technical leadership', 'Client management'],
  ['Field service experience', 'Technical expertise', 'Travel flexibility'],
  ['Integration experience', 'System design', 'Project management']
]

const benefits = [
  ['Health insurance', '401(k) matching', 'Flexible schedule'],
  ['Remote work options', 'Professional development', 'Competitive salary'],
  ['Paid time off', 'Health benefits', 'Career growth'],
  ['Performance bonus', 'Health coverage', 'Training opportunities'],
  ['Work-life balance', 'Health benefits', 'Professional development'],
  ['Competitive salary', 'Health insurance', 'Remote options'],
  ['Flexible hours', 'Health coverage', 'Career advancement'],
  ['Remote work', 'Health benefits', 'Professional growth'],
  ['Travel allowance', 'Health insurance', 'Career development'],
  ['Competitive package', 'Health benefits', 'Remote work']
]

const categories = [
  'media-engineer',
  'media-designer',
  'cad-engineer',
  'pre-sales',
  'media-support',
  'media-project',
  'media-events',
  'top'
]

const jobTypes = ['full-time', 'part-time', 'contract', 'internship']
const experienceLevels = ['entry-level', 'mid-level', 'senior-level', 'executive']

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomSalaryRange(): string {
  const min = Math.floor(Math.random() * 20) + 5 // 5-25L
  const max = min + Math.floor(Math.random() * 15) + 5 // 5-20L more than min
  return JSON.stringify({ minSalary: min, maxSalary: max })
}

export function generateTempJobs(count: number): Job[] {
  const jobs: Job[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const job: Job = {
      id: uuidv4(),
      title: getRandomElement(jobTitles),
      description: getRandomElement(descriptions),
      company: getRandomElement(companies),
      location: getRandomElement(locations),
      salary_range: getRandomSalaryRange(),
      job_type: getRandomElement(jobTypes) as Job['job_type'],
      experience_level: getRandomElement(experienceLevels) as Job['experience_level'],
      requirements: getRandomElement(requirements),
      benefits: getRandomElement(benefits),
      posted_by: uuidv4(), // Random UUID for posted_by
      created_at: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      updated_at: new Date().toISOString(),
      application_deadline: new Date(now.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000).toISOString(), // 7-37 days from now
      is_active: true,
      category: getRandomElement(categories),
      company_logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(getRandomElement(companies))}&background=random`
    }
    jobs.push(job)
  }
  
  return jobs
} 