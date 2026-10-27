import Phaser from "phaser";
import { eventBus } from "./eventBus";

export type InteractionType = "door" | "npc" | "object";

/**
 * Generic contract every interactable world object implements. The scene
 * never special-cases "the About door" vs "the Experience door" — it only
 * talks to this interface, so adding another interactable is a Tiled +
 * activate() concern, not new engine logic.
 */
export interface Interactable {
  id: string;
  prompt: string;
  interactionType: InteractionType;
  /** Distance from the player's body to this object when in range (0 = overlapping), otherwise null. */
  rangeDistance(playerBounds: Phaser.Geom.Rectangle): number | null;
  activate(): void;
  onEnterRange?(): void;
  onExitRange?(): void;
}

export class InteractionSystem {
  private interactables: Interactable[] = [];
  private current: Interactable | null = null;
  private enabled = true;

  register(item: Interactable): void {
    this.interactables.push(item);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) this.clearCurrent();
  }

  update(playerBounds: Phaser.Geom.Rectangle, spacePressed: boolean): void {
    if (!this.enabled) return;

    let nearest: Interactable | null = null;
    let nearestDist = Infinity;
    for (const item of this.interactables) {
      const dist = item.rangeDistance(playerBounds);
      if (dist !== null && dist < nearestDist) {
        nearest = item;
        nearestDist = dist;
      }
    }

    if (nearest !== this.current) {
      this.current?.onExitRange?.();
      this.current = nearest;
      this.current?.onEnterRange?.();
      eventBus.emit("interaction:prompt", { visible: !!nearest, label: nearest?.prompt });
    }

    if (nearest && spacePressed) {
      nearest.activate();
    }
  }

  private clearCurrent(): void {
    if (this.current) {
      this.current.onExitRange?.();
      this.current = null;
      eventBus.emit("interaction:prompt", { visible: false });
    }
  }
}
