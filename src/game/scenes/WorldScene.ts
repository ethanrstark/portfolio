import Phaser from "phaser";
import { buildWorld } from "@/game/world/TiledWorldRenderer";
import { SPAWN_POINT } from "@/game/world/tiledWorld";
import { Player } from "@/game/entities/Player";
import { setupCamera } from "@/game/camera/CameraController";
import { KeyboardControls } from "@/game/input/KeyboardControls";
import { PointerControls } from "@/game/input/PointerControls";
import { InteractionSystem } from "@/game/systems/InteractionSystem";
import { AudioManager } from "@/game/audio/AudioManager";
import { eventBus } from "@/game/systems/eventBus";
import { DebugOverlay } from "@/game/world/DebugOverlay";

const PLAYER_MOVED_EMIT_INTERVAL = 100; // ms — throttle minimap sync updates

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private keyboard!: KeyboardControls;
  private pointer!: PointerControls;
  private interactions = new InteractionSystem();
  private inputEnabled = true;
  private lastMovedEmit = 0;
  private playerBounds = new Phaser.Geom.Rectangle();

  constructor() {
    super("World");
  }

  create(): void {
    const { obstacles, doors } = buildWorld(this);
    for (const door of doors) this.interactions.register(door);

    this.player = new Player(this, SPAWN_POINT.x, SPAWN_POINT.y);
    this.physics.add.collider(this.player, obstacles);

    setupCamera(this, this.player);

    this.keyboard = new KeyboardControls(this);
    this.pointer = new PointerControls(this);
    new AudioManager(this);
    new DebugOverlay(this, doors);

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

    this.player.updateMovement(direction, this.keyboard.isRunHeld());

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBounds.setTo(body.x, body.y, body.width, body.height);
    this.interactions.update(this.playerBounds, this.keyboard.isSpaceJustPressed());

    this.lastMovedEmit += delta;
    if (this.lastMovedEmit >= PLAYER_MOVED_EMIT_INTERVAL) {
      this.lastMovedEmit = 0;
      eventBus.emit("player:moved", { x: this.player.x, y: this.player.y });
    }
  }
}
