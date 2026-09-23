/**
 * Shared content types for all portfolio data. Game/UI systems should only
 * ever depend on these shapes, never on hard-coded content, so that adding
 * or editing portfolio content never requires touching engine code.
 */

export type SectionId =
  | "about"
  | "projects"
  | "creative"
  | "education"
  | "experience"
  | "skills"
  | "links";

export interface ProjectLinks {
  github?: string;
  demo?: string;
  website?: string;
}

export interface ProjectMedia {
  images?: string[];
  video?: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  technologies: string[];
  links?: ProjectLinks;
  media?: ProjectMedia;
  featured?: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  credential: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
  highlights?: string[];
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  location?: string;
  summary: string;
  highlights?: string[];
  technologies?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export type LinkKind = "github" | "linkedin" | "email" | "website" | "twitter" | "other";

export interface LinkEntry {
  id: string;
  kind: LinkKind;
  label: string;
  url: string;
}

export interface AboutInfo {
  name: string;
  tagline: string;
  bio: string[];
  funFacts?: string[];
}

export interface ResumeInfo {
  summary: string;
  fileUrl?: string;
  lastUpdated: string;
}
