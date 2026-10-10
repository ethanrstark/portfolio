/**
 * Centralized texture/asset keys for the hand-loaded art (Stitch and UI).
 * World art comes from the Tiled map's tilesets instead — see TiledAssets.ts.
 */
export const AssetKeys = {
  stitch: {
    idle: {
      down: ["stitch-idle-down-0", "stitch-idle-down-1", "stitch-idle-down-2", "stitch-idle-down-3"],
      up: ["stitch-idle-up-0", "stitch-idle-up-1", "stitch-idle-up-2", "stitch-idle-up-3"],
      left: ["stitch-idle-left-0", "stitch-idle-left-1", "stitch-idle-left-2", "stitch-idle-left-3"],
      right: ["stitch-idle-right-0", "stitch-idle-right-1", "stitch-idle-right-2", "stitch-idle-right-3"],
    },
    run: {
      down: Array.from({ length: 6 }, (_, i) => `stitch-run-down-${i}`),
      up: Array.from({ length: 6 }, (_, i) => `stitch-run-up-${i}`),
      left: Array.from({ length: 6 }, (_, i) => `stitch-run-left-${i}`),
      right: Array.from({ length: 6 }, (_, i) => `stitch-run-right-${i}`),
    },
  },
  ui: {
    sparkle: Array.from({ length: 6 }, (_, i) => `ui-sparkle-${i}`),
  },
} as const;
