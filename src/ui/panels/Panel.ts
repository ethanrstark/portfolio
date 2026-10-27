import { el, moveFocusWithArrows, trapTabKey } from "@/ui/utils";
import { NAV_ITEMS, type NavTarget } from "@/ui/navigation/navItems";

interface PanelCallbacks {
  onOpenChange: (open: boolean) => void;
  /** A visitor picked another destination from the panel's side list. */
  onNavigate: (target: NavTarget) => void;
  /** The Home entry: back to the main menu. */
  onHome: () => void;
}

/**
 * The modal window every portfolio section opens in. It carries a list of
 * every destination alongside the content, so visitors can read through the
 * whole portfolio without going back to a menu. Content is supplied by the
 * caller as a freshly-built element, so this file never needs to know
 * about portfolio data shapes.
 */
export class Panel {
  private overlay: HTMLDivElement;
  private dialog: HTMLDivElement;
  private titleEl: HTMLHeadingElement;
  private bodyEl: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private navButtons = new Map<NavTarget, HTMLButtonElement>();
  private isOpen = false;

  constructor(root: HTMLElement, private callbacks: PanelCallbacks) {
    this.overlay = el("div", "panel-overlay");
    this.overlay.setAttribute("inert", ""); // not focusable or readable while closed
    this.dialog = el("div", "panel-dialog frame");
    this.dialog.setAttribute("role", "dialog");
    this.dialog.setAttribute("aria-modal", "true");

    const header = el("div", "panel-dialog__header");
    this.titleEl = el("h2", "panel-dialog__title");
    this.titleEl.id = "panel-title";
    this.dialog.setAttribute("aria-labelledby", this.titleEl.id);
    this.closeButton = el("button", "btn btn--wood panel-dialog__close", "✕");
    this.closeButton.type = "button";
    this.closeButton.setAttribute("aria-label", "Close window");
    this.closeButton.addEventListener("click", () => this.close());
    header.append(this.titleEl, this.closeButton);

    const layout = el("div", "panel-dialog__layout");
    layout.append(this.buildNav());
    this.bodyEl = el("div", "panel-dialog__body");
    layout.append(this.bodyEl);

    this.dialog.append(header, layout);
    this.overlay.append(this.dialog);
    root.append(this.overlay);

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.dialog.addEventListener("keydown", (e) => {
      trapTabKey(e, this.dialog);
      // Arrow keys step through the destination list while it has focus.
      if (this.navButtons.size && [...this.navButtons.values()].includes(document.activeElement as HTMLButtonElement)) {
        moveFocusWithArrows(e, [...this.navButtons.values()]);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  private buildNav(): HTMLElement {
    const nav = el("nav", "panel-nav");
    nav.setAttribute("aria-label", "Portfolio sections");

    const home = el("button", "panel-nav__item panel-nav__item--home");
    home.type = "button";
    home.append(el("span", "panel-nav__icon", "🏠"), el("span", "panel-nav__label", "Home"));
    home.addEventListener("click", () => this.callbacks.onHome());
    nav.append(home);

    for (const item of NAV_ITEMS) {
      const button = el("button", "panel-nav__item");
      button.type = "button";
      button.append(el("span", "panel-nav__icon", item.icon), el("span", "panel-nav__label", item.title));
      button.addEventListener("click", () => this.callbacks.onNavigate(item.id));
      this.navButtons.set(item.id, button);
      nav.append(button);
    }
    return nav;
  }

  open(target: NavTarget, title: string, content: HTMLElement): void {
    this.titleEl.textContent = title;
    this.bodyEl.replaceChildren(content);
    this.bodyEl.scrollTop = 0;
    for (const [id, button] of this.navButtons) {
      const active = id === target;
      button.classList.toggle("panel-nav__item--active", active);
      if (active) {
        button.setAttribute("aria-current", "page");
        // On phones the list scrolls sideways; keep the current section in view.
        button.scrollIntoView?.({ inline: "center", block: "nearest" });
      } else {
        button.removeAttribute("aria-current");
      }
    }
    this.overlay.classList.add("panel-overlay--open");
    this.overlay.removeAttribute("inert");
    this.dialog.scrollTop = 0;
    const wasOpen = this.isOpen;
    this.isOpen = true;
    if (!wasOpen) this.callbacks.onOpenChange(true);
    this.closeButton.focus();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.remove("panel-overlay--open");
    this.overlay.setAttribute("inert", "");
    this.callbacks.onOpenChange(false);
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }
}
