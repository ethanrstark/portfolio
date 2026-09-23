import Phaser from "phaser";
import { generatePlaceholderTextures } from "@/game/systems/PlaceholderTextures";
import { createStitchAnimations } from "@/game/entities/Player";

/**
 * Generates all placeholder textures + animations once, then hands off to
 * WorldScene. Kept separate from WorldScene so a future real asset-loading
 * step (this.load.image/spritesheet/audio) has an obvious home.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    generatePlaceholderTextures(this);
    createStitchAnimations(this);
    this.scene.start("World");
  }
}
