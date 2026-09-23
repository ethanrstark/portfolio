/**
 * Centralized texture/asset keys. Phase 1 generates all of these as
 * placeholder textures at runtime (see PlaceholderTextures.ts) instead of
 * loading image files. To swap in real art later: drop files under
 * src/assets/... matching these names, load them in BootScene with
 * `this.load.image(key, path)` / `this.load.spritesheet(...)`, and delete
 * the matching generator call — no other code needs to change because
 * every consumer only ever references these keys.
 */
export const AssetKeys = {
  stitch: {
    down: "stitch-down",
    downStep: "stitch-down-step",
    up: "stitch-up",
    upStep: "stitch-up-step",
    left: "stitch-left",
    leftStep: "stitch-left-step",
    right: "stitch-right",
    rightStep: "stitch-right-step",
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
    about: "building-about",
    projects: "building-projects",
    education: "building-education",
    experience: "building-experience",
    skills: "building-skills",
    links: "building-links",
    creative: "building-creative",
  },
  decorations: {
    tree: "deco-tree",
    pine: "deco-pine",
    bush: "deco-bush",
    flower: "deco-flower",
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
    sparkle: "ui-sparkle",
  },
} as const;
