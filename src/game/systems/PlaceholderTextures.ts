import Phaser from "phaser";
import { AssetKeys } from "./AssetKeys";
import { BUILDINGS } from "@/game/world/worldConfig";

/**
 * Generates every placeholder texture used by Phase 1 with Phaser's Graphics
 * -> generateTexture pipeline, so the game never depends on missing image
 * files. Swapping in real art later means adding real loads in BootScene and
 * deleting the matching call below — every consumer only references the
 * AssetKeys constants, never these functions.
 */
export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  generateGroundTiles(scene);
  generateStitchFrames(scene);
  for (const building of BUILDINGS) {
    generateBuildingTexture(scene, building.theme, building.width, building.height);
  }
  generateDecorations(scene);
  generateNpcTexture(scene);
  generateSparkle(scene);
}

function g(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.add.graphics();
}

function bake(
  gfx: Phaser.GameObjects.Graphics,
  key: string,
  width: number,
  height: number,
): void {
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

// ----------------------------------------------------------------- stitch --

function drawCatBody(
  gfx: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  bounce: number,
): void {
  const bodyColor = 0xf0a868;
  const bellyColor = 0xfbe4c6;
  const outline = 0x9a5a30;

  // Shadow.
  gfx.fillStyle(0x2b1d10, 0.25);
  gfx.fillEllipse(cx, cy + 15, 26, 8);

  // Body.
  gfx.lineStyle(2, outline, 1);
  gfx.fillStyle(bodyColor, 1);
  gfx.fillEllipse(cx, cy - 2 + bounce, 26, 22 - bounce);
  gfx.strokeEllipse(cx, cy - 2 + bounce, 26, 22 - bounce);

  // Belly patch.
  gfx.fillStyle(bellyColor, 1);
  gfx.fillEllipse(cx, cy + 5 + bounce, 14, 11);
}

function generateStitchFrames(scene: Phaser.Scene): void {
  const w = 48;
  const h = 48;
  const cx = w / 2;
  const cy = h / 2 + 4;
  const bodyColor = 0xf0a868;
  const outline = 0x9a5a30;
  const earColor = 0xd98a52;

  const makeFrame = (key: string, direction: "up" | "down" | "left" | "right", step: boolean) => {
    const gfx = g(scene);
    const bounce = step ? 2 : 0;

    drawCatBody(gfx, cx, cy, bounce);

    // Ears (position shifts slightly per direction for a hint of facing).
    gfx.fillStyle(earColor, 1);
    gfx.lineStyle(2, outline, 1);
    const earDX = direction === "left" ? -4 : direction === "right" ? 4 : 0;
    gfx.fillTriangle(cx - 14 + earDX, cy - 16 + bounce, cx - 6 + earDX, cy - 16 + bounce, cx - 10 + earDX, cy - 26 + bounce);
    gfx.strokeTriangle(cx - 14 + earDX, cy - 16 + bounce, cx - 6 + earDX, cy - 16 + bounce, cx - 10 + earDX, cy - 26 + bounce);
    gfx.fillTriangle(cx + 6 + earDX, cy - 16 + bounce, cx + 14 + earDX, cy - 16 + bounce, cx + 10 + earDX, cy - 26 + bounce);
    gfx.strokeTriangle(cx + 6 + earDX, cy - 16 + bounce, cx + 14 + earDX, cy - 16 + bounce, cx + 10 + earDX, cy - 26 + bounce);

    // Tail (swings opposite the step for a walk-cycle feel).
    gfx.lineStyle(5, bodyColor, 1);
    const tailSway = step ? 6 : -2;
    gfx.beginPath();
    gfx.moveTo(cx + 16, cy + 8);
    gfx.lineTo(cx + 24 + tailSway, cy - 2);
    gfx.strokePath();

    // Face (only meaningfully visible from down/left/right).
    if (direction === "down") {
      gfx.fillStyle(0x2b1d10, 1);
      gfx.fillCircle(cx - 6, cy - 4 + bounce, 2);
      gfx.fillCircle(cx + 6, cy - 4 + bounce, 2);
      gfx.fillStyle(0xe08a5a, 1);
      gfx.fillTriangle(cx - 2, cy + 1 + bounce, cx + 2, cy + 1 + bounce, cx, cy + 4 + bounce);
    } else if (direction === "left" || direction === "right") {
      const flip = direction === "left" ? -1 : 1;
      gfx.fillStyle(0x2b1d10, 1);
      gfx.fillCircle(cx + 8 * flip, cy - 4 + bounce, 2);
    }
    // "up" shows the back of the head — no face needed.

    bake(gfx, key, w, h);
  };

  makeFrame(AssetKeys.stitch.down, "down", false);
  makeFrame(AssetKeys.stitch.downStep, "down", true);
  makeFrame(AssetKeys.stitch.up, "up", false);
  makeFrame(AssetKeys.stitch.upStep, "up", true);
  makeFrame(AssetKeys.stitch.left, "left", false);
  makeFrame(AssetKeys.stitch.leftStep, "left", true);
  makeFrame(AssetKeys.stitch.right, "right", false);
  makeFrame(AssetKeys.stitch.rightStep, "right", true);
}

// --------------------------------------------------------------- building --

const BUILDING_THEMES: Record<string, { wall: number; roof: number; door: number; accent: number }> = {
  about: { wall: 0xe8b98a, roof: 0xa8542f, door: 0x6b3d20, accent: 0xf4d9b8 },
  projects: { wall: 0x9fb7c9, roof: 0x3c5a73, door: 0x2c3e4a, accent: 0xd6e6ef },
  education: { wall: 0xc98a7a, roof: 0x7a3b32, door: 0x4a2620, accent: 0xead6ce },
  experience: { wall: 0x8898a8, roof: 0x2f3e52, door: 0x1c2534, accent: 0xd3dae2 },
  skills: { wall: 0xb08d5a, roof: 0x5c4326, door: 0x3a2c18, accent: 0xe6cfa3 },
  links: { wall: 0xb79fd1, roof: 0x5b4177, door: 0x3a2a4d, accent: 0xe6d9f2 },
  creative: { wall: 0xe0a9c4, roof: 0x7a4560, door: 0x4a2a38, accent: 0xf5dce8 },
};

function generateBuildingTexture(
  scene: Phaser.Scene,
  theme: string,
  width: number,
  height: number,
): void {
  const key = AssetKeys.buildings[theme as keyof typeof AssetKeys.buildings] ?? theme;
  const colors = BUILDING_THEMES[theme] ?? BUILDING_THEMES.about;
  const gfx = g(scene);

  const roofHeight = Math.round(height * 0.35);
  const wallY = roofHeight;
  const wallHeight = height - roofHeight;

  // Wall.
  gfx.fillStyle(colors.wall, 1);
  gfx.fillRect(0, wallY, width, wallHeight);
  gfx.lineStyle(3, 0x2c1f14, 0.5);
  gfx.strokeRect(0, wallY, width, wallHeight);

  // Roof (simple triangular gable).
  gfx.fillStyle(colors.roof, 1);
  gfx.fillTriangle(-6, wallY + 4, width + 6, wallY + 4, width / 2, 0);
  gfx.lineStyle(3, 0x1c130c, 0.5);
  gfx.strokeTriangle(-6, wallY + 4, width + 6, wallY + 4, width / 2, 0);

  // Windows.
  gfx.fillStyle(colors.accent, 1);
  const winSize = Math.max(18, width * 0.12);
  const winY = wallY + wallHeight * 0.28;
  gfx.fillRect(width * 0.18, winY, winSize, winSize);
  gfx.fillRect(width * 0.82 - winSize, winY, winSize, winSize);
  gfx.lineStyle(2, 0x2c1f14, 0.6);
  gfx.strokeRect(width * 0.18, winY, winSize, winSize);
  gfx.strokeRect(width * 0.82 - winSize, winY, winSize, winSize);

  // Door.
  const doorW = width * 0.22;
  const doorH = wallHeight * 0.55;
  gfx.fillStyle(colors.door, 1);
  gfx.fillRoundedRect((width - doorW) / 2, height - doorH, doorW, doorH, 6);
  gfx.lineStyle(2, 0x1c130c, 0.6);
  gfx.strokeRoundedRect((width - doorW) / 2, height - doorH, doorW, doorH, 6);

  bake(gfx, key, width, height);
}

// ------------------------------------------------------------ decorations --

function generateDecorations(scene: Phaser.Scene): void {
  // Deciduous tree.
  {
    const w = 64;
    const h = 84;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.25);
    gfx.fillEllipse(w / 2, h - 6, 22, 7);
    gfx.fillStyle(0x7a4a2a, 1);
    gfx.fillRect(w / 2 - 6, h - 34, 12, 30);
    gfx.fillStyle(0x3f8f3f, 1);
    gfx.fillCircle(w / 2, h - 50, 22);
    gfx.fillStyle(0x4fa64f, 1);
    gfx.fillCircle(w / 2 - 14, h - 42, 16);
    gfx.fillCircle(w / 2 + 14, h - 44, 17);
    bake(gfx, AssetKeys.decorations.tree, w, h);
  }

  // Pine tree.
  {
    const w = 50;
    const h = 92;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.25);
    gfx.fillEllipse(w / 2, h - 6, 18, 6);
    gfx.fillStyle(0x5a3a20, 1);
    gfx.fillRect(w / 2 - 4, h - 22, 8, 18);
    gfx.fillStyle(0x2f6b45, 1);
    gfx.fillTriangle(w / 2, h - 88, w / 2 - 22, h - 40, w / 2 + 22, h - 40);
    gfx.fillTriangle(w / 2, h - 70, w / 2 - 18, h - 28, w / 2 + 18, h - 28);
    gfx.fillStyle(0x357a4e, 1);
    gfx.fillTriangle(w / 2, h - 58, w / 2 - 15, h - 20, w / 2 + 15, h - 20);
    bake(gfx, AssetKeys.decorations.pine, w, h);
  }

  // Bush.
  {
    const w = 40;
    const h = 28;
    const gfx = g(scene);
    gfx.fillStyle(0x2b1d10, 0.2);
    gfx.fillEllipse(w / 2, h - 4, 16, 5);
    gfx.fillStyle(0x4a9a4a, 1);
    gfx.fillCircle(w * 0.3, h * 0.55, 11);
    gfx.fillCircle(w * 0.65, h * 0.5, 12);
    gfx.fillCircle(w * 0.5, h * 0.35, 10);
    bake(gfx, AssetKeys.decorations.bush, w, h);
  }

  // Flower (tinted per-instance at runtime).
  {
    const w = 16;
    const h = 22;
    const gfx = g(scene);
    gfx.lineStyle(2, 0x3f8f3f, 1);
    gfx.beginPath();
    gfx.moveTo(w / 2, h);
    gfx.lineTo(w / 2, h * 0.45);
    gfx.strokePath();
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(w / 2, h * 0.32, 5);
    gfx.fillStyle(0xffe36b, 1);
    gfx.fillCircle(w / 2, h * 0.32, 2.2);
    bake(gfx, AssetKeys.decorations.flower, w, h);
  }

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

function generateSparkle(scene: Phaser.Scene): void {
  const size = 16;
  const gfx = g(scene);
  gfx.fillStyle(0xfff2b8, 1);
  gfx.fillTriangle(size / 2, 0, size / 2 + 3, size / 2 - 3, size, size / 2);
  gfx.fillTriangle(size, size / 2, size / 2 + 3, size / 2 + 3, size / 2, size);
  gfx.fillTriangle(size / 2, size, size / 2 - 3, size / 2 + 3, 0, size / 2);
  gfx.fillTriangle(0, size / 2, size / 2 - 3, size / 2 - 3, size / 2, 0);
  bake(gfx, AssetKeys.ui.sparkle, size, size);
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
