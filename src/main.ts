import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { WorldScene } from "@/game/scenes/WorldScene";
import { GAME_WIDTH, GAME_HEIGHT } from "@/game/config/gameSettings";
import { UIManager } from "@/ui/UIManager";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#6fb04f",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, WorldScene],
};

new Phaser.Game(gameConfig);

const uiRoot = document.getElementById("ui-root");
if (!uiRoot) throw new Error("Missing #ui-root element");
new UIManager(uiRoot);
