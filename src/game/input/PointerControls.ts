import Phaser from "phaser";
import type { DirectionVector } from "./KeyboardControls";

const ARRIVAL_THRESHOLD = 8;

/**
 * Click/tap-to-move: an accessibility-friendly alternative to the arrow
 * keys. Clicking anywhere in the game canvas sets a destination; movement
 * toward it is expressed as the same DirectionVector shape the keyboard
 * produces, so Player doesn't need to know which input source is active.
 * Only listens on the game canvas, so it never competes with the separate
 * HTML/CSS UI layer for clicks.
 */
export class PointerControls {
  private target: Phaser.Math.Vector2 | null = null;

  constructor(scene: Phaser.Scene) {
    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const world = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.target = new Phaser.Math.Vector2(world.x, world.y);
    });
  }

  /** Cancel any pending destination (e.g. the keyboard just took over). */
  cancel(): void {
    this.target = null;
  }

  hasTarget(): boolean {
    return this.target !== null;
  }

  getDirectionToward(playerX: number, playerY: number): DirectionVector {
    if (!this.target) return { x: 0, y: 0 };

    const dx = this.target.x - playerX;
    const dy = this.target.y - playerY;
    if (Math.hypot(dx, dy) <= ARRIVAL_THRESHOLD) {
      this.target = null;
      return { x: 0, y: 0 };
    }

    const x = Math.abs(dx) < 4 ? 0 : dx > 0 ? 1 : -1;
    const y = Math.abs(dy) < 4 ? 0 : dy > 0 ? 1 : -1;
    return { x: x as -1 | 0 | 1, y: y as -1 | 0 | 1 };
  }
}
