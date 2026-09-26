/**
 * Centralized texture/asset keys. Every consumer (Player, Building,
 * DecorationPlacer, ...) only ever references these constants, never a raw
 * file path — so which pieces are real art vs. procedurally generated
 * placeholders (see PlaceholderTextures.ts / AssetManifest.ts) never leaks
 * into game logic.
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
  terrain: {
    grass: "terrain-grass",
    path: "terrain-path",
    sand: "terrain-sand",
    water: "terrain-water",
    snow: "terrain-snow",
    stone: "terrain-stone",
  },
  buildings: {
    variant1: "building-1",
    variant2: "building-2",
  },
  decorations: {
    // Real tree/bush art comes in several species/sizes; DecorationPlacer
    // picks one per-instance from these pools (baked into world data at
    // generation time so placement stays deterministic).
    treeVariants: [
      "tree-oak-lg",
      "tree-oak-md",
      "tree-oak-sm",
      "tree-birch-lg",
      "tree-birch-md",
      "tree-birch-sm",
      "tree-apple-lg",
      "tree-apple-md",
      "tree-apple-sm",
    ],
    bushVariants: ["bush-reg-sm", "bush-reg-md", "bush-reg-lg"],
    flowerVariants: ["flowerbush-1", "flowerbush-2", "flowerbush-3", "flowerbush-4"],
    rock: "deco-rock",
    bench: "deco-bench",
    lamp: "deco-lamp",
    sign: "deco-sign",
    fountain: "deco-fountain",
    bridge: "deco-bridge",
  },
  npc: {
    base: "npc-base",
  },
  ui: {
    sparkle: Array.from({ length: 6 }, (_, i) => `ui-sparkle-${i}`),
  },
} as const;
