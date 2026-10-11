import Phaser from "phaser";
import { DEPTH } from "@/game/config/gameSettings";
import { Door, type DoorPiece } from "@/game/entities/Door";
import { MAP_KEY, tileAnimationKey, tilesetTextureKey } from "@/game/systems/TiledAssets";
import {
  BUILDING_SPRITES,
  COLLISION_RECTS,
  DOOR_TRIGGERS,
  GROUND_SPRITES,
  TILED_MAP,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type TileSprite,
} from "./tiledWorld";

const GID_MASK = 0x1fffffff;

export interface BuiltWorld {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  doors: Door[];
}

/**
 * Turns the parsed Tiled map into Phaser objects: ground tile layers and
 * flat decoration, the y-sorted building sprites (with chimney/flag/door
 * animations), blocking colliders, and door triggers.
 */
export function buildWorld(scene: Phaser.Scene): BuiltWorld {
  const controlledByDoor = new Set(DOOR_TRIGGERS.flatMap((d) => d.doorTileObjectIds));
  const doorPieces = new Map<number, DoorPiece>();

  const draw = (s: TileSprite, depth: number) => {
    const doorControlled = s.objectId !== undefined && controlledByDoor.has(s.objectId);
    const piece = createSprite(scene, s, depth, doorControlled);
    if (doorControlled) doorPieces.set(s.objectId!, piece);
  };

  buildGroundLayers(scene, draw);

  for (const s of BUILDING_SPRITES) {
    // Ground-level layers sit under the player; everything else is sorted by
    // its object's front edge (see TileSprite.sortBottom) against Stitch's
    // feet, so he walks behind a whole house and in front of it as one unit.
    // `order` only breaks ties between sprites sharing a sort edge.
    draw(s, s.groundLevel ? DEPTH.GROUND_DECOR + s.order * 0.01 : DEPTH.WORLD + s.sortBottom + s.order * 0.001);
  }

  const obstacles = buildColliders(scene);
  const doors = buildDoors(scene, doorPieces);

  scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  return { obstacles, doors };
}

/**
 * Top-level tile layers use the "terrain" tileset through Phaser's tilemap;
 * top-level object layers of tile objects are drawn as flat sprites. Both
 * share one depth scale following the layer order authored in Tiled.
 */
function buildGroundLayers(scene: Phaser.Scene, draw: (s: TileSprite, depth: number) => void): void {
  const map = scene.make.tilemap({ key: MAP_KEY });
  const terrain = map.addTilesetImage("terrain", tilesetTextureKey("terrain"));
  if (!terrain) throw new Error('The Tiled map has no tileset named "terrain" for its ground layers.');

  TILED_MAP.layers.forEach((layer, i) => {
    if (layer.type !== "tilelayer") return;
    if (layer.data?.some((raw) => raw && (raw & GID_MASK) > terrain.total)) {
      console.warn(`[TiledWorldRenderer] Tile layer "${layer.name}" uses tiles from another tileset; only "terrain" tiles are drawn on tile layers.`);
    }
    const created = map.createLayer(layer.name, terrain, 0, 0);
    if (!created) throw new Error(`Couldn't create the "${layer.name}" tile layer.`);
    created.setDepth(DEPTH.GROUND + i);
  });

  for (const s of GROUND_SPRITES) draw(s, DEPTH.GROUND + s.order);
}

/**
 * Draws one tile as a sprite. Animated tiles loop forever (chimney, flags,
 * water) unless a door trigger owns them, in which case the animation is
 * left to the door and handed back for it to use.
 */
function createSprite(scene: Phaser.Scene, s: TileSprite, depth: number, doorControlled: boolean): DoorPiece {
  const sprite = scene.add.sprite(s.x, s.bottom, tilesetTextureKey(s.tilesetName), s.frame).setOrigin(0, 1);
  if (sprite.width !== s.width || sprite.height !== s.height) sprite.setDisplaySize(s.width, s.height);
  sprite.setDepth(depth);

  const key = tileAnimationKey(s.tilesetName, s.frame);
  const animationKey = scene.anims.exists(key) ? key : undefined;
  if (animationKey && !doorControlled) sprite.play({ key: animationKey, repeat: -1 });
  return { sprite, animationKey };
}

function buildColliders(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const obstacles = scene.physics.add.staticGroup();
  for (const r of COLLISION_RECTS) {
    obstacles.add(scene.add.zone(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height));
  }
  return obstacles;
}

function buildDoors(scene: Phaser.Scene, doorPieces: Map<number, DoorPiece>): Door[] {
  return DOOR_TRIGGERS.map((trigger) => {
    const pieces = trigger.doorTileObjectIds.flatMap((id) => {
      const piece = doorPieces.get(id);
      if (!piece) {
        console.warn(`[TiledWorldRenderer] Door "${trigger.name}" points at door_tile #${id}, which isn't a tile object under Buildings.`);
      }
      return piece ? [piece] : [];
    });
    return new Door(scene, trigger, pieces);
  });
}
