import Phaser from "phaser";
import { DEPTH } from "@/game/config/gameSettings";
import { Door } from "@/game/entities/Door";
import { MAP_KEY, tileAnimationKey, tilesetTextureKey } from "@/game/systems/TiledAssets";
import {
  BUILDING_SPRITES,
  COLLISION_RECTS,
  DOOR_TRIGGERS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./tiledWorld";

const GROUND_TILE_LAYERS = ["Grass", "Paths", "Water"];

export interface BuiltWorld {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  doors: Door[];
}

/**
 * Turns the parsed Tiled map into Phaser objects: ground tile layers, the
 * y-sorted building sprites (with chimney/door animations), blocking
 * colliders, and door triggers.
 */
export function buildWorld(scene: Phaser.Scene): BuiltWorld {
  buildGround(scene);
  const doorSprites = buildSprites(scene);
  const obstacles = buildColliders(scene);
  const doors = buildDoors(scene, doorSprites);

  scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  return { obstacles, doors };
}

function buildGround(scene: Phaser.Scene): void {
  const map = scene.make.tilemap({ key: MAP_KEY });
  const terrain = map.addTilesetImage("terrain", tilesetTextureKey("terrain"));
  if (!terrain) throw new Error('The Tiled map has no tileset named "terrain" for its ground layers.');

  GROUND_TILE_LAYERS.forEach((name, i) => {
    const layer = map.createLayer(name, terrain, 0, 0);
    if (!layer) throw new Error(`The Tiled map is missing the "${name}" tile layer.`);
    layer.setDepth(DEPTH.GROUND + i);
  });
}

/** Draws every sprite under "Buildings"; returns the door-controlled ones by Tiled object id. */
function buildSprites(scene: Phaser.Scene): Map<number, { sprite: Phaser.GameObjects.Sprite; animationKey?: string }> {
  const controlledByDoor = new Set(DOOR_TRIGGERS.map((d) => d.doorTileObjectId));
  const doorSprites = new Map<number, { sprite: Phaser.GameObjects.Sprite; animationKey?: string }>();

  for (const s of BUILDING_SPRITES) {
    const sprite = scene.add.sprite(s.x, s.bottom, tilesetTextureKey(s.tilesetName), s.frame).setOrigin(0, 1);
    if (sprite.width !== s.width || sprite.height !== s.height) sprite.setDisplaySize(s.width, s.height);

    // Ground-level layers sit under the player; everything else is sorted by
    // its bottom edge so Stitch walks behind roofs and in front of walls.
    // `order` only breaks ties between sprites sharing a bottom edge.
    sprite.setDepth(s.groundLevel ? DEPTH.GROUND_DECOR + s.order * 0.01 : DEPTH.WORLD + s.bottom + s.order * 0.001);

    const animationKey = tileAnimationKey(s.tilesetName, s.frame);
    const animated = scene.anims.exists(animationKey);

    if (s.objectId !== undefined && controlledByDoor.has(s.objectId)) {
      doorSprites.set(s.objectId, { sprite, animationKey: animated ? animationKey : undefined });
    } else if (animated) {
      sprite.play({ key: animationKey, repeat: -1 });
    }
  }

  return doorSprites;
}

function buildColliders(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const obstacles = scene.physics.add.staticGroup();
  for (const r of COLLISION_RECTS) {
    obstacles.add(scene.add.zone(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height));
  }
  return obstacles;
}

function buildDoors(
  scene: Phaser.Scene,
  doorSprites: Map<number, { sprite: Phaser.GameObjects.Sprite; animationKey?: string }>,
): Door[] {
  return DOOR_TRIGGERS.map((trigger) => {
    const controlled = trigger.doorTileObjectId !== undefined ? doorSprites.get(trigger.doorTileObjectId) : undefined;
    if (trigger.doorTileObjectId !== undefined && !controlled) {
      console.warn(`[TiledWorldRenderer] Door "${trigger.name}" points at door_tile #${trigger.doorTileObjectId}, which isn't a tile object under Buildings.`);
    }
    return new Door(scene, trigger, controlled?.sprite, controlled?.animationKey);
  });
}
