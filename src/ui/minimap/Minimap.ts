import { eventBus } from "@/game/systems/eventBus";
import { DOOR_TRIGGERS, TILED_MAP, WORLD_WIDTH, WORLD_HEIGHT } from "@/game/world/tiledWorld";
import { SECTIONS } from "@/portfolio/sections";
import type { SectionId } from "@/portfolio/data/types";
import { el } from "@/ui/utils";

const MAP_WIDTH = 208;
const MAP_HEIGHT = Math.round((MAP_WIDTH * WORLD_HEIGHT) / WORLD_WIDTH); // keep the world's aspect ratio

const TILE_LAYER_COLORS: Record<string, string> = {
  Paths: "#c9a87c",
  Water: "#4f9bcf",
};

/** One marker per door trigger, at the trigger's center. */
const MARKERS = DOOR_TRIGGERS.map((door) => ({
  sectionId: door.section,
  name: SECTIONS[door.section].title,
  x: door.rect.x + door.rect.width / 2,
  y: door.rect.y + door.rect.height / 2,
}));

/**
 * A simplified navigation map, not a pixel-accurate game minimap: player
 * position, door markers, and the map's paths and water, scaled into a small canvas.
 * Clicking a door marker jumps straight to that portfolio section.
 */
export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private background: HTMLCanvasElement;
  private scaleX = MAP_WIDTH / WORLD_WIDTH;
  private scaleY = MAP_HEIGHT / WORLD_HEIGHT;
  private playerPos = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };

  constructor(root: HTMLElement, private onSelectSection: (id: SectionId) => void) {
    const wrapper = el("div", "minimap");
    wrapper.append(el("div", "minimap__label", "World Map"));

    this.canvas = document.createElement("canvas");
    this.canvas.width = MAP_WIDTH;
    this.canvas.height = MAP_HEIGHT;
    this.canvas.className = "minimap__canvas";
    wrapper.append(this.canvas);
    root.append(wrapper);

    this.ctx = this.canvas.getContext("2d")!;
    this.background = this.renderBackground();

    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleHover(e));
    eventBus.on("player:moved", (pos) => {
      this.playerPos = pos;
      this.draw();
    });

    this.draw();
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    let closest: (typeof MARKERS)[number] | null = null;
    let closestDist = Infinity;
    for (const marker of MARKERS) {
      const bx = marker.x * this.scaleX;
      const by = marker.y * this.scaleY;
      const dist = Math.hypot(bx - clickX, by - clickY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = marker;
      }
    }

    if (closest && closestDist <= 10) {
      this.onSelectSection(closest.sectionId);
    }
  }

  private handleHover(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const hoverX = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const hoverY = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    let nearest: (typeof MARKERS)[number] | null = null;
    let nearestDist = Infinity;
    for (const marker of MARKERS) {
      const dist = Math.hypot(marker.x * this.scaleX - hoverX, marker.y * this.scaleY - hoverY);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = marker;
      }
    }

    this.canvas.title = nearest && nearestDist <= 10 ? nearest.name : "";
    this.canvas.style.cursor = nearest && nearestDist <= 10 ? "pointer" : "default";
  }

  /** The map's grass, paths and water never change, so they're painted once. */
  private renderBackground(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#6fb04f";
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    for (const layer of TILED_MAP.layers) {
      const color = TILE_LAYER_COLORS[layer.name];
      if (layer.type !== "tilelayer" || !color || !layer.data || !layer.width) continue;
      ctx.fillStyle = color;
      const cellW = TILED_MAP.tilewidth * this.scaleX;
      const cellH = TILED_MAP.tileheight * this.scaleY;
      layer.data.forEach((gid, index) => {
        if (!gid) return;
        const col = index % layer.width!;
        const row = Math.floor(index / layer.width!);
        // +0.5 overdraw hides hairline gaps between neighboring cells.
        ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
      });
    }

    return canvas;
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ctx.drawImage(this.background, 0, 0);

    for (const marker of MARKERS) {
      const x = marker.x * this.scaleX;
      const y = marker.y * this.scaleY;
      ctx.fillStyle = "#3a2a18";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f4d9b8";
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player marker.
    const px = this.playerPos.x * this.scaleX;
    const py = this.playerPos.y * this.scaleY;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff5a5f";
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, MAP_WIDTH - 1, MAP_HEIGHT - 1);
  }
}
