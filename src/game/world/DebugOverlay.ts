import Phaser from "phaser";
import { DEPTH } from "@/game/config/gameSettings";
import { EXCLUSION_MARGIN } from "./decorationPlacement";
import { BUILDINGS, PATHS, BRIDGES, WATER_BODIES, REGIONS } from "./worldConfig";
import type { Point } from "./geometry";

/**
 * Press C to visualize what scatter() treats as off-limits (yellow = paths,
 * red = buildings, orange = bridges, blue = water, purple outline = opaque
 * region overlays) plus Arcade Physics' own collider outlines. Dev-only
 * tool for tuning world layout — not part of the portfolio experience.
 */
export class DebugOverlay {
  private enabled = false;
  private zonesGraphic: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene) {
    this.zonesGraphic = scene.add.graphics().setDepth(DEPTH.PARTICLES).setVisible(false);
    this.drawZones();

    scene.add
      .text(8, 8, "Press C: debug overlay", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 4, y: 2 },
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.UI_PROMPT)
      .setAlpha(0.55);

    const key = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    key.on("down", () => this.toggle());
  }

  private toggle(): void {
    this.enabled = !this.enabled;
    this.zonesGraphic.setVisible(this.enabled);

    const world = this.scene.physics.world;
    world.drawDebug = this.enabled;
    if (!world.debugGraphic) world.createDebugGraphic();
    world.debugGraphic.setVisible(this.enabled);
    if (!this.enabled) world.debugGraphic.clear();
  }

  private drawThickPolyline(points: Point[], radius: number, color: number, alpha: number): void {
    const g = this.zonesGraphic;
    g.lineStyle(radius * 2, color, alpha);
    for (let i = 0; i < points.length - 1; i++) {
      g.beginPath();
      g.moveTo(points[i].x, points[i].y);
      g.lineTo(points[i + 1].x, points[i + 1].y);
      g.strokePath();
    }
    for (const p of points) g.fillStyle(color, alpha).fillCircle(p.x, p.y, radius);
  }

  private drawZones(): void {
    const g = this.zonesGraphic;

    // Paths.
    for (const path of PATHS) {
      this.drawThickPolyline(path.points, path.width / 2 + EXCLUSION_MARGIN.path, 0xffcc00, 0.22);
    }

    // Buildings.
    g.fillStyle(0xff3366, 0.22);
    for (const b of BUILDINGS) {
      const m = EXCLUSION_MARGIN.building;
      g.fillRect(b.x - b.width / 2 - m, b.y - b.height - m, b.width + m * 2, b.height + m * 2);
    }

    // Bridges.
    g.fillStyle(0xff9933, 0.28);
    for (const br of BRIDGES) {
      const w = br.horizontal ? br.width : br.height;
      const h = br.horizontal ? br.height : br.width;
      const m = EXCLUSION_MARGIN.bridge;
      g.fillRect(br.x - w / 2 - m, br.y - h / 2 - m, w + m * 2, h + m * 2);
    }

    // Water.
    for (const body of WATER_BODIES) {
      if (body.kind === "lake") {
        g.fillStyle(0x3aa0ff, 0.28);
        g.fillPoints(body.points.map((p) => new Phaser.Geom.Point(p.x, p.y)), true);
      } else {
        this.drawThickPolyline(body.points, (body.width ?? 60) / 2 + EXCLUSION_MARGIN.water, 0x3aa0ff, 0.28);
      }
    }

    // Opaque region overlays (glacier/mountains/beach) — outline only, since
    // these already cover a huge area and a fill would swamp everything else.
    g.lineStyle(3, 0xaa66ff, 0.6);
    for (const region of REGIONS) {
      if (region.kind === "forest") continue;
      g.strokeRect(region.x, region.y, region.width, region.height);
    }
  }
}
