import { eventBus } from "@/game/systems/eventBus";
import { BUILDINGS, REGIONS, WORLD_WIDTH, WORLD_HEIGHT } from "@/game/world/worldConfig";
import type { SectionId } from "@/portfolio/data/types";
import { el } from "@/ui/utils";

const MAP_WIDTH = 208;
const MAP_HEIGHT = 156; // matches the world's 4:3 aspect ratio

const REGION_COLORS: Record<string, string> = {
  glacier: "#dfeaf4",
  mountains: "#9aa0ab",
  beach: "#e9d6a3",
  forest: "#3f7a4d",
};

/**
 * A simplified navigation map, not a pixel-accurate game minimap: player
 * position, building markers, and region tints, scaled into a small canvas.
 * Clicking a building marker jumps straight to that portfolio section.
 */
export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
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

    let closest: (typeof BUILDINGS)[number] | null = null;
    let closestDist = Infinity;
    for (const building of BUILDINGS) {
      const bx = building.x * this.scaleX;
      const by = building.y * this.scaleY;
      const dist = Math.hypot(bx - clickX, by - clickY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = building;
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

    let nearest: (typeof BUILDINGS)[number] | null = null;
    let nearestDist = Infinity;
    for (const building of BUILDINGS) {
      const dist = Math.hypot(building.x * this.scaleX - hoverX, building.y * this.scaleY - hoverY);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = building;
      }
    }

    this.canvas.title = nearest && nearestDist <= 10 ? nearest.name : "";
    this.canvas.style.cursor = nearest && nearestDist <= 10 ? "pointer" : "default";
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    ctx.fillStyle = "#6fb04f";
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    for (const region of REGIONS) {
      ctx.fillStyle = REGION_COLORS[region.kind] ?? "#6fb04f";
      ctx.fillRect(
        region.x * this.scaleX,
        region.y * this.scaleY,
        region.width * this.scaleX,
        region.height * this.scaleY,
      );
    }

    for (const building of BUILDINGS) {
      const x = building.x * this.scaleX;
      const y = building.y * this.scaleY;
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
