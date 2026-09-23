import Phaser from "phaser";

export interface DirectionVector {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

/** Arrow-key movement + Space for interaction. WASD is intentionally not bound (spec). */
export class KeyboardControls {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  getDirection(): DirectionVector {
    const x = this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0;
    const y = this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0;
    return { x, y };
  }

  isAnyDirectionHeld(): boolean {
    const d = this.getDirection();
    return d.x !== 0 || d.y !== 0;
  }

  isSpaceJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.spaceKey);
  }
}
