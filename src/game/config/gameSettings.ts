/**
 * Central tunable constants for the game layer. Keeping these in one place
 * avoids magic numbers scattered across scenes/systems.
 */

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 640;

export const TILE_SIZE = 32;

export const PLAYER_SPEED = 200;

export const INTERACTION_RADIUS = 90;

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
