import Phaser from "phaser";
import { CAMERA_ZOOM } from "@/game/config/gameSettings";
import { WORLD_WIDTH, WORLD_HEIGHT } from "@/game/world/tiledWorld";

/**
 * Configures the main camera to follow the player within the world bounds.
 *
 * The camera follows a stand-in that is snapped to the player's whole-pixel
 * position just before each draw, and locks on (lerp 1) instead of smoothing.
 * The renderer draws sprites at whole pixels, so following his exact (often
 * fractional) position lets the camera and sprite round differently from
 * frame to frame, which shows up as a 1px wobble against the background
 * whenever he moves, especially diagonally.
 */
export function setupCamera(scene: Phaser.Scene, target: Phaser.GameObjects.Components.Transform): void {
  const camera = scene.cameras.main;
  const followPoint = { x: Math.round(target.x), y: Math.round(target.y) };
  scene.events.on(Phaser.Scenes.Events.PRE_RENDER, () => {
    followPoint.x = Math.round(target.x);
    followPoint.y = Math.round(target.y);
  });

  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  camera.startFollow(followPoint, true, 1, 1);
  camera.setZoom(CAMERA_ZOOM);
}
