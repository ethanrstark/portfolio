/**
 * Deterministic PRNG (mulberry32) so procedurally scattered decorations
 * (flowers, bushes, rocks) are stable across reloads instead of reshuffling
 * every time the module is evaluated.
 */
export function createRng(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
