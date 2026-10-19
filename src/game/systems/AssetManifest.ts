import Phaser from "phaser";
import { AssetKeys, STITCH_ACTIONS, STITCH_DIRECTIONS, stitchFrameKey, type FacingDirection, type StitchAction } from "./AssetKeys";

/**
 * Wires real art files (dropped under src/assets/...) to the AssetKeys the
 * rest of the game references. Uses Vite's import.meta.glob so new files
 * dropped into an already-globbed folder are picked up automatically —
 * adding a real asset never requires touching this file's glob patterns,
 * only (if it's a brand-new category) the small `pick()` list below.
 *
 * Stitch's frames live under src/assets/characters/stitch/ as
 * `<action>/<action>_<direction>_<n>.png` (actions idle/walk/run, directions
 * north/east/south/west, n starting at 1). Every matching file is picked up
 * and each animation uses however many frames exist, so replacing the art
 * never needs code changes as long as the naming and 64x64 frame size hold.
 */

const stitchFrames = import.meta.glob("/src/assets/characters/stitch/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const sparkles = import.meta.glob("/src/assets/ui/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Finds the one glob entry whose path ends with `filename`. */
function pick(map: Record<string, string>, filename: string): string | undefined {
  const path = Object.keys(map).find((p) => p.endsWith(`/${filename}`));
  return path ? map[path] : undefined;
}

const STITCH_FILE = new RegExp(`^(${STITCH_ACTIONS.join("|")})_(${STITCH_DIRECTIONS.join("|")})_(\\d+)\\.png$`);

/** Reads "idle_south_3.png" into its action, direction and frame number; other files are ignored. */
export function parseStitchFrame(path: string): { action: StitchAction; dir: FacingDirection; frame: number } | undefined {
  const match = STITCH_FILE.exec(path.slice(path.lastIndexOf("/") + 1));
  return match ? { action: match[1] as StitchAction, dir: match[2] as FacingDirection, frame: Number(match[3]) } : undefined;
}

export interface ImageAsset {
  key: string;
  url: string;
}

/**
 * Builds the full list of real (key, url) pairs to preload. Any entry whose
 * source file is missing is silently skipped, so a partially finished art
 * drop never breaks the boot sequence.
 */
export function collectRealAssets(): ImageAsset[] {
  const assets: ImageAsset[] = [];
  const add = (key: string, url: string | undefined) => {
    if (url) assets.push({ key, url });
  };

  // Stitch's frames, found by file name.
  for (const [path, url] of Object.entries(stitchFrames)) {
    const parsed = parseStitchFrame(path);
    if (parsed) add(stitchFrameKey(parsed.action, parsed.dir, parsed.frame), url);
  }

  // UI sparkle animation frames.
  AssetKeys.ui.sparkle.forEach((key, i) => {
    add(key, pick(sparkles, `sparkle_000${i + 1}.png`));
  });

  return assets;
}

export function preloadRealAssets(scene: Phaser.Scene): void {
  for (const { key, url } of collectRealAssets()) {
    scene.load.image(key, url);
  }
}

/** The interaction "attraction" sparkle, if the real 6-frame art loaded. */
export function createSparkleAnimation(scene: Phaser.Scene): void {
  if (scene.anims.exists("ui-sparkle-twinkle")) return;
  const frames = AssetKeys.ui.sparkle.filter((key) => scene.textures.exists(key));
  if (frames.length === 0) return;
  scene.anims.create({
    key: "ui-sparkle-twinkle",
    frames: frames.map((key) => ({ key })),
    frameRate: 14,
    repeat: 0,
  });
}
