import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH } from "@/game/config/gameSettings";
import { eventBus } from "@/game/systems/eventBus";
import type { Interactable } from "@/game/systems/InteractionSystem";
import type { DoorTrigger } from "@/game/world/tiledWorld";
import type { SectionId } from "@/portfolio/data/types";
import { SECTIONS } from "@/portfolio/sections";

/** One sprite of a door (a door can be several tiles) and the animation it plays when opened. */
export interface DoorPiece {
  sprite: Phaser.GameObjects.Sprite;
  animationKey?: string;
}

/**
 * A door is a trigger rectangle from Tiled plus the door sprite(s) it
 * animates — large doors are built from several tiles that play together.
 * Standing inside the rectangle plays the open/close animation and offers
 * the section prompt; Space opens the section panel.
 */
export class Door implements Interactable {
  readonly id: string;
  readonly prompt: string;
  readonly interactionType = "door" as const;

  private readonly rect: Phaser.Geom.Rectangle;
  private readonly sectionId: SectionId;
  private sparkling = false;

  constructor(
    private scene: Phaser.Scene,
    trigger: DoorTrigger,
    private pieces: DoorPiece[],
  ) {
    this.id = `door-${trigger.name || trigger.id}`;
    this.sectionId = trigger.section;
    this.prompt = SECTIONS[trigger.section].promptVerb;
    this.rect = new Phaser.Geom.Rectangle(trigger.rect.x, trigger.rect.y, trigger.rect.width, trigger.rect.height);
  }

  /** The trigger rectangle in world coordinates (used by the minimap and debug overlay). */
  get bounds(): Phaser.Geom.Rectangle {
    return this.rect;
  }

  rangeDistance(playerBounds: Phaser.Geom.Rectangle): number | null {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(this.rect, playerBounds)) return null;
    return Phaser.Math.Distance.Between(this.rect.centerX, this.rect.centerY, playerBounds.centerX, playerBounds.centerY);
  }

  activate(): void {
    eventBus.emit("interaction:activate", this.sectionId);
  }

  onEnterRange(): void {
    this.playOpenAnimation();
    this.sparkling = true;
    this.spawnSparkle();
  }

  onExitRange(): void {
    this.sparkling = false;
  }

  private playOpenAnimation(): void {
    for (const { sprite, animationKey } of this.pieces) {
      if (!animationKey || sprite.anims.isPlaying) continue; // mid-cycle: let it finish
      sprite.play(animationKey);
    }
  }

  /** A twinkle above the door, re-spawned on a delay while the player is in range. */
  private spawnSparkle(): void {
    if (!this.sparkling || !this.scene.anims.exists("ui-sparkle-twinkle")) return;

    const top = this.pieces.length
      ? Math.min(...this.pieces.map((p) => p.sprite.y - p.sprite.displayHeight))
      : this.rect.y;
    const sparkle = this.scene.add
      .sprite(this.rect.centerX + Phaser.Math.Between(-12, 12), top - 6, AssetKeys.ui.sparkle[0])
      .setDepth(DEPTH.PARTICLES)
      .setScale(1.6);

    sparkle.play("ui-sparkle-twinkle");
    sparkle.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      sparkle.destroy();
      this.scene.time.delayedCall(500, () => this.spawnSparkle());
    });
  }
}
