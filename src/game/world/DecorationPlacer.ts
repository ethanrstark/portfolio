import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH } from "@/game/config/gameSettings";
import { DECORATIONS, NPCS } from "./worldConfig";
import type { DecorationKind } from "./types";
import { spawnNpc } from "@/game/entities/NPC";

const DECORATION_TEXTURE: Record<DecorationKind, string> = {
  tree: AssetKeys.decorations.tree,
  pine: AssetKeys.decorations.pine,
  bush: AssetKeys.decorations.bush,
  flower: AssetKeys.decorations.flower,
  rock: AssetKeys.decorations.rock,
  bench: AssetKeys.decorations.bench,
  lamp: AssetKeys.decorations.lamp,
  sign: AssetKeys.decorations.sign,
  fountain: AssetKeys.decorations.fountain,
};

const FLOWER_TINTS = [0xff6b8a, 0xffd166, 0xa78bfa, 0xff9f6b, 0xf27ab0];

/** Decorations whose base collides with the player (trunks, benches, lamps, fountain). */
const SOLID_KINDS: DecorationKind[] = ["tree", "pine", "rock", "bench", "lamp", "fountain"];

export function placeDecorations(
  scene: Phaser.Scene,
  obstacles: Phaser.Physics.Arcade.StaticGroup,
): void {
  for (const deco of DECORATIONS) {
    const texture = DECORATION_TEXTURE[deco.kind];
    const sprite = scene.add.image(deco.x, deco.y, texture);
    // The fountain is radially symmetric (no "trunk base"), so anchor it at
    // its center instead of the bottom-anchored origin every other prop uses.
    sprite.setOrigin(0.5, deco.kind === "fountain" ? 0.5 : 0.92);
    if (deco.scale) sprite.setScale(deco.scale);
    sprite.setDepth(DEPTH.WORLD + deco.y);

    if (deco.kind === "flower") {
      const tint = FLOWER_TINTS[Math.floor(Math.abs(Math.sin(deco.x * 12.9898 + deco.y * 78.233)) * FLOWER_TINTS.length) % FLOWER_TINTS.length];
      sprite.setTint(tint);
    }

    if (deco.kind === "sign" && deco.label) {
      scene.add
        .text(deco.x, deco.y - 46, deco.label, {
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: "13px",
          color: "#3a2a18",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.WORLD + deco.y + 1);
    }

    if (SOLID_KINDS.includes(deco.kind)) {
      const collisionWidth = sprite.displayWidth * 0.5;
      const collisionHeight = sprite.displayHeight * (deco.kind === "fountain" ? 0.5 : 0.25);
      const zoneY = deco.kind === "fountain" ? deco.y : deco.y - collisionHeight / 2;
      const zone = scene.add.zone(deco.x, zoneY, collisionWidth, collisionHeight);
      obstacles.add(zone);
    }
  }

  for (const npc of NPCS) {
    spawnNpc(scene, npc);
  }
}
