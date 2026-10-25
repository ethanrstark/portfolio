import { aboutInfo } from "@/portfolio/data/about";
import { links } from "@/portfolio/data/links";
import { LINK_ICONS } from "@/ui/panels/sectionContent";
import { NAV_ITEMS, type NavTarget } from "@/ui/navigation/navItems";
import { el, moveFocusWithArrows, trapTabKey, typewriter } from "@/ui/utils";

/** Stitch's idle frame, found by name so the portrait follows whatever art is in the characters folder. */
const portraits = import.meta.glob("/src/assets/characters/stitch/**/idle_south_1.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const PORTRAIT_URL = Object.values(portraits)[0];

const CONTROLS: { keys: string[]; action: string }[] = [
  { keys: ["←", "↑", "↓", "→"], action: "Walk around" },
  { keys: ["Shift"], action: "Hold to run" },
  { keys: ["Space"], action: "Enter a building" },
  { keys: ["Esc"], action: "Close a window" },
];

/**
 * The persistent Menu button and the screen it opens. On first load it opens
 * itself as the landing page — a greeting, the way to every section, and the
 * controls — so the portfolio can be read without ever playing the game.
 * The same screen comes back whenever the visitor presses Menu or Home.
 */
export class MainMenu {
  private button: HTMLButtonElement;
  private overlay: HTMLDivElement;
  private dialog: HTMLDivElement;
  private speech: HTMLParagraphElement;
  private startButton: HTMLButtonElement;
  private finishTyping: () => void = () => {};
  private isOpen = false;

  constructor(
    root: HTMLElement,
    private onOpenTarget: (target: NavTarget) => void,
    private onOpenChange: (open: boolean) => void,
  ) {
    this.button = el("button", "hud-button");
    this.button.type = "button";
    this.button.setAttribute("aria-label", "Open the main menu");
    this.button.append(el("span", "hud-button__bars"), el("span", "hud-button__label", "Menu"));
    this.button.addEventListener("click", () => this.open(false));

    this.overlay = el("div", "menu-overlay");
    this.overlay.setAttribute("inert", "");
    this.dialog = el("div", "menu-dialog frame");
    this.dialog.setAttribute("role", "dialog");
    this.dialog.setAttribute("aria-modal", "true");
    this.dialog.setAttribute("aria-labelledby", "menu-title");
    this.speech = el("p", "menu-dialog__speech");
    this.startButton = el("button", "btn btn--gold menu-dialog__start", "▶  Start Exploring");
    this.startButton.type = "button";
    this.startButton.addEventListener("click", () => this.close());
    this.buildContent();

    this.overlay.append(this.dialog);
    root.append(this.button, this.overlay);

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.dialog.addEventListener("keydown", (e) => {
      trapTabKey(e, this.dialog);
      moveFocusWithArrows(e, this.menuButtons());
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  /** `greet` plays the welcome dialogue; reopening from the Menu button skips straight to the full text. */
  open(greet: boolean): void {
    this.isOpen = true;
    this.overlay.classList.add("menu-overlay--open");
    this.overlay.removeAttribute("inert");
    this.button.classList.add("hud-button--active");
    this.startButton.textContent = greet ? "▶  Start Exploring" : "▶  Return to the Game";
    this.finishTyping();
    this.finishTyping = typewriter(this.speech, aboutInfo.intro, greet);
    this.onOpenChange(true);
    this.dialog.scrollTop = 0;
    this.startButton.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.finishTyping();
    this.overlay.classList.remove("menu-overlay--open");
    this.overlay.setAttribute("inert", "");
    this.button.classList.remove("hud-button--active");
    this.onOpenChange(false);
    this.button.focus({ preventScroll: true });
  }

  private menuButtons(): HTMLElement[] {
    return [this.startButton, ...this.dialog.querySelectorAll<HTMLElement>(".menu-item")];
  }

  private buildContent(): void {
    const title = el("header", "menu-dialog__title");
    title.append(el("p", "menu-dialog__eyebrow", "Welcome to"));
    const heading = el("h2", "menu-dialog__heading", "Stitch's World");
    heading.id = "menu-title";
    title.append(heading);

    const talk = el("section", "menu-dialog__talk");
    talk.setAttribute("aria-label", "Introduction");
    if (PORTRAIT_URL) {
      const portrait = el("div", "portrait frame frame--hud");
      const image = el("img", "portrait__image");
      image.src = PORTRAIT_URL;
      image.alt = "";
      portrait.append(image);
      talk.append(portrait);
    }
    const bubble = el("div", "speech frame frame--card");
    const nameplate = el("p", "speech__name");
    nameplate.append(el("strong", undefined, aboutInfo.name), el("span", undefined, ` — ${aboutInfo.tagline}`));
    this.speech.setAttribute("aria-live", "off");
    // Clicking the bubble finishes the line at once.
    bubble.addEventListener("click", () => this.finishTyping());
    bubble.append(nameplate, this.speech);
    talk.append(bubble);

    const choices = el("section", "menu-dialog__choices");
    choices.append(el("h3", "menu-dialog__subheading", "Where to?"));
    const list = el("div", "menu-list");
    for (const item of NAV_ITEMS) {
      const choice = el("button", "menu-item");
      choice.type = "button";
      choice.append(el("span", "menu-item__icon", item.icon));
      const text = el("span", "menu-item__text");
      text.append(el("span", "menu-item__title", item.title), el("span", "menu-item__blurb", item.blurb));
      choice.append(text);
      choice.addEventListener("click", () => this.onOpenTarget(item.id));
      list.append(choice);
    }
    choices.append(list);

    const controls = el("section", "menu-dialog__controls");
    controls.append(el("h3", "menu-dialog__subheading", "Controls"));
    const legend = el("dl", "controls");
    for (const control of CONTROLS) {
      const row = el("div", "controls__row");
      const keys = el("dt", "controls__keys");
      for (const key of control.keys) keys.append(el("kbd", "keycap", key));
      row.append(keys, el("dd", "controls__action", control.action));
      legend.append(row);
    }
    controls.append(legend);
    controls.append(el("p", "controls__note", "Not in the mood to walk? Every section is one click away, any time, from the Menu button. You can also click the map or the ground."));

    const footer = el("footer", "menu-dialog__footer");
    footer.append(this.startButton);
    if (links.length) {
      const quick = el("div", "menu-dialog__links");
      for (const link of links) {
        const a = el("a", "btn btn--wood btn--square", LINK_ICONS[link.kind]);
        a.href = link.url;
        a.title = link.label;
        a.setAttribute("aria-label", link.label);
        if (link.kind !== "email") {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        quick.append(a);
      }
      footer.append(quick);
    }

    this.dialog.append(title, talk, choices, controls, footer);
  }
}
