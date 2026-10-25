import { SECTIONS, SECTION_ORDER } from "@/portfolio/sections";
import type { SectionId } from "@/portfolio/data/types";

/** Anything a visitor can open from the menus: a portfolio section, or the resume. */
export type NavTarget = SectionId | "resume";

export interface NavItem {
  id: NavTarget;
  title: string;
  icon: string;
  blurb: string;
}

/** Every destination in menu order — the sections, then the resume. */
export const NAV_ITEMS: NavItem[] = [
  ...SECTION_ORDER.map((id) => ({ id, title: SECTIONS[id].title, icon: SECTIONS[id].icon, blurb: SECTIONS[id].blurb })),
  { id: "resume", title: "Resume", icon: "📄", blurb: "Experience at a glance" },
];
