import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH } from "@/game/config/gameSettings";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  REGIONS,
  WATER_BODIES,
  BRIDGES,
  PATHS,
} from "./worldConfig";

const BOUNDARY_THICKNESS = 90;

/**
 * Draws the ground, region tints, water, and paths, and builds the static
 * collision bodies for world boundaries + water. Returns the obstacle group
 * so the caller can add a single collider against the player.
 */
export function createTerrain(scene: Phaser.Scene): {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
} {
  const obstacles = scene.physics.add.staticGroup();

  // --- base ground -------------------------------------------------------
  scene.add
    .tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, AssetKeys.terrain.grass)
    .setOrigin(0, 0)
    .setDepth(DEPTH.GROUND);

  // --- region tints & flavor ----------------------------------------------
  for (const region of REGIONS) {
    if (region.kind === "beach") {
      scene.add
        .tileSprite(region.x, region.y, region.width, region.height, AssetKeys.terrain.sand)
        .setOrigin(0, 0)
        .setDepth(DEPTH.GROUND_DECOR - 5);
    } else if (region.kind === "glacier") {
      scene.add
        .tileSprite(region.x, region.y, region.width, region.height, AssetKeys.terrain.snow)
        .setOrigin(0, 0)
        .setDepth(DEPTH.GROUND_DECOR - 5);
      drawCrevasses(scene, region);
    } else if (region.kind === "mountains") {
      scene.add
        .tileSprite(region.x, region.y, region.width, region.height, AssetKeys.terrain.stone)
        .setOrigin(0, 0)
        .setDepth(DEPTH.GROUND_DECOR - 5);
      drawPeaks(scene, region);
    } else if (region.kind === "forest") {
      const tint = scene.add.graphics().setDepth(DEPTH.GROUND_DECOR - 5);
      tint.fillStyle(0x1f4d2e, 0.22);
      tint.fillRect(region.x, region.y, region.width, region.height);
    }
  }

  // --- water ---------------------------------------------------------------
  const waterGfx = scene.add.graphics().setDepth(DEPTH.WATER);
  for (const body of WATER_BODIES) {
    waterGfx.fillStyle(0x4f9bcf, 1);
    waterGfx.lineStyle(4, 0x3d7fac, 1);
    if (body.kind === "lake") {
      const pts = body.points.map((p) => new Phaser.Geom.Point(p.x, p.y));
      waterGfx.fillPoints(pts, true);
      waterGfx.strokePoints(pts, true);

      const bbox = boundingBox(body.points);
      const inset = 40;
      addBlocker(
        scene,
        obstacles,
        bbox.x + inset,
        bbox.y + inset,
        bbox.width - inset * 2,
        bbox.height - inset * 2,
      );
    } else {
      const width = body.width ?? 60;
      waterGfx.lineStyle(width, 0x4f9bcf, 1);
      waterGfx.beginPath();
      waterGfx.moveTo(body.points[0].x, body.points[0].y);
      for (const p of body.points.slice(1)) waterGfx.lineTo(p.x, p.y);
      waterGfx.strokePath();
      for (const p of body.points) waterGfx.fillCircle(p.x, p.y, width / 2);

      placeRiverColliders(scene, obstacles, body.points, width);
    }
  }

  // --- bridges (drawn above water, gaps in river collision) ---------------
  for (const bridge of BRIDGES) {
    scene.add
      .image(bridge.x, bridge.y, AssetKeys.decorations.bridge)
      .setDisplaySize(bridge.width, bridge.height)
      .setRotation(bridge.horizontal ? 0 : Math.PI / 2)
      .setDepth(DEPTH.PATH);
  }

  // --- paths ----------------------------------------------------------------
  const pathGfx = scene.add.graphics().setDepth(DEPTH.PATH);
  for (const path of PATHS) {
    pathGfx.lineStyle(path.width + 8, 0xb08f5f, 0.9);
    strokeSmoothPath(pathGfx, path.points);
    pathGfx.lineStyle(path.width, 0xc9a87c, 1);
    strokeSmoothPath(pathGfx, path.points);
  }

  // --- world boundary (edge-of-map collision, explained by the region art) -
  addBlocker(scene, obstacles, WORLD_WIDTH / 2, -BOUNDARY_THICKNESS / 2, WORLD_WIDTH + 400, BOUNDARY_THICKNESS);
  addBlocker(
    scene,
    obstacles,
    WORLD_WIDTH / 2,
    WORLD_HEIGHT + BOUNDARY_THICKNESS / 2,
    WORLD_WIDTH + 400,
    BOUNDARY_THICKNESS,
  );
  addBlocker(scene, obstacles, -BOUNDARY_THICKNESS / 2, WORLD_HEIGHT / 2, BOUNDARY_THICKNESS, WORLD_HEIGHT + 400);
  addBlocker(
    scene,
    obstacles,
    WORLD_WIDTH + BOUNDARY_THICKNESS / 2,
    WORLD_HEIGHT / 2,
    BOUNDARY_THICKNESS,
    WORLD_HEIGHT + 400,
  );

  scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  return { obstacles };
}

function addBlocker(
  scene: Phaser.Scene,
  obstacles: Phaser.Physics.Arcade.StaticGroup,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const zone = scene.add.zone(x, y, width, height);
  obstacles.add(zone);
}

function boundingBox(points: { x: number; y: number }[]): Phaser.Geom.Rectangle {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return new Phaser.Geom.Rectangle(minX, minY, maxX - minX, maxY - minY);
}

function placeRiverColliders(
  scene: Phaser.Scene,
  obstacles: Phaser.Physics.Arcade.StaticGroup,
  points: { x: number; y: number }[],
  width: number,
): void {
  const bridgeBoxes = BRIDGES.map(
    (b) => new Phaser.Geom.Rectangle(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height),
  );
  const step = Math.max(24, width * 0.6);

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
    const steps = Math.ceil(dist / step);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = Phaser.Math.Linear(a.x, b.x, t);
      const y = Phaser.Math.Linear(a.y, b.y, t);
      const overlapsBridge = bridgeBoxes.some((box) => box.contains(x, y));
      if (overlapsBridge) continue;
      addBlocker(scene, obstacles, x, y, width * 0.9, width * 0.9);
    }
  }
}

function strokeSmoothPath(gfx: Phaser.GameObjects.Graphics, points: { x: number; y: number }[]): void {
  gfx.beginPath();
  gfx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    gfx.lineTo(points[i].x, points[i].y);
  }
  gfx.strokePath();
}

function drawPeaks(scene: Phaser.Scene, region: { x: number; y: number; width: number; height: number }): void {
  const gfx = scene.add.graphics().setDepth(DEPTH.GROUND_DECOR - 4);
  const peakColor = [0x6f7480, 0x5c616c];
  const baseY = region.y + region.height * 0.85;
  const peaks = 4;
  for (let i = 0; i < peaks; i++) {
    const px = region.x + (region.width / peaks) * (i + 0.5);
    const peakW = region.width / peaks + 60;
    const peakH = region.height * (0.55 + (i % 2 === 0 ? 0.15 : 0));
    gfx.fillStyle(peakColor[i % 2], 1);
    gfx.fillTriangle(px - peakW / 2, baseY, px + peakW / 2, baseY, px, baseY - peakH);
    gfx.fillStyle(0xf1f6fb, 0.9);
    gfx.fillTriangle(px - peakW * 0.15, baseY - peakH * 0.78, px + peakW * 0.15, baseY - peakH * 0.78, px, baseY - peakH);
  }
}

function drawCrevasses(scene: Phaser.Scene, region: { x: number; y: number; width: number; height: number }): void {
  const gfx = scene.add.graphics().setDepth(DEPTH.GROUND_DECOR - 4);
  gfx.lineStyle(6, 0xbfd4e6, 0.6);
  for (let i = 0; i < 5; i++) {
    const x0 = region.x + region.width * (0.1 + i * 0.16);
    gfx.beginPath();
    gfx.moveTo(x0, region.y);
    gfx.lineTo(x0 - 40, region.y + region.height * 0.6);
    gfx.strokePath();
  }
}
