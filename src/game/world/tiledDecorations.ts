import type { DecorationConfig, DecorationKind } from "./types";

/**
 * Reads a Tiled-exported map (dropped at src/assets/tiled/*.json) and turns
 * its object-layer tile placements into DecorationConfig entries. Only
 * embedded "Collection of Images" tilesets are supported: the decoration
 * kind + texture key are inferred from each placed tile's source image
 * filename, using the same naming convention AssetManifest.ts already
 * expects, so no manual tagging is needed in Tiled.
 *
 * No file dropped yet → returns []. This is expected until the Tiled
 * workflow produces its first export; worldConfig.ts just gets an empty
 * list back and the world renders with only its curated landmark props.
 */

interface TiledTile {
  id: number;
  image: string;
  imagewidth?: number;
  imageheight?: number;
}

interface TiledTileset {
  firstgid: number;
  tiles?: TiledTile[];
  source?: string; // external tileset file — not supported; embed the tileset in the map instead
}

interface TiledObject {
  id: number;
  gid?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
}

interface TiledLayer {
  type: string;
  name: string;
  objects?: TiledObject[];
}

interface TiledMap {
  tilesets: TiledTileset[];
  layers: TiledLayer[];
}

const tiledMaps = import.meta.glob("/src/assets/tiled/*.json", {
  eager: true,
  import: "default",
}) as Record<string, TiledMap>;

function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

/** Filename -> this game's decoration kind + AssetKeys texture key. */
function identifyDecoration(filename: string): { kind: DecorationKind; textureKey: string } | null {
  let m = filename.match(/^(oak|birch|apple)_tree_(lg|md|sm)_\d+\.png$/);
  if (m) return { kind: "tree", textureKey: `tree-${m[1]}-${m[2]}` };

  m = filename.match(/^reg_bush_(sm|md|lg)\.png$/);
  if (m) return { kind: "bush", textureKey: `bush-reg-${m[1]}` };

  m = filename.match(/^flower_bush_([1-4])_sm\.png$/);
  if (m) return { kind: "flower", textureKey: `flowerbush-${m[1]}` };

  m = filename.match(/^tuft-([0-4])\.png$/);
  if (m) return { kind: "grassTuft", textureKey: `grass-tuft-${m[1]}` };

  return null;
}

function resolveTile(map: TiledMap, gid: number): TiledTile | null {
  const tileset = map.tilesets
    .filter((ts) => ts.tiles && gid >= ts.firstgid)
    .sort((a, b) => b.firstgid - a.firstgid)[0];
  if (!tileset?.tiles) return null;
  const localId = gid - tileset.firstgid;
  return tileset.tiles.find((t) => t.id === localId) ?? null;
}

export function loadTiledDecorations(): DecorationConfig[] {
  const entry = Object.entries(tiledMaps)[0];
  if (!entry) return [];
  const [path, map] = entry;

  const decorations: DecorationConfig[] = [];
  let skipped = 0;

  for (const layer of map.layers) {
    if (layer.type !== "objectgroup" || !layer.objects) continue;

    for (const obj of layer.objects) {
      if (obj.visible === false || obj.gid == null) continue;

      const tile = resolveTile(map, obj.gid);
      const identified = tile ? identifyDecoration(basename(tile.image)) : null;
      if (!identified || !tile) {
        skipped++;
        continue;
      }

      decorations.push({
        id: `tiled-${layer.name}-${obj.id}`,
        kind: identified.kind,
        textureKey: identified.textureKey,
        // Tiled anchors tile objects at bottom-left, matching this game's
        // own bottom-center decoration anchor closely enough.
        x: obj.x + obj.width / 2,
        y: obj.y,
        scale: tile.imagewidth ? obj.width / tile.imagewidth : undefined,
      });
    }
  }

  if (skipped > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[tiledDecorations] Skipped ${skipped} object(s) in ${path}: unrecognized tile image.`);
  }

  return decorations;
}
