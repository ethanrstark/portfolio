import { eventBus } from "@/game/systems/eventBus";
import { el } from "@/ui/utils";

/** The floating "[SPACE] Explore Projects" prompt shown near the bottom of the screen. */
export class InteractionPrompt {
  private container: HTMLDivElement;
  private label: HTMLSpanElement;

  constructor(root: HTMLElement) {
    this.container = el("div", "interaction-prompt interaction-prompt--hidden");
    const key = el("span", "interaction-prompt__key", "SPACE");
    this.label = el("span", "interaction-prompt__label");
    this.container.append(key, this.label);
    root.appendChild(this.container);

    eventBus.on("interaction:prompt", ({ visible, label }) => this.setVisible(visible, label));
  }

  private setVisible(visible: boolean, label?: string): void {
    if (visible && label) {
      this.label.textContent = label;
      this.container.classList.remove("interaction-prompt--hidden");
    } else {
      this.container.classList.add("interaction-prompt--hidden");
    }
  }
}
