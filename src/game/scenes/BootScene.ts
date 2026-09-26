import Phaser from "phaser";
import { generatePlaceholderTextures } from "@/game/systems/PlaceholderTextures";
import { preloadRealAssets, createSparkleAnimation } from "@/game/systems/AssetManifest";
import { createStitchAnimations } from "@/game/entities/Player";

/**
 * Loads real art (whatever exists under src/assets/...), generates
 * placeholder textures for anything that doesn't have real art yet, builds
 * every animation, then hands off to WorldScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    preloadRealAssets(this);
  }

  create(): void {
    generatePlaceholderTextures(this);
    createStitchAnimations(this);
    createSparkleAnimation(this);
    this.scene.start("World");
  }
}
