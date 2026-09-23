import Phaser from "phaser";
import { eventBus } from "./eventBus";

export type InteractionType = "building" | "npc" | "object";

/**
 * Generic contract every interactable world object implements. The scene
 * never special-cases "the About building" vs "the Projects building" — it
 * only ever talks to this interface, so adding a new interactable building
 * is a data + activate() concern, not new engine logic.
 */
export interface Interactable {
  id: string;
  x: number;
  y: number;
  radius: number;
  interactionType: InteractionType;
  prompt: string;
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

  update(playerX: number, playerY: number, spacePressed: boolean): void {
    if (!this.enabled) return;

    let nearest: Interactable | null = null;
    let nearestDist = Infinity;
    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(playerX, playerY, item.x, item.y);
      if (dist <= item.radius && dist < nearestDist) {
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
