/**
 * Central tunable constants for the game layer. Keeping these in one place
 * avoids magic numbers scattered across scenes/systems.
 */

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 640;

/** How far the camera is zoomed in; higher shows less of the world and makes everything bigger. */
export const CAMERA_ZOOM = 2;

/**
 * Keep these multiples of 60 (physics runs at 60 steps/second): Stitch then
 * moves a whole number of pixels per step, so he never sits on a half-pixel
 * where the camera and the sprite round in opposite directions and jitter.
 */
export const PLAYER_WALK_SPEED = 180;
/** Held with Shift. */
export const PLAYER_RUN_SPEED = 240;

/** Stitch's frames are 64x64 and drawn at their native pixel size, like the map's tiles. */
export const PLAYER_FRAME_SIZE = 64;
export const PLAYER_SCALE = 1;

/**
 * His collision box inside a frame, in frame pixels measured from the top-left
 * (0,0): from (25,40) to (38,45), i.e. a small box under his feet. Everything
 * above it can overlap scenery, which is what lets him walk behind buildings.
 */
export const PLAYER_BODY = { x: 25, y: 40, width: 13, height: 5 } as const;

/**
 * Depth (z-order) bands. Anything that needs to visually overlap the player
 * correctly (trees, buildings, props) is Y-sorted at runtime within the
 * WORLD band using `sprite.setDepth(sprite.y)`, which is why that band is
 * given a huge range instead of a single number.
 */
export const DEPTH = {
  GROUND: 0,
  WATER: 10,
  PATH: 20,
  GROUND_DECOR: 25,
  WORLD: 100, // + object.y for y-sorted entities (buildings, trees, npcs, player)
  PARTICLES: 100_000,
  UI_PROMPT: 1_000_000,
} as const;
