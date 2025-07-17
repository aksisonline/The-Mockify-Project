import { notFound } from "next/navigation"

import JobDetails from "@/components/careers/JobDetails"
import { getJobById, getAllJobIds } from "@/lib/job-service-client"
import ContentWrapper from "@/components/ContentWrapper"
import AppHeader from "@/components/ui/AppHeader"

export const dynamic = 'force-dynamic'

interface JobPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const ids = await getAllJobIds();
  return Array.isArray(ids) ? ids.map(id => ({ id })) : [];
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params
  const job = await getJobById(id)
  
  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <ContentWrapper>
      <AppHeader title="Careers" subtitle="Find your next opportunity in life" />
      <div className="max-w-7xl mx-auto">
        <JobDetails job={job} />
      </div>
      </ContentWrapper>
    </div>
  )
}
