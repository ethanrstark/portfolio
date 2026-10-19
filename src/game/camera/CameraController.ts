import Phaser from "phaser";
import { CAMERA_ZOOM } from "@/game/config/gameSettings";
import { WORLD_WIDTH, WORLD_HEIGHT } from "@/game/world/tiledWorld";

/** Configures the main camera to follow the player within the world bounds. */
export function setupCamera(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  const camera = scene.cameras.main;
  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  camera.startFollow(target, true, 0.15, 0.15);
  camera.setZoom(CAMERA_ZOOM);
}
