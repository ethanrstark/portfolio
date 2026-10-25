import Phaser from "phaser";
import { preloadRealAssets, createSparkleAnimation } from "@/game/systems/AssetManifest";
import { createStitchAnimations } from "@/game/entities/Player";
import { createTileAnimations, preloadTiledAssets, registerTiledMap } from "@/game/systems/TiledAssets";

/**
 * Loads Stitch/UI art and the Tiled map's tilesets, registers the map and
 * builds every animation, then hands off to WorldScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    preloadRealAssets(this);
    preloadTiledAssets(this);
  }

  create(): void {
    registerTiledMap(this);
    createTileAnimations(this);
    createStitchAnimations(this);
    createSparkleAnimation(this);
    this.scene.start("World");
  }
}
