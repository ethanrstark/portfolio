import Phaser from "phaser";
import {
  STITCH_ACTIONS,
  STITCH_DIRECTIONS,
  stitchAnimationKey,
  stitchFrameKey,
  type FacingDirection,
  type StitchAction,
} from "@/game/systems/AssetKeys";
import {
  DEPTH,
  PLAYER_BODY,
  PLAYER_FRAME_SIZE,
  PLAYER_RUN_SPEED,
  PLAYER_SCALE,
  PLAYER_WALK_SPEED,
} from "@/game/config/gameSettings";
import type { DirectionVector } from "@/game/input/KeyboardControls";

/** Frames per second for each action; lower the idle number to slow the idle animation. */
const FRAME_RATES: Record<StitchAction, number> = { idle: 4, walk: 10, run: 14 };

/**
 * Registers one looping animation per action and direction from whichever
 * numbered frames actually loaded (see AssetManifest.ts), so each animation
 * may have a different frame count and a missing one is simply skipped.
 */
export function createStitchAnimations(scene: Phaser.Scene): void {
  for (const action of STITCH_ACTIONS) {
    for (const dir of STITCH_DIRECTIONS) {
      const frames: { key: string }[] = [];
      while (scene.textures.exists(stitchFrameKey(action, dir, frames.length + 1))) {
        frames.push({ key: stitchFrameKey(action, dir, frames.length + 1) });
      }
      if (frames.length === 0) continue;
      scene.anims.create({ key: stitchAnimationKey(action, dir), frames, frameRate: FRAME_RATES[action], repeat: -1 });
    }
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: FacingDirection = "south";

  /** `x`/`y` is where Stitch's feet (the middle of his collision box's bottom edge) stand. */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, stitchFrameKey("idle", "south", 1));
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(PLAYER_SCALE);
    this.setCollideWorldBounds(true);

    // Pivot on the feet so the sprite's position is his ground position.
    this.setOrigin((PLAYER_BODY.x + PLAYER_BODY.width / 2) / PLAYER_FRAME_SIZE, (PLAYER_BODY.y + PLAYER_BODY.height) / PLAYER_FRAME_SIZE);

    // Body size/offset are in the frame's native (unscaled) pixels — Arcade
    // Physics applies the sprite's scale to the body automatically.
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_BODY.width, PLAYER_BODY.height);
    body.setOffset(PLAYER_BODY.x, PLAYER_BODY.y);

    this.play(stitchAnimationKey("idle", "south"));
  }

  /** Applies velocity + picks the right animation from a normalized direction vector. */
  updateMovement(direction: DirectionVector, running = false): void {
    const moving = direction.x !== 0 || direction.y !== 0;

    const velocity = new Phaser.Math.Vector2(direction.x, direction.y);
    if (moving) velocity.normalize().scale(running ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED);
    this.setVelocity(velocity.x, velocity.y);

    if (moving) this.facing = this.resolveFacing(direction);
    const action: StitchAction = !moving ? "idle" : running ? "run" : "walk";
    this.play(stitchAnimationKey(action, this.facing), true);
  }

  /**
   * Sorted by his feet (the bottom of his collision body), the same ground
   * contact point the world's sprites sort on, so he passes behind or in
   * front of buildings exactly where his feet cross their front edge.
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.setDepth(DEPTH.WORLD + (this.body as Phaser.Physics.Arcade.Body).bottom);
  }

  private resolveFacing(direction: DirectionVector): FacingDirection {
    // Prefer whichever axis has motion; if both, keep the previous facing's
    // axis when possible so diagonal movement doesn't feel twitchy.
    if (direction.x !== 0 && direction.y !== 0) {
      const preferHorizontal = this.facing === "west" || this.facing === "east";
      if (preferHorizontal) return direction.x < 0 ? "west" : "east";
      return direction.y < 0 ? "north" : "south";
    }
    if (direction.x !== 0) return direction.x < 0 ? "west" : "east";
    return direction.y < 0 ? "north" : "south";
  }
}
