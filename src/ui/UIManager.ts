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
  renderComingSoon,
} from "@/ui/panels/sectionContent";
import { renderProjectViewer } from "@/ui/project-viewer/ProjectViewer";
import { renderResumeViewer } from "@/ui/resume-viewer/ResumeViewer";
import { MainMenu } from "@/ui/navigation/MainMenu";
import type { NavTarget } from "@/ui/navigation/navItems";
import { Minimap } from "@/ui/minimap/Minimap";
import { InteractionPrompt } from "@/ui/dialogue/InteractionPrompt";
import { projects } from "@/portfolio/data/projects";

const SECTION_RENDERERS: Record<SectionId, () => HTMLElement> = {
  about: renderAbout,
  projects: () => renderProjectViewer(projects),
  // Switch to renderProjectViewer(creativeProjects) once there is work to show (and drop `comingSoon` in sections.ts).
  creative: () => renderComingSoon(SECTIONS.creative.comingSoon ?? ""),
  education: renderEducation,
  experience: renderExperience,
  skills: renderSkills,
  links: renderLinks,
};

const RESUME_TITLE = "Resume";

/**
 * Owns every HTML/CSS UI widget and is the only place that decides whether
 * the game should be "paused" (movement/interaction disabled) — it tracks
 * whether the main menu and/or a content panel are open and emits a single
 * combined `ui:panelState` event the game layer reacts to.
 */
export class UIManager {
  private panel: Panel;
  private menu: MainMenu;
  private menuOpen = false;
  private panelOpen = false;

  constructor(root: HTMLElement) {
    this.panel = new Panel(root, {
      onOpenChange: (open) => this.setOverlayState("panel", open),
      onNavigate: (target) => this.open(target),
      onHome: () => {
        this.panel.close();
        this.menu.open(false);
      },
    });
    this.menu = new MainMenu(root, (target) => this.open(target), (open) => this.setOverlayState("menu", open));

    new Minimap(root, (id) => this.open(id));
    new InteractionPrompt(root);

    eventBus.on("interaction:activate", (id) => this.open(id));
    eventBus.on("ui:openSection", (id) => this.open(id));
    // The welcome menu opens before the game scene is listening, so repeat the pause state once it is.
    eventBus.on("game:ready", () => this.emitState());

    // The landing page: greet every visitor with the full menu before the game starts.
    this.menu.open(true);
  }

  private open(target: NavTarget): void {
    this.menu.close();
    if (target === "resume") this.panel.open(target, RESUME_TITLE, renderResumeViewer());
    else this.panel.open(target, SECTIONS[target].title, SECTION_RENDERERS[target]());
  }

  private setOverlayState(source: "panel" | "menu", open: boolean): void {
    if (source === "panel") this.panelOpen = open;
    else this.menuOpen = open;
    this.emitState();
  }

  private emitState(): void {
    eventBus.emit("ui:panelState", this.panelOpen || this.menuOpen);
  }
}
