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

    const textureKey =
      AssetKeys.buildings[config.theme as keyof typeof AssetKeys.buildings] ?? config.theme;

    this.sprite = scene.add.image(config.x, config.y, textureKey);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(DEPTH.WORLD + config.y + config.height / 2);

    // Collision body sized to roughly the wall footprint (not the roof peak).
    const footprintHeight = config.height * 0.65;
    const zone = scene.add.zone(config.x, config.y - footprintHeight / 2, config.width * 0.92, footprintHeight);
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

  /** A single floating sparkle that fades out — re-spawned on a delay while in range. */
  private spawnSparkle(): void {
    if (!this.glowTween) return; // range was exited before this fired
    const offsetX = Phaser.Math.Between(-30, 30);
    const sparkle = this.scene.add
      .image(this.x + offsetX, this.y - this.sprite.displayHeight - 10, AssetKeys.ui.sparkle)
      .setDepth(DEPTH.WORLD + this.y + 9999)
      .setAlpha(0)
      .setScale(0.6);

    this.scene.tweens.add({
      targets: sparkle,
      alpha: { from: 0, to: 1 },
      y: sparkle.y - 18,
      scale: 1,
      duration: 700,
      yoyo: true,
      onComplete: () => {
        sparkle.destroy();
        this.scene.time.delayedCall(500, () => this.spawnSparkle());
      },
    });
  }
}
