import Phaser from "phaser";
import { DEPTH } from "@/game/config/gameSettings";
import type { Door } from "@/game/entities/Door";
import { SPAWN_POINT } from "./tiledWorld";

/**
 * Press C to see Arcade Physics' collider outlines (every blocking rectangle
 * from the Tiled map, plus the player) with the door trigger rectangles in
 * cyan and the spawn point as a red cross. A dev-only tool for checking the
 * map's collisions and triggers — not part of the portfolio experience.
 */
export class DebugOverlay {
  private enabled = false;
  private markers: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene, doors: Door[]) {
    this.markers = scene.add.graphics().setDepth(DEPTH.PARTICLES).setVisible(false);

    this.markers.lineStyle(2, 0x00e5ff, 1).fillStyle(0x00e5ff, 0.25);
    for (const door of doors) {
      const b = door.bounds;
      this.markers.fillRect(b.x, b.y, b.width, b.height).strokeRect(b.x, b.y, b.width, b.height);
    }
    this.markers.lineStyle(2, 0xff3355, 1);
    this.markers.lineBetween(SPAWN_POINT.x - 8, SPAWN_POINT.y, SPAWN_POINT.x + 8, SPAWN_POINT.y);
    this.markers.lineBetween(SPAWN_POINT.x, SPAWN_POINT.y - 8, SPAWN_POINT.x, SPAWN_POINT.y + 8);

    scene.add
      .text(8, 8, "Press C: debug overlay", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 4, y: 2 },
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.UI_PROMPT)
      .setAlpha(0.55);

    scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C).on("down", () => this.toggle());
  }

  private toggle(): void {
    this.enabled = !this.enabled;
    this.markers.setVisible(this.enabled);

    const world = this.scene.physics.world;
    world.drawDebug = this.enabled;
    if (!world.debugGraphic) world.createDebugGraphic();
    world.debugGraphic.setVisible(this.enabled);
    if (!this.enabled) world.debugGraphic.clear();
  }
}
