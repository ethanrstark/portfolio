import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH, PLAYER_SCALE, PLAYER_SPEED } from "@/game/config/gameSettings";
import type { DirectionVector } from "@/game/input/KeyboardControls";

export type FacingDirection = "up" | "down" | "left" | "right";

/**
 * Registers the idle/walk animations from whichever frames actually loaded
 * (real placeholder character art, or generated fallback frames — see
 * AssetManifest.ts / PlaceholderTextures.ts). Frame keys are looked up at
 * animation-creation time so this never needs to change when Stitch's real
 * sprite replaces the current stand-in, as long as the frame counts match
 * AssetKeys.stitch.
 */
export function createStitchAnimations(scene: Phaser.Scene): void {
  const dirs: FacingDirection[] = ["down", "up", "left", "right"];

  for (const dir of dirs) {
    const idleFrames = AssetKeys.stitch.idle[dir].filter((key) => scene.textures.exists(key));
    const runFrames = AssetKeys.stitch.run[dir].filter((key) => scene.textures.exists(key));

    if (idleFrames.length > 0) {
      scene.anims.create({
        key: `stitch-idle-${dir}`,
        frames: idleFrames.map((key) => ({ key })),
        frameRate: 5,
        repeat: -1,
      });
    }
    if (runFrames.length > 0) {
      scene.anims.create({
        key: `stitch-walk-${dir}`,
        frames: runFrames.map((key) => ({ key })),
        frameRate: 12,
        repeat: -1,
      });
    }
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: FacingDirection = "down";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AssetKeys.stitch.idle.down[0]);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.85);
    this.setScale(PLAYER_SCALE);
    this.setCollideWorldBounds(true);

    // Body size/offset are in the frame's native (unscaled) pixels — Arcade
    // Physics applies the sprite's scale to the body automatically.
    const body = this.body as Phaser.Physics.Arcade.Body;
    const frameWidth = this.frame.width;
    const frameHeight = this.frame.height;
    body.setSize(frameWidth * 0.55, frameHeight * 0.35);
    body.setOffset(frameWidth * 0.22, frameHeight * 0.62);

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
