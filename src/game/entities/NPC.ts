import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH } from "@/game/config/gameSettings";
import type { NpcConfig } from "@/game/world/types";

/**
 * Purely decorative placeholder villager: a subtle idle bob plus an optional
 * slow side-to-side wander. Not interactable in Phase 1 — see spec principle
 * "exploration should be optional" (dialogue/NPC interaction is a later
 * polish item, not required to reach any portfolio content).
 */
export function spawnNpc(scene: Phaser.Scene, config: NpcConfig): Phaser.GameObjects.Image {
  const sprite = scene.add.image(config.x, config.y, AssetKeys.npc.base);
  sprite.setOrigin(0.5, 0.92);
  sprite.setTint(config.color);
  sprite.setDepth(DEPTH.WORLD + config.y);

  scene.tweens.add({
    targets: sprite,
    scaleY: { from: 1, to: 0.97 },
    duration: 900 + Math.random() * 300,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  if (config.wanderRange && config.wanderRange > 0) {
    scene.tweens.add({
      targets: sprite,
      x: { from: config.x - config.wanderRange, to: config.x + config.wanderRange },
      duration: 3500 + Math.random() * 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        sprite.setFlipX(sprite.x < config.x);
      },
    });
  }

  return sprite;
}
