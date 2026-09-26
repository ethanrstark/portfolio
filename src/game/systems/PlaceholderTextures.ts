import Phaser from "phaser";
import { AssetKeys } from "./AssetKeys";

/**
 * Generates placeholder textures with Phaser's Graphics -> generateTexture
 * pipeline for anything that doesn't have real art yet (terrain tiles,
 * fountain, lamp, bench, sign, bridge, rock, NPC). Stitch, buildings, trees,
 * and bushes now load real files instead (see AssetManifest.ts) — this file
 * only covers what's left.
 *
 * `bake()` skips regenerating any key a real asset already loaded under, so
 * dropping in more real art over time never needs a corresponding edit here.
 */
export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  generateGroundTiles(scene);
  generateDecorations(scene);
  generateNpcTexture(scene);
}

function g(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.add.graphics();
}

function bake(gfx: Phaser.GameObjects.Graphics, key: string, width: number, height: number): void {
  if (gfx.scene.textures.exists(key)) {
    gfx.destroy();
    return;
  }
  gfx.generateTexture(key, width, height);
  gfx.destroy();
}

// ---------------------------------------------------------------- terrain --

function generateGroundTiles(scene: Phaser.Scene): void {
  const size = 64;

  // Grass: base fill + a scatter of slightly darker/lighter speckles.
  const grass = g(scene);
  grass.fillStyle(0x6fb04f, 1);
  grass.fillRect(0, 0, size, size);
  const grassRng = mulberry(11);
  for (let i = 0; i < 18; i++) {
    const shade = grassRng() > 0.5 ? 0x7dc25d : 0x5f9c44;
    grass.fillStyle(shade, 0.5);
    const bx = grassRng() * size;
    const by = grassRng() * size;
    grass.fillRect(bx, by, 3, 3);
  }
  bake(grass, AssetKeys.terrain.grass, size, size);

  // Cobblestone path.
  const path = g(scene);
  path.fillStyle(0xc9a87c, 1);
  path.fillRect(0, 0, size, size);
  const pathRng = mulberry(22);
  for (let i = 0; i < 10; i++) {
    path.fillStyle(0xb08f5f, 0.6);
    const r = 5 + pathRng() * 4;
    path.fillCircle(pathRng() * size, pathRng() * size, r);
  }
  bake(path, AssetKeys.terrain.path, size, size);

  // Sand.
  const sand = g(scene);
  sand.fillStyle(0xe8d3a0, 1);
  sand.fillRect(0, 0, size, size);
  const sandRng = mulberry(33);
  for (let i = 0; i < 14; i++) {
    sand.fillStyle(0xd9bf85, 0.5);
    sand.fillRect(sandRng() * size, sandRng() * size, 2, 2);
  }
  bake(sand, AssetKeys.terrain.sand, size, size);

  // Water (base tile; animated ripple handled separately at runtime).
  const water = g(scene);
  water.fillStyle(0x4f9bcf, 1);
  water.fillRect(0, 0, size, size);
  water.fillStyle(0x6cb6e6, 0.5);
  water.fillRect(0, 10, size, 4);
  water.fillRect(0, 34, size, 4);
  bake(water, AssetKeys.terrain.water, size, size);

  // Snow.
  const snow = g(scene);
  snow.fillStyle(0xf1f6fb, 1);
  snow.fillRect(0, 0, size, size);
  snow.fillStyle(0xdce8f2, 0.6);
  snow.fillCircle(16, 20, 10);
  snow.fillCircle(44, 40, 12);
  bake(snow, AssetKeys.terrain.snow, size, size);

  // Stone (mountains).
  const stone = g(scene);
  stone.fillStyle(0x8a8f98, 1);
  stone.fillRect(0, 0, size, size);
  stone.fillStyle(0x767b84, 0.7);
  stone.fillTriangle(0, size, size * 0.5, size * 0.2, size, size);
  bake(stone, AssetKeys.terrain.stone, size, size);
}

// ------------------------------------------------------------ decorations --

function generateDecorations(scene: Phaser.Scene): void {
  // Rock.
  {
    const w = 36;
    const h = 24;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.2);
    gfx.fillEllipse(w / 2, h - 3, 14, 4);
    gfx.fillStyle(0x8a8f98, 1);
    gfx.fillEllipse(w / 2, h * 0.55, 16, 11);
    gfx.fillStyle(0x767b84, 1);
    gfx.fillEllipse(w * 0.4, h * 0.5, 8, 5);
    bake(gfx, AssetKeys.decorations.rock, w, h);
  }

  // Bench.
  {
    const w = 46;
    const h = 26;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.2);
    gfx.fillEllipse(w / 2, h - 2, 18, 4);
    gfx.fillStyle(0x7a5230, 1);
    gfx.fillRect(4, h * 0.4, w - 8, 6);
    gfx.fillRect(4, h * 0.55, w - 8, 4);
    gfx.fillStyle(0x4a3320, 1);
    gfx.fillRect(6, h * 0.6, 4, 10);
    gfx.fillRect(w - 10, h * 0.6, 4, 10);
    bake(gfx, AssetKeys.decorations.bench, w, h);
  }

  // Lamp post.
  {
    const w = 20;
    const h = 64;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.2);
    gfx.fillEllipse(w / 2, h - 2, 8, 3);
    gfx.fillStyle(0x3a3a3a, 1);
    gfx.fillRect(w / 2 - 2, h * 0.25, 4, h * 0.7);
    gfx.fillStyle(0xffe08a, 1);
    gfx.fillCircle(w / 2, h * 0.18, 8);
    gfx.fillStyle(0x2c2c2c, 1);
    gfx.fillRect(w / 2 - 9, h * 0.1, 18, 4);
    bake(gfx, AssetKeys.decorations.lamp, w, h);
  }

  // Sign post.
  {
    const w = 34;
    const h = 50;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.2);
    gfx.fillEllipse(w / 2, h - 2, 10, 3);
    gfx.fillStyle(0x6b4a2c, 1);
    gfx.fillRect(w / 2 - 3, h * 0.35, 6, h * 0.6);
    gfx.fillStyle(0xdcb98a, 1);
    gfx.fillRoundedRect(2, 0, w - 4, h * 0.45, 4);
    gfx.lineStyle(2, 0x6b4a2c, 1);
    gfx.strokeRoundedRect(2, 0, w - 4, h * 0.45, 4);
    bake(gfx, AssetKeys.decorations.sign, w, h);
  }

  // Fountain.
  {
    const w = 96;
    const h = 96;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.15);
    gfx.fillEllipse(w / 2, h / 2 + 6, 42, 16);
    gfx.fillStyle(0xb7b2a4, 1);
    gfx.fillCircle(w / 2, h / 2, 44);
    gfx.fillStyle(0x4f9bcf, 1);
    gfx.fillCircle(w / 2, h / 2, 36);
    gfx.fillStyle(0xb7b2a4, 1);
    gfx.fillCircle(w / 2, h / 2, 16);
    gfx.fillStyle(0x6cb6e6, 1);
    gfx.fillCircle(w / 2, h / 2, 8);
    bake(gfx, AssetKeys.decorations.fountain, w, h);
  }

  // Bridge deck (stretched to fit each bridge's config size at runtime).
  {
    const w = 128;
    const h = 56;
    const gfx = g(scene);
    gfx.fillStyle(0x8a6339, 1);
    gfx.fillRect(0, 8, w, h - 16);
    gfx.lineStyle(3, 0x5c3f20, 1);
    for (let x = 6; x < w; x += 14) {
      gfx.beginPath();
      gfx.moveTo(x, 8);
      gfx.lineTo(x, h - 8);
      gfx.strokePath();
    }
    gfx.fillStyle(0x6b4a2c, 1);
    gfx.fillRect(0, 0, w, 6);
    gfx.fillRect(0, h - 6, w, 6);
    bake(gfx, AssetKeys.decorations.bridge, w, h);
  }
}

function generateNpcTexture(scene: Phaser.Scene): void {
  const w = 40;
  const h = 48;
  const gfx = g(scene);
  gfx.fillStyle(0x2b1d10, 0.25);
  gfx.fillEllipse(w / 2, h - 4, 14, 5);
  // Body (tinted per-instance).
  gfx.fillStyle(0xffffff, 1);
  gfx.fillRoundedRect(w / 2 - 10, h * 0.42, 20, 22, 6);
  // Head.
  gfx.fillStyle(0xe8c39e, 1);
  gfx.fillCircle(w / 2, h * 0.32, 11);
  // Simple hair.
  gfx.fillStyle(0x4a3320, 1);
  gfx.fillEllipse(w / 2, h * 0.24, 13, 7);
  // Eyes.
  gfx.fillStyle(0x2b1d10, 1);
  gfx.fillCircle(w / 2 - 4, h * 0.33, 1.5);
  gfx.fillCircle(w / 2 + 4, h * 0.33, 1.5);
  bake(gfx, AssetKeys.npc.base, w, h);
}

function mulberry(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
