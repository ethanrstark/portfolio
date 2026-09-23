import { createRng } from "./rng";
import type {
  BuildingConfig,
  RegionConfig,
  PathConfig,
  WaterBody,
  BridgeConfig,
  DecorationConfig,
  DecorationKind,
  NpcConfig,
} from "./types";

/**
 * Single source of truth for the world layout. Positions here mirror the
 * hand-drawn map sketch: spawn plaza in the center, About/Projects flanking
 * it (clearly visible), Education just to the north (discoverable), and the
 * Experience/Skills/Links/Creative row to the south (requires exploring).
 * Glacier (NW), Mountains (NE), Beach/Lake (SW) and Forest (SE) form the
 * natural boundary regions.
 */

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 3000;

// Just south of the plaza fountain (2000, 1500) — clear of its collision
// footprint so the player never spawns embedded in a static body.
export const SPAWN_POINT = { x: 2000, y: 1580 };

export const BUILDINGS: BuildingConfig[] = [
  {
    id: "building-about",
    sectionId: "about",
    name: "About Me",
    x: 1560,
    y: 1480,
    width: 300,
    height: 240,
    tier: "large",
    theme: "about",
  },
  {
    id: "building-projects",
    sectionId: "projects",
    name: "Projects",
    x: 2440,
    y: 1480,
    width: 300,
    height: 240,
    tier: "large",
    theme: "projects",
  },
  {
    id: "building-education",
    sectionId: "education",
    name: "Education",
    x: 2000,
    y: 1080,
    width: 240,
    height: 200,
    tier: "medium",
    theme: "education",
  },
  {
    id: "building-experience",
    sectionId: "experience",
    name: "Experience",
    x: 1460,
    y: 2100,
    width: 240,
    height: 200,
    tier: "medium",
    theme: "experience",
  },
  {
    id: "building-skills",
    sectionId: "skills",
    name: "Skills",
    x: 1820,
    y: 2220,
    width: 170,
    height: 150,
    tier: "small",
    theme: "skills",
  },
  {
    id: "building-links",
    sectionId: "links",
    name: "Links & Contact",
    x: 2180,
    y: 2220,
    width: 170,
    height: 150,
    tier: "small",
    theme: "links",
  },
  {
    id: "building-creative",
    sectionId: "creative",
    name: "Creative Projects",
    x: 2540,
    y: 2100,
    width: 200,
    height: 170,
    tier: "small",
    theme: "creative",
  },
];

export const REGIONS: RegionConfig[] = [
  { id: "region-glacier", kind: "glacier", label: "Glacier", x: 0, y: 0, width: 950, height: 700 },
  { id: "region-mountains", kind: "mountains", label: "Mountains", x: 3100, y: 0, width: 900, height: 700 },
  { id: "region-beach", kind: "beach", label: "Beach / Lake", x: 0, y: 2250, width: 1050, height: 750 },
  { id: "region-forest", kind: "forest", label: "Forest", x: 2950, y: 2250, width: 1050, height: 750 },
];

export const WATER_BODIES: WaterBody[] = [
  {
    id: "water-lake",
    kind: "lake",
    points: [
      { x: 120, y: 2500 },
      { x: 420, y: 2380 },
      { x: 760, y: 2420 },
      { x: 880, y: 2600 },
      { x: 760, y: 2820 },
      { x: 420, y: 2900 },
      { x: 150, y: 2800 },
      { x: 60, y: 2640 },
    ],
  },
  {
    id: "water-river",
    kind: "river",
    width: 70,
    points: [
      { x: 760, y: 700 },
      { x: 800, y: 980 },
      { x: 720, y: 1260 },
      { x: 780, y: 1560 },
      { x: 740, y: 1860 },
      { x: 660, y: 2150 },
      { x: 560, y: 2380 },
    ],
  },
];

export const BRIDGES: BridgeConfig[] = [
  { id: "bridge-river-main", x: 745, y: 1555, width: 130, height: 56, horizontal: true },
];

export const PATHS: PathConfig[] = [
  {
    id: "path-about",
    width: 56,
    points: [
      { x: 1900, y: 1500 },
      { x: 1780, y: 1500 },
      { x: 1700, y: 1500 },
    ],
  },
  {
    id: "path-projects",
    width: 56,
    points: [
      { x: 2100, y: 1500 },
      { x: 2220, y: 1500 },
      { x: 2300, y: 1500 },
    ],
  },
  {
    id: "path-education",
    width: 50,
    points: [
      { x: 2000, y: 1420 },
      { x: 2000, y: 1300 },
      { x: 2000, y: 1220 },
    ],
  },
  {
    id: "path-south-trunk",
    width: 58,
    points: [
      { x: 2000, y: 1580 },
      { x: 2000, y: 1720 },
      { x: 1960, y: 1860 },
      { x: 1960, y: 1960 },
    ],
  },
  {
    id: "path-experience",
    width: 46,
    points: [
      { x: 1960, y: 1960 },
      { x: 1780, y: 2000 },
      { x: 1620, y: 2040 },
      { x: 1520, y: 2060 },
    ],
  },
  {
    id: "path-skills",
    width: 42,
    points: [
      { x: 1960, y: 1960 },
      { x: 1900, y: 2060 },
      { x: 1860, y: 2160 },
    ],
  },
  {
    id: "path-links",
    width: 42,
    points: [
      { x: 1960, y: 1960 },
      { x: 2040, y: 2060 },
      { x: 2120, y: 2160 },
    ],
  },
  {
    id: "path-creative",
    width: 46,
    points: [
      { x: 1960, y: 1960 },
      { x: 2160, y: 2010 },
      { x: 2340, y: 2050 },
      { x: 2470, y: 2070 },
    ],
  },
  {
    id: "path-beach-spur",
    width: 40,
    points: [
      { x: 1520, y: 2060 },
      { x: 1240, y: 2000 },
      { x: 980, y: 1900 },
      { x: 810, y: 1780 },
      { x: 770, y: 1600 },
    ],
  },
];

const rng = createRng(1337);
function scatter(
  kind: DecorationKind,
  count: number,
  bounds: { x: number; y: number; width: number; height: number },
  idPrefix: string,
  scaleRange: [number, number] = [0.85, 1.15],
): DecorationConfig[] {
  const items: DecorationConfig[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `${idPrefix}-${i}`,
      kind,
      x: bounds.x + rng() * bounds.width,
      y: bounds.y + rng() * bounds.height,
      scale: scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]),
    });
  }
  return items;
}

/** Hand-placed decorations around the spawn plaza and main paths (intentional, not scattered). */
const CURATED_DECORATIONS: DecorationConfig[] = [
  { id: "fountain-spawn", kind: "fountain", x: 2000, y: 1500 },
  { id: "bench-plaza-1", kind: "bench", x: 1900, y: 1590 },
  { id: "bench-plaza-2", kind: "bench", x: 2100, y: 1590 },
  { id: "lamp-plaza-1", kind: "lamp", x: 1870, y: 1440 },
  { id: "lamp-plaza-2", kind: "lamp", x: 2130, y: 1440 },
  { id: "lamp-about-1", kind: "lamp", x: 1650, y: 1560 },
  { id: "lamp-projects-1", kind: "lamp", x: 2350, y: 1560 },
  { id: "sign-hub", kind: "sign", x: 1960, y: 1780, label: "Explore →" },
  { id: "sign-beach", kind: "sign", x: 1220, y: 1980, label: "Beach" },
  { id: "lamp-south-1", kind: "lamp", x: 1900, y: 2000 },
  { id: "lamp-south-2", kind: "lamp", x: 2040, y: 2000 },
  { id: "bench-south-1", kind: "bench", x: 2000, y: 2040 },
];

export const DECORATIONS: DecorationConfig[] = [
  ...CURATED_DECORATIONS,
  ...scatter("flower", 24, { x: 1750, y: 1350, width: 500, height: 350 }, "flower-plaza"),
  ...scatter("tree", 14, { x: 1350, y: 1250, width: 1300, height: 120 }, "tree-north-row"),
  ...scatter("tree", 10, { x: 1200, y: 1780, width: 200, height: 500 }, "tree-west-belt"),
  ...scatter("tree", 10, { x: 2600, y: 1780, width: 200, height: 500 }, "tree-east-belt"),
  ...scatter("bush", 16, { x: 1400, y: 1750, width: 1200, height: 400 }, "bush-mid"),
  ...scatter("rock", 10, { x: 1000, y: 700, width: 2000, height: 1600 }, "rock-field"),
  ...scatter("pine", 60, { x: 3000, y: 2300, width: 950, height: 650 }, "pine-forest"),
  ...scatter("bush", 20, { x: 3000, y: 2300, width: 950, height: 650 }, "bush-forest"),
  ...scatter("rock", 26, { x: 3150, y: 60, width: 800, height: 600 }, "rock-mountains"),
  ...scatter("rock", 18, { x: 40, y: 40, width: 850, height: 600 }, "rock-glacier"),
  ...scatter("flower", 14, { x: 200, y: 2100, width: 700, height: 150 }, "flower-beach"),
];

export const NPCS: NpcConfig[] = [
  { id: "npc-villager-1", x: 1920, y: 1680, color: 0xe6a87a, wanderRange: 60 },
  { id: "npc-villager-2", x: 2260, y: 1640, color: 0x8ec9e0, wanderRange: 50 },
  { id: "npc-villager-3", x: 1780, y: 2260, color: 0xc9a7e0, wanderRange: 0 },
];
