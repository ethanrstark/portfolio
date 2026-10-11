import mapJson from "../../../portfolio_map.json";
import type { SectionId } from "@/portfolio/data/types";
import { SECTIONS } from "@/portfolio/sections";

/**
 * Pure-data view of the Tiled map (no Phaser): everything the game needs to
 * know about the world, parsed once from the exported JSON. Re-exporting
 * the map from Tiled to the same path is all it takes to update the game.
 *
 * Conventions this reads (see the layer names in Tiled):
 *  - Top-level tile layers "Grass", "Paths", "Water" -> the ground.
 *  - Object layers under the "Collisions" group -> blocking rectangles.
 *    (Tiles whose tileset entry has collision shapes also block; e.g. shore.)
 *  - Everything under the "Buildings" group is drawn as sprites sorted by y.
 *    Layers named like "Ground"/"Shadow" sit under the player at all times;
 *    layers named like "Fence" sort tile by tile; everything else (house,
 *    door, chimney, tent, signs...) is grouped into whole objects — see
 *    `sortBottom` below.
 *  - "Triggers/Starting Point": a point/rect marking the spawn.
 *  - Top-level object layers of tile objects (e.g. "Street", "Water
 *    Animation") are ground decoration, drawn in file order between/above
 *    the ground tile layers.
 *  - "Triggers/Doors": rectangles with `section` (a SectionId) and
 *    `door_tile` (a list of object ids — every door sprite to animate; a
 *    single int also works) properties.
 */

export interface TiledProperty {
  name: string;
  type: string;
  /** A list property (e.g. several door tile ids) is an array of typed entries. */
  value: string | number | boolean | { type: string; value: string | number | boolean }[];
}

export interface TiledObject {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  gid?: number;
  point?: boolean;
  polygon?: { x: number; y: number }[];
  properties?: TiledProperty[];
}

export interface TiledTileMeta {
  id: number;
  animation?: { tileid: number; duration: number }[];
  objectgroup?: { objects: TiledShape[] };
}

/** A collision shape drawn inside a tileset tile (coordinates relative to the tile). */
export interface TiledShape {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  polygon?: { x: number; y: number }[];
}

export interface TiledTileset {
  firstgid: number;
  name: string;
  image: string;
  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
  columns: number;
  tilecount: number;
  tiles?: TiledTileMeta[];
}

export interface TiledLayer {
  id: number;
  name: string;
  type: "tilelayer" | "objectgroup" | "group" | "imagelayer";
  width?: number;
  height?: number;
  data?: number[];
  objects?: TiledObject[];
  layers?: TiledLayer[];
}

export interface TiledMapData {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export const TILED_MAP = mapJson as unknown as TiledMapData;

export const WORLD_WIDTH = TILED_MAP.width * TILED_MAP.tilewidth;
export const WORLD_HEIGHT = TILED_MAP.height * TILED_MAP.tileheight;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A layer with its group path, e.g. "Buildings/About Me/Door". */
interface PathedLayer {
  layer: TiledLayer;
  path: string;
}

function flattenLayers(layers: TiledLayer[], prefix = ""): PathedLayer[] {
  const out: PathedLayer[] = [];
  for (const layer of layers) {
    const path = prefix ? `${prefix}/${layer.name}` : layer.name;
    out.push({ layer, path });
    if (layer.type === "group" && layer.layers) out.push(...flattenLayers(layer.layers, path));
  }
  return out;
}

const ALL_LAYERS = flattenLayers(TILED_MAP.layers);

const GID_MASK = 0x1fffffff;
const GID_FLAGS = 0xe0000000;

/** Tiled's tileset lookup: the tileset with the highest firstgid <= gid. */
export function tilesetForGid(gid: number): TiledTileset | undefined {
  return [...TILED_MAP.tilesets].sort((a, b) => b.firstgid - a.firstgid).find((t) => gid >= t.firstgid);
}

export function tileMeta(tileset: TiledTileset, localId: number): TiledTileMeta | undefined {
  return tileset.tiles?.find((t) => t.id === localId);
}

function prop(obj: TiledObject, name: string): TiledProperty["value"] | undefined {
  return obj.properties?.find((p) => p.name === name)?.value;
}

/** Reads an object-id property authored as a Tiled list of ints, or a lone int. */
function idList(value: TiledProperty["value"] | undefined): number[] {
  if (typeof value === "number") return [value];
  if (Array.isArray(value)) return value.map((v) => v.value).filter((v): v is number => typeof v === "number");
  return [];
}

// --- spawn -----------------------------------------------------------------

const spawnObject = ALL_LAYERS.find((l) => l.path === "Triggers/Starting Point")?.layer.objects?.[0];

export const SPAWN_POINT = spawnObject
  ? { x: spawnObject.x + spawnObject.width / 2, y: spawnObject.y + spawnObject.height / 2 }
  : { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };

if (!spawnObject) console.warn('[tiledWorld] No object in "Triggers/Starting Point" — spawning at map center.');

// --- doors -----------------------------------------------------------------

export interface DoorTrigger {
  id: number;
  name: string;
  rect: Rect;
  section: SectionId;
  /** Ids of the tile objects (in a Buildings/.../Door layer) this trigger animates. */
  doorTileObjectIds: number[];
}

export const DOOR_TRIGGERS: DoorTrigger[] = [];
for (const obj of ALL_LAYERS.find((l) => l.path === "Triggers/Doors")?.layer.objects ?? []) {
  const section = prop(obj, "section");
  if (typeof section !== "string" || !(section in SECTIONS)) {
    console.warn(`[tiledWorld] Door trigger "${obj.name}" (#${obj.id}) needs a valid "section" property; skipped.`);
    continue;
  }
  DOOR_TRIGGERS.push({
    id: obj.id,
    name: obj.name,
    rect: { x: obj.x, y: obj.y, width: obj.width, height: obj.height },
    section: section as SectionId,
    doorTileObjectIds: idList(prop(obj, "door_tile")),
  });
}

// --- collisions ------------------------------------------------------------

function rotatePoint(px: number, py: number, degrees: number): { x: number; y: number } {
  const r = (degrees * Math.PI) / 180;
  return { x: px * Math.cos(r) - py * Math.sin(r), y: px * Math.sin(r) + py * Math.cos(r) };
}

/**
 * Arcade Physics only does axis-aligned boxes, so rotated rectangles and
 * polygons collapse to their bounding box, clipped to the tile they sit in.
 */
function shapeBounds(shape: TiledShape): Rect {
  const points = shape.polygon
    ? shape.polygon.map((p) => ({ x: p.x, y: p.y }))
    : [
        { x: 0, y: 0 },
        { x: shape.width, y: 0 },
        { x: shape.width, y: shape.height },
        { x: 0, y: shape.height },
      ];
  const world = points.map((p) => {
    const r = rotatePoint(p.x, p.y, shape.rotation ?? 0);
    return { x: shape.x + r.x, y: shape.y + r.y };
  });
  const xs = world.map((p) => p.x);
  const ys = world.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

function clipToTile(r: Rect, tileW: number, tileH: number): Rect {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  return {
    x,
    y,
    width: Math.min(tileW, r.x + r.width) - x,
    height: Math.min(tileH, r.y + r.height) - y,
  };
}

function collisionRects(): Rect[] {
  const rects: Rect[] = [];

  // 1) Rectangles drawn on object layers inside the "Collisions" group.
  for (const { layer, path } of ALL_LAYERS) {
    if (layer.type !== "objectgroup" || !path.startsWith("Collisions/")) continue;
    for (const obj of layer.objects ?? []) {
      const bounds = obj.polygon ? shapeBounds({ ...obj, polygon: obj.polygon }) : obj;
      if (!(bounds.width > 0 && bounds.height > 0)) continue; // stray points/empty rects
      rects.push({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
    }
  }

  // 2) Collision shapes built into tiles (e.g. the shoreline), for every
  //    cell of a top-level tile layer that uses such a tile.
  for (const layer of TILED_MAP.layers) {
    if (layer.type !== "tilelayer" || !layer.data || !layer.width) continue;
    layer.data.forEach((raw, index) => {
      if (!raw) return;
      const gid = (raw >>> 0) & GID_MASK;
      const tileset = tilesetForGid(gid);
      const shapes = tileset && tileMeta(tileset, gid - tileset.firstgid)?.objectgroup?.objects;
      if (!tileset || !shapes) return;
      const originX = (index % layer.width!) * TILED_MAP.tilewidth;
      const originY = Math.floor(index / layer.width!) * TILED_MAP.tileheight;
      for (const shape of shapes) {
        const b = clipToTile(shapeBounds(shape), tileset.tilewidth, tileset.tileheight);
        if (b.width > 0 && b.height > 0) {
          rects.push({ x: originX + b.x, y: originY + b.y, width: b.width, height: b.height });
        }
      }
    });
  }

  return rects;
}

export const COLLISION_RECTS: Rect[] = collisionRects();

// --- building sprites ------------------------------------------------------

/** One sprite to draw: a tile object, or one filled cell of a tile layer inside "Buildings". */
export interface TileSprite {
  /** Unique within the map; tile objects use their Tiled object id. */
  objectId?: number;
  tilesetName: string;
  /** Frame index within the tileset image (the tile's local id). */
  frame: number;
  x: number;
  /** Bottom edge — Tiled anchors tile objects at their bottom-left. */
  bottom: number;
  width: number;
  height: number;
  layerPath: string;
  /** Draw-order position, used to break ties between sprites at the same y. */
  order: number;
  /** Sits under the player at all times instead of being sorted by y. */
  groundLevel: boolean;
  /**
   * The y the player is compared against to decide who draws in front: the
   * object's front edge on the ground. For a house this is the bottom of its
   * whole footprint, not of each tile — otherwise a roof tile whose own
   * bottom is above the player would wrongly draw behind him while he's
   * standing behind the house.
   */
  sortBottom: number;
}

const GROUND_LAYER_PATTERN = /ground|shadow/i;
/** Thin pieces (fences) that read correctly when each tile sorts on its own. */
const PER_TILE_LAYER_PATTERN = /fence/i;

/** Groups sprites that touch into whole objects; each gets the lowest bottom edge among its members. */
function assignObjectSortBottoms(sprites: TileSprite[]): void {
  const parent = sprites.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));

  const touches = (a: TileSprite, b: TileSprite) =>
    a.x <= b.x + b.width && b.x <= a.x + a.width && a.bottom - a.height <= b.bottom && b.bottom - b.height <= a.bottom;

  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      if (touches(sprites[i], sprites[j])) parent[find(i)] = find(j);
    }
  }

  const bottomByRoot = new Map<number, number>();
  sprites.forEach((s, i) => {
    const root = find(i);
    bottomByRoot.set(root, Math.max(bottomByRoot.get(root) ?? -Infinity, s.bottom));
  });
  sprites.forEach((s, i) => {
    s.sortBottom = bottomByRoot.get(find(i))!;
  });
}

function buildSprites(): TileSprite[] {
  const sprites: TileSprite[] = [];
  let order = 0;

  for (const { layer, path } of ALL_LAYERS) {
    if (!path.startsWith("Buildings/") || layer.type === "group") continue;
    order++;
    const groundLevel = GROUND_LAYER_PATTERN.test(layer.name);

    if (layer.type === "objectgroup") {
      for (const obj of layer.objects ?? []) {
        if (!obj.gid) continue;
        const gid = obj.gid & GID_MASK;
        if (((obj.gid >>> 0) & GID_FLAGS) !== 0) console.warn(`[tiledWorld] Flipped tile object #${obj.id} is drawn unflipped.`);
        const tileset = tilesetForGid(gid);
        if (!tileset) continue;
        sprites.push({
          objectId: obj.id,
          tilesetName: tileset.name,
          frame: gid - tileset.firstgid,
          x: obj.x,
          bottom: obj.y,
          width: obj.width,
          height: obj.height,
          layerPath: path,
          order,
          groundLevel,
          sortBottom: obj.y,
        });
      }
    } else if (layer.type === "tilelayer" && layer.data && layer.width) {
      layer.data.forEach((raw, index) => {
        if (!raw) return;
        const gid = (raw >>> 0) & GID_MASK;
        const tileset = tilesetForGid(gid);
        if (!tileset) return;
        sprites.push({
          tilesetName: tileset.name,
          frame: gid - tileset.firstgid,
          x: (index % layer.width!) * TILED_MAP.tilewidth,
          bottom: (Math.floor(index / layer.width!) + 1) * TILED_MAP.tileheight,
          width: tileset.tilewidth,
          height: tileset.tileheight,
          layerPath: path,
          order,
          groundLevel,
          sortBottom: (Math.floor(index / layer.width!) + 1) * TILED_MAP.tileheight,
        });
      });
    }
  }

  // Whole-object sorting, per building group (so a fence or sign belonging
  // to one building never merges with another building's objects).
  const objectSprites = sprites.filter((s) => !s.groundLevel && !PER_TILE_LAYER_PATTERN.test(s.layerPath.split("/").pop()!));
  const byGroup = new Map<string, TileSprite[]>();
  for (const s of objectSprites) {
    const group = s.layerPath.split("/")[1];
    byGroup.set(group, [...(byGroup.get(group) ?? []), s]);
  }
  for (const group of byGroup.values()) assignObjectSortBottoms(group);

  return sprites;
}

export const BUILDING_SPRITES: TileSprite[] = buildSprites();

/**
 * Tile objects on top-level object layers ("Street", "Water Animation"...):
 * flat decoration that always sits under the player. `order` is the layer's
 * position among all top-level layers in the file, so Tiled's layer order
 * (e.g. Street between Grass and Paths) is the draw order.
 */
function buildGroundSprites(): TileSprite[] {
  const sprites: TileSprite[] = [];
  TILED_MAP.layers.forEach((layer, order) => {
    if (layer.type !== "objectgroup") return;
    for (const obj of layer.objects ?? []) {
      if (!obj.gid) continue;
      const gid = obj.gid & GID_MASK;
      const tileset = tilesetForGid(gid);
      if (!tileset) continue;
      sprites.push({
        objectId: obj.id,
        tilesetName: tileset.name,
        frame: gid - tileset.firstgid,
        x: obj.x,
        bottom: obj.y,
        width: obj.width,
        height: obj.height,
        layerPath: layer.name,
        order,
        groundLevel: true,
        sortBottom: obj.y,
      });
    }
  });
  return sprites;
}

export const GROUND_SPRITES: TileSprite[] = buildGroundSprites();
