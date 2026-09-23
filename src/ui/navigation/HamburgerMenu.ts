import { SECTIONS, SECTION_ORDER } from "@/portfolio/sections";
import type { SectionId } from "@/portfolio/data/types";
import { el } from "@/ui/utils";

interface HamburgerMenuCallbacks {
  onOpenSection: (id: SectionId) => void;
  onOpenResume: () => void;
}

/**
 * Persistent hamburger button + slide-out nav. This is the primary fallback
 * navigation path for a visitor who doesn't want to explore the RPG world —
 * every portfolio section (plus Resume) is one click away from here.
 */
export class HamburgerMenu {
  private button: HTMLButtonElement;
  private overlay: HTMLDivElement;
  private isOpen = false;

  constructor(
    root: HTMLElement,
    private callbacks: HamburgerMenuCallbacks,
    private onOpenChange: (open: boolean) => void,
  ) {
    this.button = el("button", "hamburger-button");
    this.button.setAttribute("aria-label", "Open navigation menu");
    this.button.innerHTML = `<span></span><span></span><span></span>`;
    this.button.addEventListener("click", () => this.toggle());

    this.overlay = this.buildOverlay();

    root.append(this.button, this.overlay);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  open(): void {
    this.isOpen = true;
    this.overlay.classList.add("menu-overlay--open");
    this.button.classList.add("hamburger-button--active");
    this.onOpenChange(true);
  }

  close(): void {
    this.isOpen = false;
    this.overlay.classList.remove("menu-overlay--open");
    this.button.classList.remove("hamburger-button--active");
    this.onOpenChange(false);
  }

  private toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  private buildOverlay(): HTMLDivElement {
    const overlay = el("div", "menu-overlay");
    const panel = el("nav", "menu-panel");
    panel.setAttribute("aria-label", "Portfolio navigation");

    panel.append(el("h2", "menu-panel__title", "Stitch's World"));
    panel.append(el("p", "menu-panel__subtitle", "Jump straight to any section."));

    const list = el("div", "menu-panel__list");
    for (const id of SECTION_ORDER) {
      const meta = SECTIONS[id];
      const item = el("button", "menu-item");
      item.append(el("span", "menu-item__icon", meta.icon), el("span", "menu-item__label", meta.title));
      item.addEventListener("click", () => {
        this.callbacks.onOpenSection(id);
      });
      list.append(item);
    }

    const resumeItem = el("button", "menu-item menu-item--resume");
    resumeItem.append(el("span", "menu-item__icon", "📄"), el("span", "menu-item__label", "Resume"));
    resumeItem.addEventListener("click", () => this.callbacks.onOpenResume());
    list.append(resumeItem);

    panel.append(list);

    const returnButton = el("button", "menu-return", "Return to Game");
    returnButton.addEventListener("click", () => this.close());
    panel.append(returnButton);

    overlay.append(panel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    return overlay;
  }
}
