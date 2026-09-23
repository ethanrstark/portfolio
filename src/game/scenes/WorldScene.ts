import Phaser from "phaser";
import { createTerrain } from "@/game/world/TerrainRenderer";
import { placeDecorations } from "@/game/world/DecorationPlacer";
import { BUILDINGS, SPAWN_POINT } from "@/game/world/worldConfig";
import { Building } from "@/game/entities/Building";
import { Player } from "@/game/entities/Player";
import { setupCamera } from "@/game/camera/CameraController";
import { KeyboardControls } from "@/game/input/KeyboardControls";
import { PointerControls } from "@/game/input/PointerControls";
import { InteractionSystem } from "@/game/systems/InteractionSystem";
import { AudioManager } from "@/game/audio/AudioManager";
import { eventBus } from "@/game/systems/eventBus";

const PLAYER_MOVED_EMIT_INTERVAL = 100; // ms — throttle minimap sync updates

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private keyboard!: KeyboardControls;
  private pointer!: PointerControls;
  private interactions = new InteractionSystem();
  private inputEnabled = true;
  private lastMovedEmit = 0;

  constructor() {
    super("World");
  }

  create(): void {
    const { obstacles } = createTerrain(this);
    placeDecorations(this, obstacles);

    for (const config of BUILDINGS) {
      this.interactions.register(new Building(this, config, obstacles));
    }

    this.player = new Player(this, SPAWN_POINT.x, SPAWN_POINT.y);
    this.physics.add.collider(this.player, obstacles);

    setupCamera(this, this.player);

    this.keyboard = new KeyboardControls(this);
    this.pointer = new PointerControls(this);
    new AudioManager(this);

    eventBus.on("ui:panelState", (open) => {
      this.inputEnabled = !open;
      this.interactions.setEnabled(!open);
      if (open) this.pointer.cancel();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => eventBus.removeAllListeners());
  }

  update(_time: number, delta: number): void {
    if (!this.inputEnabled) {
      this.player.updateMovement({ x: 0, y: 0 });
      return;
    }

    const keyboardDir = this.keyboard.getDirection();
    if (this.keyboard.isAnyDirectionHeld()) this.pointer.cancel();

    const direction = this.keyboard.isAnyDirectionHeld()
      ? keyboardDir
      : this.pointer.getDirectionToward(this.player.x, this.player.y);

    this.player.updateMovement(direction);
    this.interactions.update(this.player.x, this.player.y, this.keyboard.isSpaceJustPressed());

    this.lastMovedEmit += delta;
    if (this.lastMovedEmit >= PLAYER_MOVED_EMIT_INTERVAL) {
      this.lastMovedEmit = 0;
      eventBus.emit("player:moved", { x: this.player.x, y: this.player.y });
    }
  }
}
