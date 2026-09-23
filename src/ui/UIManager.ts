import { eventBus } from "@/game/systems/eventBus";
import type { SectionId } from "@/portfolio/data/types";
import { SECTIONS } from "@/portfolio/sections";
import { Panel } from "@/ui/panels/Panel";
import {
  renderAbout,
  renderEducation,
  renderExperience,
  renderSkills,
  renderLinks,
} from "@/ui/panels/sectionContent";
import { renderProjectViewer } from "@/ui/project-viewer/ProjectViewer";
import { renderResumeViewer } from "@/ui/resume-viewer/ResumeViewer";
import { HamburgerMenu } from "@/ui/navigation/HamburgerMenu";
import { Minimap } from "@/ui/minimap/Minimap";
import { InteractionPrompt } from "@/ui/dialogue/InteractionPrompt";
import { projects, creativeProjects } from "@/portfolio/data/projects";

const SECTION_RENDERERS: Record<SectionId, () => HTMLElement> = {
  about: renderAbout,
  projects: () => renderProjectViewer(projects),
  creative: () => renderProjectViewer(creativeProjects),
  education: renderEducation,
  experience: renderExperience,
  skills: renderSkills,
  links: renderLinks,
};

/**
 * Owns every HTML/CSS UI widget and is the only place that decides whether
 * the game should be "paused" (movement/interaction disabled) — it tracks
 * whether the menu and/or a content panel are open and emits a single
 * combined `ui:panelState` event the game layer reacts to.
 */
export class UIManager {
  private panel: Panel;
  private menu: HamburgerMenu;
  private menuOpen = false;
  private panelOpen = false;

  constructor(root: HTMLElement) {
    this.panel = new Panel(root, (open) => this.setOverlayState("panel", open));
    this.menu = new HamburgerMenu(
      root,
      {
        onOpenSection: (id) => this.openSection(id),
        onOpenResume: () => this.openResume(),
      },
      (open) => this.setOverlayState("menu", open),
    );

    new Minimap(root, (id) => this.openSection(id));
    new InteractionPrompt(root);

    eventBus.on("interaction:activate", (id) => this.openSection(id));
    eventBus.on("ui:openSection", (id) => this.openSection(id));
  }

  private openSection(id: SectionId): void {
    this.menu.close();
    this.panel.open(SECTIONS[id].title, SECTION_RENDERERS[id]());
  }

  private openResume(): void {
    this.menu.close();
    this.panel.open("Resume", renderResumeViewer());
  }

  private setOverlayState(source: "panel" | "menu", open: boolean): void {
    if (source === "panel") this.panelOpen = open;
    else this.menuOpen = open;
    eventBus.emit("ui:panelState", this.panelOpen || this.menuOpen);
  }
}
