import type { SectionId } from "./data/types";

export interface SectionMeta {
  id: SectionId;
  title: string;
  /** Short label shown on the interaction prompt, e.g. "Explore Projects". */
  promptVerb: string;
  /** Single-emoji glyph used as a lightweight placeholder icon in UI/minimap. */
  icon: string;
}

/** Single source of truth for section metadata used by the menu, panels, and minimap. */
export const SECTIONS: Record<SectionId, SectionMeta> = {
  about: { id: "about", title: "About Me", promptVerb: "Meet Me", icon: "🏡" },
  projects: { id: "projects", title: "Projects", promptVerb: "Explore Projects", icon: "🏗️" },
  creative: { id: "creative", title: "Creative Projects", promptVerb: "View Creative Work", icon: "🎨" },
  education: { id: "education", title: "Education", promptVerb: "View Education", icon: "🎓" },
  experience: { id: "experience", title: "Experience", promptVerb: "View Experience", icon: "💼" },
  skills: { id: "skills", title: "Skills", promptVerb: "View Skills", icon: "🛠️" },
  links: { id: "links", title: "Links & Contact", promptVerb: "Get In Touch", icon: "✉️" },
};

export const SECTION_ORDER: SectionId[] = [
  "about",
  "projects",
  "creative",
  "education",
  "experience",
  "skills",
  "links",
];
