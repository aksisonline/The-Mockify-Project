import { HoverEffect } from "@/components/ui/card-hover-effect";

export default function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}

export const projects = [
  {
    title: "Professional Media Tools",
    description:
      "Access cutting-edge platform tools and resources designed by industry experts to streamline your workflow and enhance project outcomes.",
    link: "#",
  },
  {
    title: "  Career Hub",
    description:
      "Discover exciting career opportunities in the platform industry. Connect with top employers and advance your   professional journey.",
    link: "#",
  },
  {
    title: "  Marketplace",
    description:
      "Shop the latest solutions and tools. Find everything from professional equipment to complete project setups.",
    link: "#",
  },
  {
    title: "  Professional Network",
    description:
      "Join a thriving community of platform professionals. Share knowledge, collaborate on projects, and grow your network.",
    link: "#",
  },
  {
    title: "Equipment Reviews",
    description:
      "Read honest reviews and comparisons of the latest   equipment from industry professionals who actually use the gear.",
    link: "#",
  },
  {
    title: "Professional Training",
    description:
      "Enhance your skills with comprehensive training programs led by industry experts. Stay current with the latest   technologies and techniques.",
    link: "#",
  },
];
