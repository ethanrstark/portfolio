import type { SectionId } from "@/portfolio/data/types";

export type BuildingTier = "large" | "medium" | "small";

export interface BuildingConfig {
  id: string;
  sectionId: SectionId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tier: BuildingTier;
  /** Which shared building sprite to use (AssetKeys.buildings.*) — reused across slots. */
  spriteKey: "variant1" | "variant2";
}

export type RegionKind = "glacier" | "mountains" | "beach" | "forest";

export interface RegionConfig {
  id: string;
  kind: RegionKind;
  label: string;
  /** Axis-aligned bounding box used for both rendering and boundary collision. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PathConfig {
  id: string;
  /** Ordered waypoints; rendered as a smoothed ribbon, purely decorative (non-blocking). */
  points: { x: number; y: number }[];
  width: number;
}

export interface WaterBody {
  id: string;
  kind: "lake" | "river";
  points: { x: number; y: number }[];
  width?: number; // river ribbon width; lake uses points as a polygon
}

export interface BridgeConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** true = horizontal deck (crosses a vertical river), false = vertical deck */
  horizontal: boolean;
}

export type DecorationKind =
  | "tree"
  | "pine"
  | "bush"
  | "flower"
  | "grassTuft"
  | "rock"
  | "bench"
  | "lamp"
  | "sign"
  | "fountain";

export interface DecorationConfig {
  id: string;
  kind: DecorationKind;
  x: number;
  y: number;
  /** Optional uniform scale for size variation. */
  scale?: number;
  /** Sign decorations can carry a short label. */
  label?: string;
  /**
   * Explicit texture key, chosen at generation time (e.g. a random species/
   * size for tree|pine|bush|flower). Falls back to the kind's single default
   * texture in DecorationPlacer when omitted.
   */
  textureKey?: string;
}

export interface NpcConfig {
  id: string;
  x: number;
  y: number;
  color: number;
  /** Horizontal patrol half-distance; 0 = stationary idle NPC. */
  wanderRange?: number;
}
