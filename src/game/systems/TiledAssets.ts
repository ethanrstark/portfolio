import Phaser from "phaser";
import { TILED_MAP, type TiledTileset } from "@/game/world/tiledWorld";

/**
 * Loads the tileset images the Tiled map points at and registers the map
 * itself with Phaser. Each tileset image is found by the path stored in the
 * exported JSON (relative to the repo root, as Tiled wrote it), so moving or
 * adding tilesets in Tiled needs no code change as long as the PNG lives
 * somewhere under src/assets/environment.
 */

const tilesetImages = import.meta.glob("/src/assets/environment/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const MAP_KEY = "village-map";

export function tilesetTextureKey(tilesetName: string): string {
  return `tileset-${tilesetName}`;
}

export function tileAnimationKey(tilesetName: string, localId: number): string {
  return `tile-anim-${tilesetName}-${localId}`;
}

function resolveImageUrl(tileset: TiledTileset): string {
  // Tiled stores the path relative to the map file; strip any leading "../"
  // so "src/assets/..." and "../../src/assets/..." both land on the same file.
  const normalized = "/" + tileset.image.replace(/\\/g, "/").replace(/^(\.\.?\/)+/, "");
  const url = tilesetImages[normalized];
  if (!url) {
    throw new Error(
      `Tileset "${tileset.name}" points at "${tileset.image}", but no such PNG exists under src/assets/environment/.`,
    );
  }
  return url;
}

export function preloadTiledAssets(scene: Phaser.Scene): void {
  for (const tileset of TILED_MAP.tilesets) {
    // Loaded as a spritesheet so the same texture serves both the tilemap
    // layers and individual tile objects (frame index == tile's local id).
    scene.load.spritesheet(tilesetTextureKey(tileset.name), resolveImageUrl(tileset), {
      frameWidth: tileset.tilewidth,
      frameHeight: tileset.tileheight,
    });
  }
}

/** Gives Phaser its own copy of the map data (its parser may modify what it's handed). */
export function registerTiledMap(scene: Phaser.Scene): void {
  scene.cache.tilemap.add(MAP_KEY, {
    format: Phaser.Tilemaps.Formats.TILED_JSON,
    data: structuredClone(TILED_MAP),
  });
}

/**
 * One Phaser animation per animated tile in the tilesets, honoring the
 * per-frame durations authored in Tiled. They're created non-repeating; the
 * caller decides at play time whether to loop (chimney) or play once (doors).
 */
export function createTileAnimations(scene: Phaser.Scene): void {
  const BASE_MS = 100;
  for (const tileset of TILED_MAP.tilesets) {
    for (const tile of tileset.tiles ?? []) {
      if (!tile.animation) continue;
      scene.anims.create({
        key: tileAnimationKey(tileset.name, tile.id),
        frameRate: 1000 / BASE_MS,
        frames: tile.animation.map((f) => ({
          key: tilesetTextureKey(tileset.name),
          frame: f.tileid,
          duration: Math.max(0, f.duration - BASE_MS),
        })),
      });
    }
  }
}
