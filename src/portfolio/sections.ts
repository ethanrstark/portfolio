import type { SectionId } from "./data/types";

export interface SectionMeta {
  id: SectionId;
  title: string;
  /** Short label shown on the interaction prompt, e.g. "Explore Projects". */
  promptVerb: string;
  /** One-line description shown on the welcome menu. */
  blurb: string;
  /** Single-emoji glyph used as a lightweight placeholder icon in UI/minimap. */
  icon: string;
  /**
   * Set this to show a "work in progress" message in place of the section's
   * content (inline styling such as **bold** works). Delete it once the
   * section has real content.
   */
  comingSoon?: string;
}

/** Single source of truth for section metadata used by the menu, panels, and minimap. */
export const SECTIONS: Record<SectionId, SectionMeta> = {
  about: { id: "about", title: "About Me", promptVerb: "Meet Me", blurb: "Who I am", icon: "🏡" },
  projects: { id: "projects", title: "Projects", promptVerb: "Explore Projects", blurb: "Things I've built", icon: "🏗️" },
  education: { id: "education", title: "Education", promptVerb: "View Education", blurb: "Where I've studied", icon: "🎓" },
  experience: { id: "experience", title: "Experience", promptVerb: "View Experience", blurb: "Where I've worked", icon: "💼" },
  skills: { id: "skills", title: "Skills", promptVerb: "View Skills", blurb: "What I work with", icon: "🛠️" },
  links: { id: "links", title: "Links & Contact", promptVerb: "Get In Touch", blurb: "Get in touch", icon: "✉️" },
  creative: { id: "creative", title: "Creative Projects", promptVerb: "View Creative Work", blurb: "Art and side projects", icon: "🎨", comingSoon: "This section is currently in progress. Come back soon to learn more!" },
};

export const SECTION_ORDER: SectionId[] = [
  "about",
  "projects",
  "experience",
  "education",  
  "skills",
  "links",
  "creative",
];
