import type { BuildingConfig, RegionConfig, PathConfig, WaterBody, BridgeConfig, DecorationConfig, NpcConfig } from "./types";
import { loadTiledDecorations } from "./tiledDecorations";

/**
 * Single source of truth for the world layout.
 *
 * MVP SCOPE: just the village and its immediate surroundings — the map
 * sketch's four biome corners (glacier/mountains/beach-lake/forest) and
 * their river/lake/bridge are deferred until there's time to do them
 * properly. REGIONS/WATER_BODIES/BRIDGES are kept as empty arrays (not
 * deleted) so TerrainRenderer/DebugOverlay don't need special-casing when
 * that work resumes — an empty array is simply "nothing to draw yet".
 */

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 2000;

// Just south of the plaza fountain — clear of its collision footprint so the
// player never spawns embedded in a static body.
export const SPAWN_POINT = { x: 1200, y: 1000 };

export const BUILDINGS: BuildingConfig[] = [
  {
    id: "building-about",
    sectionId: "about",
    name: "About Me",
    x: 850,
    y: 920,
    width: 260,
    height: 210,
    tier: "large",
    spriteKey: "variant1",
  },
  {
    id: "building-projects",
    sectionId: "projects",
    name: "Projects",
    x: 1550,
    y: 920,
    width: 260,
    height: 210,
    tier: "large",
    spriteKey: "variant2",
  },
  {
    id: "building-education",
    sectionId: "education",
    name: "Education",
    x: 1200,
    y: 600,
    width: 210,
    height: 175,
    tier: "medium",
    spriteKey: "variant1",
  },
  {
    id: "building-experience",
    sectionId: "experience",
    name: "Experience",
    x: 780,
    y: 1420,
    width: 210,
    height: 175,
    tier: "medium",
    spriteKey: "variant2",
  },
  {
    id: "building-skills",
    sectionId: "skills",
    name: "Skills",
    x: 1050,
    y: 1500,
    width: 150,
    height: 130,
    tier: "small",
    spriteKey: "variant1",
  },
  {
    id: "building-links",
    sectionId: "links",
    name: "Links & Contact",
    x: 1350,
    y: 1500,
    width: 150,
    height: 130,
    tier: "small",
    spriteKey: "variant2",
  },
  {
    id: "building-creative",
    sectionId: "creative",
    name: "Creative Projects",
    x: 1620,
    y: 1420,
    width: 175,
    height: 150,
    tier: "small",
    spriteKey: "variant1",
  },
];

// Deferred until the biome-corners pass — see the module comment above.
export const REGIONS: RegionConfig[] = [];
export const WATER_BODIES: WaterBody[] = [];
export const BRIDGES: BridgeConfig[] = [];

export const PATHS: PathConfig[] = [
  {
    id: "path-about",
    width: 56,
    points: [
      { x: 1100, y: 1000 },
      { x: 1000, y: 1000 },
      { x: 930, y: 1000 },
    ],
  },
  {
    id: "path-projects",
    width: 56,
    points: [
      { x: 1300, y: 1000 },
      { x: 1400, y: 1000 },
      { x: 1470, y: 1000 },
    ],
  },
  {
    id: "path-education",
    width: 50,
    points: [
      { x: 1200, y: 920 },
      { x: 1200, y: 800 },
      { x: 1200, y: 710 },
    ],
  },
  {
    id: "path-south-trunk",
    width: 58,
    points: [
      { x: 1200, y: 1080 },
      { x: 1200, y: 1220 },
      { x: 1170, y: 1340 },
      { x: 1170, y: 1420 },
    ],
  },
  {
    id: "path-experience",
    width: 46,
    points: [
      { x: 1170, y: 1420 },
      { x: 1020, y: 1440 },
      { x: 900, y: 1460 },
      { x: 800, y: 1470 },
    ],
  },
  {
    id: "path-skills",
    width: 42,
    points: [
      { x: 1170, y: 1420 },
      { x: 1110, y: 1460 },
      { x: 1070, y: 1510 },
    ],
  },
  {
    id: "path-links",
    width: 42,
    points: [
      { x: 1170, y: 1420 },
      { x: 1250, y: 1460 },
      { x: 1310, y: 1510 },
    ],
  },
  {
    id: "path-creative",
    width: 46,
    points: [
      { x: 1170, y: 1420 },
      { x: 1350, y: 1450 },
      { x: 1500, y: 1470 },
      { x: 1600, y: 1450 },
    ],
  },
];

/**
 * Hand-placed landmark props around the spawn plaza and path forks. Bulk
 * "natural" decoration (trees/bushes/flowers/grass) is no longer scattered
 * procedurally — see tiledDecorations.ts — this list stays small and
 * intentional on purpose.
 */
const CURATED_DECORATIONS: DecorationConfig[] = [
  { id: "fountain-spawn", kind: "fountain", x: 1200, y: 920 },
  { id: "bench-plaza-1", kind: "bench", x: 1120, y: 1010 },
  { id: "bench-plaza-2", kind: "bench", x: 1280, y: 1010 },
  { id: "lamp-plaza-1", kind: "lamp", x: 1090, y: 880 },
  { id: "lamp-plaza-2", kind: "lamp", x: 1310, y: 880 },
  { id: "lamp-about-1", kind: "lamp", x: 940, y: 1000 },
  { id: "lamp-projects-1", kind: "lamp", x: 1460, y: 1000 },
  { id: "sign-hub", kind: "sign", x: 1170, y: 1260, label: "Explore →" },
  { id: "lamp-south-1", kind: "lamp", x: 1140, y: 1380 },
  { id: "lamp-south-2", kind: "lamp", x: 1220, y: 1380 },
  { id: "bench-south-1", kind: "bench", x: 1180, y: 1400 },
];

/**
 * Bulk decoration (trees/bushes/flowers/grass tufts) hand-placed in Tiled.
 * Drop the exported map at src/assets/tiled/village.json and it's picked up
 * automatically; until then this resolves to an empty array and the world
 * just has the curated landmarks above.
 */
const TILED_DECORATIONS: DecorationConfig[] = loadTiledDecorations();

export const DECORATIONS: DecorationConfig[] = [...CURATED_DECORATIONS, ...TILED_DECORATIONS];

export const NPCS: NpcConfig[] = [
  { id: "npc-villager-1", x: 1150, y: 1060, color: 0xe6a87a, wanderRange: 50 },
  { id: "npc-villager-2", x: 1350, y: 1040, color: 0x8ec9e0, wanderRange: 40 },
  { id: "npc-villager-3", x: 1030, y: 1460, color: 0xc9a7e0, wanderRange: 0 },
];
