import Phaser from "phaser";
import { eventBus } from "@/game/systems/eventBus";

/**
 * Thin wrapper around Phaser's sound manager. No audio assets are loaded in
 * Phase 1 (see spec: don't add audio until real placeholder assets exist) —
 * this only wires up the mute toggle and the key/volume plumbing so music
 * and SFX can be dropped in later (assets/audio/music, assets/audio/sfx)
 * without touching any other system.
 */
export class AudioManager {
  private muted = false;

  constructor(private scene: Phaser.Scene) {
    eventBus.on("audio:setMuted", (muted) => this.setMuted(muted));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.scene.sound.mute = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Placeholder hook for future SFX (walking, interaction, menu, etc). */
  playSfx(_key: string): void {
    if (this.muted) return;
    if (!this.scene.cache.audio.exists(_key)) return;
    this.scene.sound.play(_key);
  }
}
