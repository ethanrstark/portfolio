import Phaser from "phaser";
import type { SectionId } from "@/portfolio/data/types";

/**
 * The single communication channel between the Phaser game layer and the
 * HTML/CSS UI layer. Neither layer imports the other directly; they only
 * ever talk through these events. This keeps "game" and "portfolio UI"
 * cleanly separable per the architecture spec.
 */
export type GameEvents = {
  /** Game -> UI: player pressed Space within range of an interactable section. */
  "interaction:activate": (sectionId: SectionId) => void;
  /** Game -> UI: an interactable entered/left proximity range (drives the prompt). */
  "interaction:prompt": (payload: { visible: boolean; label?: string }) => void;
  /** Game -> UI: player moved, for minimap sync. */
  "player:moved": (payload: { x: number; y: number }) => void;
  /** UI -> Game: open a section directly (hamburger menu / minimap click). */
  "ui:openSection": (sectionId: SectionId) => void;
  /** UI -> Game: a panel opened/closed; game pauses movement input while a panel is open. */
  "ui:panelState": (open: boolean) => void;
  /** UI -> Game: mute toggle from the UI layer. */
  "audio:setMuted": (muted: boolean) => void;
};

class TypedEventBus extends Phaser.Events.EventEmitter {
  emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>): boolean {
    return super.emit(event as string, ...args);
  }
  on<K extends keyof GameEvents>(event: K, fn: GameEvents[K], context?: unknown): this {
    return super.on(event as string, fn as (...args: unknown[]) => void, context);
  }
  off<K extends keyof GameEvents>(event: K, fn?: GameEvents[K], context?: unknown): this {
    return super.off(event as string, fn as (...args: unknown[]) => void, context);
  }
}

export const eventBus = new TypedEventBus();
