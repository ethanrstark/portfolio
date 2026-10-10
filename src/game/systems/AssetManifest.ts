import Phaser from "phaser";
import { AssetKeys } from "./AssetKeys";

/**
 * Wires real art files (dropped under src/assets/...) to the AssetKeys the
 * rest of the game references. Uses Vite's import.meta.glob so new files
 * dropped into an already-globbed folder are picked up automatically —
 * adding a real asset never requires touching this file's glob patterns,
 * only (if it's a brand-new category) the small `pick()` list below.
 *
 * Stitch's final animated sprite isn't ready yet, so a generic placeholder
 * character (src/assets/characters/stitch/placeholder/) stands in for it.
 * Swapping in the real Stitch later means replacing the files this globs
 * over — no code changes needed as long as the frame counts match
 * AssetKeys.stitch (4 idle / 6 run frames per direction).
 */

const stitchPlaceholder = import.meta.glob("/src/assets/characters/stitch/placeholder/*.png", {
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

  // Stitch placeholder character.
  const idleFileFor: Record<"down" | "up" | "left" | "right", string> = {
    down: "idle_front",
    up: "idle_back",
    left: "idle_left",
    right: "idle_right",
  };
  const runFileFor: Record<"down" | "up" | "left" | "right", string> = {
    down: "run_forward",
    up: "run_backward",
    left: "run_left",
    right: "run_right",
  };
  for (const dir of ["down", "up", "left", "right"] as const) {
    AssetKeys.stitch.idle[dir].forEach((key, i) => {
      add(key, pick(stitchPlaceholder, `${idleFileFor[dir]}_000${i + 1}.png`));
    });
    AssetKeys.stitch.run[dir].forEach((key, i) => {
      add(key, pick(stitchPlaceholder, `${runFileFor[dir]}_000${i + 1}.png`));
    });
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
