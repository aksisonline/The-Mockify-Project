import type { Job, JobCategory, JobType, ExperienceLevel } from "@/types/job"

export const jobCategories: JobCategory[] = [
  { id: "all", name: "All", icon: "bi-briefcase", count: 6 },
  { id: "media-engineer", name: "Media Engineer", icon: "bi-tools", count: 2 },
  { id: "media-designer", name: "Media Designer", icon: "bi-palette", count: 1 },
  { id: "cad-engineer", name: "CAD Engineer", icon: "bi-layers", count: 1 },
  { id: "pre-sales", name: "Pre-Sales", icon: "bi-graph-up", count: 1 },
  { id: "media-support", name: "Media Support", icon: "bi-headset", count: 1 },
  { id: "media-events", name: "Media Events", icon: "bi-calendar-event", count: 1 },
  { id: "media-project", name: "Media Project", icon: "bi-kanban", count: 1 },
  { id: "top", name: "Top", icon: "bi-trophy", count: 1 },
]

export const jobTypes: JobType[] = [
  { id: "full-time", name: "Full-time", icon: "bi-clock-fill" },
  { id: "part-time", name: "Part-time", icon: "bi-clock" },
  { id: "contract", name: "Contract", icon: "bi-file-earmark-text" },
  { id: "remote", name: "Remote", icon: "bi-house-door" },
  { id: "internship", name: "Internship", icon: "bi-mortarboard" },
]

export const experienceLevels: ExperienceLevel[] = [
  { id: "entry-level", name: "Entry Level", icon: "bi-person" },
  { id: "mid-level", name: "Mid Level", icon: "bi-person-check" },
  { id: "senior-level", name: "Senior Level", icon: "bi-person-fill" },
  { id: "executive", name: "Executive", icon: "bi-person-badge" },
]

export const popularSearches = ["Media Engineer", "Media Designer", "CAD Engineer", "Pre-Sales", "Media Support", "Media Events"]

export const commonSkills = [

  "Revit",
  "3D Modeling",
  "System Design",
  "Media Design",
  "Technical Drawing",
  "Project Management",
  "Team Leadership",
  "Client Relations",
  "Technical Support",
  "Troubleshooting",
  "Media Engineering",
  "Network Configuration",
  "Programming",
  "Control Systems",
  "Signal Distribution",
  "Media Conferencing",
]
