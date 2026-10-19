export const STITCH_ACTIONS = ["idle", "walk", "run"] as const;
export const STITCH_DIRECTIONS = ["north", "east", "south", "west"] as const;

export type StitchAction = (typeof STITCH_ACTIONS)[number];
export type FacingDirection = (typeof STITCH_DIRECTIONS)[number];

/** Texture key for one frame of Stitch's art; `frame` is the 1-based number in the file name. */
export const stitchFrameKey = (action: StitchAction, dir: FacingDirection, frame: number) =>
  `stitch-${action}-${dir}-${frame}`;

/** Animation key for one action/direction pair. */
export const stitchAnimationKey = (action: StitchAction, dir: FacingDirection) => `stitch-${action}-${dir}`;

/**
 * Centralized texture/asset keys for the hand-loaded art (UI, plus Stitch's
 * key helpers above). World art comes from the Tiled map's tilesets instead
 * — see TiledAssets.ts.
 */
export const AssetKeys = {
  ui: {
    sparkle: Array.from({ length: 6 }, (_, i) => `ui-sparkle-${i}`),
  },
} as const;
