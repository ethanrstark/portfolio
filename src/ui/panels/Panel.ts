import { el } from "@/ui/utils";

/**
 * Generic modal shell shared by every portfolio panel (About, Education,
 * Experience, Skills, Links, Resume, Projects). Content is supplied by the
 * caller as a freshly-built element, so this file never needs to know about
 * portfolio data shapes.
 */
export class Panel {
  private overlay: HTMLDivElement;
  private dialog: HTMLDivElement;
  private titleEl: HTMLHeadingElement;
  private bodyEl: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private isOpen = false;

  constructor(root: HTMLElement, private onOpenChange: (open: boolean) => void) {
    this.overlay = el("div", "panel-overlay");
    this.dialog = el("div", "panel-dialog");
    this.dialog.setAttribute("role", "dialog");
    this.dialog.setAttribute("aria-modal", "true");

    const header = el("div", "panel-dialog__header");
    this.titleEl = el("h2", "panel-dialog__title");
    this.closeButton = el("button", "panel-dialog__close", "✕");
    this.closeButton.setAttribute("aria-label", "Close panel");
    this.closeButton.addEventListener("click", () => this.close());
    header.append(this.titleEl, this.closeButton);

    this.bodyEl = el("div", "panel-dialog__body");

    this.dialog.append(header, this.bodyEl);
    this.overlay.append(this.dialog);
    root.append(this.overlay);

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  open(title: string, content: HTMLElement): void {
    this.titleEl.textContent = title;
    this.bodyEl.replaceChildren(content);
    this.bodyEl.scrollTop = 0;
    this.overlay.classList.add("panel-overlay--open");
    this.isOpen = true;
    this.onOpenChange(true);
    this.closeButton.focus();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.remove("panel-overlay--open");
    this.onOpenChange(false);
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }
}
