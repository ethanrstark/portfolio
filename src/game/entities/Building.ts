import Phaser from "phaser";
import { AssetKeys } from "@/game/systems/AssetKeys";
import { DEPTH, INTERACTION_RADIUS } from "@/game/config/gameSettings";
import { eventBus } from "@/game/systems/eventBus";
import type { Interactable } from "@/game/systems/InteractionSystem";
import type { BuildingConfig } from "@/game/world/types";
import type { SectionId } from "@/portfolio/data/types";

/**
 * A building is both a rendered sprite (with collision) and an Interactable.
 * The subtle "attraction" effect (gentle glow pulse) only plays while the
 * player is in range, per the "shimmer, don't shout" interaction spec.
 */
export class Building implements Interactable {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly radius = INTERACTION_RADIUS;
  readonly interactionType = "building" as const;
  readonly prompt: string;
  private readonly sectionId: SectionId;

  private sprite: Phaser.GameObjects.Image;
  private glowTween?: Phaser.Tweens.Tween;

  constructor(
    private scene: Phaser.Scene,
    config: BuildingConfig,
    obstacles: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.prompt = config.name;
    this.sectionId = config.sectionId;

    const textureKey = AssetKeys.buildings[config.spriteKey];

    this.sprite = scene.add.image(config.x, config.y, textureKey);
    this.sprite.setOrigin(0.5, 1);
    // Real building art is a fixed native resolution; stretch it to the
    // building's configured footprint so the large/medium/small size
    // hierarchy from worldConfig is preserved regardless of source art size.
    this.sprite.setDisplaySize(config.width, config.height);
    this.sprite.setDepth(DEPTH.WORLD + config.y + config.height / 2);

    // Collision body sized to the real art's wall footprint, not the roof —
    // measured against both building sprites (steep Tudor-style roofs eat
    // into a naive "bottom N%" guess more than the old placeholder art did).
    const footprintHeight = config.height * 0.36;
    const footprintWidth = config.width * 0.72;
    const zone = scene.add.zone(config.x, config.y - footprintHeight / 2, footprintWidth, footprintHeight);
    obstacles.add(zone);

    scene.add
      .text(config.x, config.y - config.height - 14, config.name, {
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: "15px",
        color: "#ffffff",
        stroke: "#2c1f14",
        strokeThickness: 4,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.WORLD + config.y + config.height / 2 + 1);
  }

  activate(): void {
    eventBus.emit("interaction:activate", this.sectionId);
  }

  onEnterRange(): void {
    this.glowTween?.stop();
    this.glowTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0.82 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.spawnSparkle();
  }

  onExitRange(): void {
    this.glowTween?.stop();
    this.glowTween = undefined;
    this.sprite.setAlpha(1);
  }

  /** A looping twinkle sprite, re-spawned on a delay while in range. */
  private spawnSparkle(): void {
    if (!this.glowTween) return; // range was exited before this fired
    if (!this.scene.anims.exists("ui-sparkle-twinkle")) return;

    const offsetX = Phaser.Math.Between(-30, 30);
    const sparkle = this.scene.add
      .sprite(this.x + offsetX, this.y - this.sprite.displayHeight - 10, AssetKeys.ui.sparkle[0])
      .setDepth(DEPTH.WORLD + this.y + 9999)
      .setScale(1.6);

    sparkle.play("ui-sparkle-twinkle");
    sparkle.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      sparkle.destroy();
      this.scene.time.delayedCall(500, () => this.spawnSparkle());
    });
  }
}
