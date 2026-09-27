export interface Point {
  x: number;
  y: number;
}

/** Shortest distance from point (px,py) to the segment a-b. */
export function distanceToSegment(px: number, py: number, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(px - a.x, py - a.y);

  let t = ((px - a.x) * dx + (py - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  return Math.hypot(px - closestX, py - closestY);
}

/** Shortest distance from a point to any segment of a polyline. */
export function distanceToPolyline(px: number, py: number, points: Point[]): number {
  let min = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    min = Math.min(min, distanceToSegment(px, py, points[i], points[i + 1]));
  }
  return min;
}

/** Standard ray-casting point-in-polygon test. */
export function pointInPolygon(px: number, py: number, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Shortest distance from a point to the nearest edge of a (closed) polygon. */
export function distanceToPolygonEdge(px: number, py: number, polygon: Point[]): number {
  let min = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    min = Math.min(min, distanceToSegment(px, py, polygon[i], polygon[j]));
  }
  return min;
}

export interface AABB {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function pointInAABB(px: number, py: number, box: AABB): boolean {
  return px >= box.left && px <= box.right && py >= box.top && py <= box.bottom;
}
