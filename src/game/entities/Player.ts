import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH, PLAYER_SPEED } from "@/game/config/gameSettings";
import type { DirectionVector } from "@/game/input/KeyboardControls";

export type FacingDirection = "up" | "down" | "left" | "right";

/**
 * Registers the idle/walk animations once. Frames mix multiple generated
 * textures (rather than a single spritesheet) since Phase 1 draws each
 * direction as its own placeholder texture — Phaser's AnimationManager
 * supports this natively via per-frame `key`. When real spritesheets
 * replace the placeholders, only this function needs to change.
 */
export function createStitchAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;
  const dirs: { dir: FacingDirection; base: string; step: string }[] = [
    { dir: "down", base: AssetKeys.stitch.down, step: AssetKeys.stitch.downStep },
    { dir: "up", base: AssetKeys.stitch.up, step: AssetKeys.stitch.upStep },
    { dir: "left", base: AssetKeys.stitch.left, step: AssetKeys.stitch.leftStep },
    { dir: "right", base: AssetKeys.stitch.right, step: AssetKeys.stitch.rightStep },
  ];

  for (const { dir, base, step } of dirs) {
    anims.create({
      key: `stitch-idle-${dir}`,
      frames: [{ key: base }],
      frameRate: 1,
    });
    anims.create({
      key: `stitch-walk-${dir}`,
      frames: [{ key: base }, { key: step }],
      frameRate: 7,
      repeat: -1,
    });
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: FacingDirection = "down";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AssetKeys.stitch.down);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.88);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 14);
    body.setOffset(11, 30);

    this.play("stitch-idle-down");
  }

  /** Applies velocity + picks the right animation from a normalized direction vector. */
  updateMovement(direction: DirectionVector): void {
    const moving = direction.x !== 0 || direction.y !== 0;

    const velocity = new Phaser.Math.Vector2(direction.x, direction.y);
    if (velocity.lengthSq() > 0) velocity.normalize().scale(PLAYER_SPEED);
    this.setVelocity(velocity.x, velocity.y);

    if (moving) {
      this.facing = this.resolveFacing(direction);
      this.play(`stitch-walk-${this.facing}`, true);
    } else {
      this.play(`stitch-idle-${this.facing}`, true);
    }

    this.setDepth(DEPTH.WORLD + this.y);
  }

  private resolveFacing(direction: DirectionVector): FacingDirection {
    // Prefer whichever axis has motion; if both, keep the previous facing's
    // axis when possible so diagonal movement doesn't feel twitchy.
    if (direction.x !== 0 && direction.y !== 0) {
      const preferHorizontal = this.facing === "left" || this.facing === "right";
      if (preferHorizontal) return direction.x < 0 ? "left" : "right";
      return direction.y < 0 ? "up" : "down";
    }
    if (direction.x !== 0) return direction.x < 0 ? "left" : "right";
    return direction.y < 0 ? "up" : "down";
  }
}
