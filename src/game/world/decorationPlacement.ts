import { createRng } from "./rng";
import { distanceToPolyline, distanceToPolygonEdge, pointInPolygon, pointInAABB } from "./geometry";
import type {
  BuildingConfig,
  PathConfig,
  BridgeConfig,
  WaterBody,
  RegionConfig,
  DecorationConfig,
  DecorationKind,
} from "./types";

/**
 * Keep-clear margins beyond each obstacle's own visual edge. Exported so the
 * debug overlay (press C in-game) draws exactly the zones scatter() actually
 * respects, instead of a second guess at the same numbers.
 */
export const EXCLUSION_MARGIN = {
  path: 14,
  building: 24,
  bridge: 20,
  water: 12,
} as const;

/** Approximate footprint radius per decoration kind, used for spacing between placed props. */
const FOOTPRINT_RADIUS: Record<DecorationKind, number> = {
  tree: 26,
  pine: 26,
  bush: 16,
  flower: 8,
  grassTuft: 10,
  rock: 14,
  bench: 20,
  lamp: 10,
  sign: 14,
  fountain: 40,
};

/** Kinds allowed to spawn inside the opaque glacier/mountain/beach ground overlays. */
const REGION_EXEMPT_KINDS: DecorationKind[] = ["rock"];

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScatterOptions {
  scaleRange?: [number, number];
  variants?: readonly string[];
}

export interface WorldGeometry {
  buildings: BuildingConfig[];
  paths: PathConfig[];
  bridges: BridgeConfig[];
  water: WaterBody[];
  regions: RegionConfig[];
}

/**
 * Builds a scatter() function bound to one shared RNG and one shared
 * "already placed" registry, so every call — across every biome — avoids
 * paths, buildings, bridges, water, the opaque region overlays, and props
 * placed by earlier calls (including hand-placed CURATED_DECORATIONS, once
 * seeded in). A point that can't find a valid spot after a bounded number of
 * attempts is simply skipped rather than forced somewhere it shouldn't be.
 */
export function createDecorationScatter(geometry: WorldGeometry, seed: number) {
  const rng = createRng(seed);
  const placed: { x: number; y: number; radius: number }[] = [];
  const MAX_ATTEMPTS = 40;

  function isNearAnyPath(x: number, y: number): boolean {
    for (const path of geometry.paths) {
      if (distanceToPolyline(x, y, path.points) < path.width / 2 + EXCLUSION_MARGIN.path) return true;
    }
    return false;
  }

  function isNearAnyBuilding(x: number, y: number): boolean {
    for (const b of geometry.buildings) {
      const box = {
        left: b.x - b.width / 2 - EXCLUSION_MARGIN.building,
        right: b.x + b.width / 2 + EXCLUSION_MARGIN.building,
        top: b.y - b.height - EXCLUSION_MARGIN.building,
        bottom: b.y + EXCLUSION_MARGIN.building,
      };
      if (pointInAABB(x, y, box)) return true;
    }
    return false;
  }

  function isNearAnyBridge(x: number, y: number): boolean {
    for (const br of geometry.bridges) {
      const w = br.horizontal ? br.width : br.height;
      const h = br.horizontal ? br.height : br.width;
      const box = {
        left: br.x - w / 2 - EXCLUSION_MARGIN.bridge,
        right: br.x + w / 2 + EXCLUSION_MARGIN.bridge,
        top: br.y - h / 2 - EXCLUSION_MARGIN.bridge,
        bottom: br.y + h / 2 + EXCLUSION_MARGIN.bridge,
      };
      if (pointInAABB(x, y, box)) return true;
    }
    return false;
  }

  function isInAnyWater(x: number, y: number): boolean {
    for (const body of geometry.water) {
      if (body.kind === "lake") {
        if (pointInPolygon(x, y, body.points)) return true;
        if (distanceToPolygonEdge(x, y, body.points) < EXCLUSION_MARGIN.water) return true;
      } else {
        const radius = (body.width ?? 60) / 2 + EXCLUSION_MARGIN.water;
        if (distanceToPolyline(x, y, body.points) < radius) return true;
      }
    }
    return false;
  }

  function isInOpaqueRegion(x: number, y: number, kind: DecorationKind): boolean {
    if (REGION_EXEMPT_KINDS.includes(kind)) return false;
    for (const region of geometry.regions) {
      if (region.kind === "forest") continue; // forest is a tint, not an opaque overlay
      if (pointInAABB(x, y, { left: region.x, right: region.x + region.width, top: region.y, bottom: region.y + region.height })) {
        return true;
      }
    }
    return false;
  }

  function isTooCloseToPlaced(x: number, y: number, radius: number): boolean {
    for (const p of placed) {
      const minDist = (radius + p.radius) * 0.55;
      if (Math.hypot(x - p.x, y - p.y) < minDist) return true;
    }
    return false;
  }

  function isValid(x: number, y: number, kind: DecorationKind, radius: number): boolean {
    return (
      !isNearAnyPath(x, y) &&
      !isNearAnyBuilding(x, y) &&
      !isNearAnyBridge(x, y) &&
      !isInAnyWater(x, y) &&
      !isInOpaqueRegion(x, y, kind) &&
      !isTooCloseToPlaced(x, y, radius)
    );
  }

  /** Registers pre-existing (usually hand-placed) points so later scatter() calls steer clear of them. */
  function seed_(points: { x: number; y: number; kind: DecorationKind }[]): void {
    for (const p of points) {
      placed.push({ x: p.x, y: p.y, radius: FOOTPRINT_RADIUS[p.kind] });
    }
  }

  function scatter(
    kind: DecorationKind,
    count: number,
    bounds: Bounds,
    idPrefix: string,
    options: ScatterOptions = {},
  ): DecorationConfig[] {
    const { scaleRange = [0.85, 1.15], variants } = options;
    const radius = FOOTPRINT_RADIUS[kind];
    const items: DecorationConfig[] = [];

    for (let i = 0; i < count; i++) {
      let placedOk = false;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const x = bounds.x + rng() * bounds.width;
        const y = bounds.y + rng() * bounds.height;
        if (!isValid(x, y, kind, radius)) continue;

        items.push({
          id: `${idPrefix}-${i}`,
          kind,
          x,
          y,
          scale: scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]),
          textureKey: variants ? variants[Math.floor(rng() * variants.length)] : undefined,
        });
        placed.push({ x, y, radius });
        placedOk = true;
        break;
      }
      // Attempts exhausted (area too crowded/constrained) — skip this one
      // instance rather than force a bad placement.
      if (!placedOk) continue;
    }

    return items;
  }

  return { scatter, seed: seed_ };
}
