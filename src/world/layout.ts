import { smoothLine, type Point } from './curve'

/** World layout (spec section 7). Units are metres; the world is centred on the origin. */

export type ZoneId = 'about' | 'skills' | 'projects' | 'experience' | 'contact'

export interface Zone {
  id: ZoneId
  x: number
  z: number
  /** Direction the car travels on the last stretch of road into the zone (unit vector in x, z). */
  arrive: [number, number]
}

/** Size of the whole ground, including the hills beyond the drivable area. */
export const WORLD_SIZE = 500
export const WORLD_HALF = WORLD_SIZE / 2
/** The car is kept inside this square by invisible walls; hills rise beyond it. */
export const PLAY_HALF = 225

/** Footprint of each zone's cabin (square), in metres. */
export const CABIN_SIZE = 8
/** Radius of the fixed circular area around each cabin. Driving into it opens that zone's panel. */
export const ZONE_AREA_RADIUS = 7.5

export const ZONES: Zone[] = [
  { id: 'about', x: 0, z: -75, arrive: [0, -1] },
  { id: 'skills', x: 90, z: -30, arrive: [1, 0] },
  { id: 'projects', x: 75, z: 70, arrive: [1, 0] },
  { id: 'experience', x: -75, z: 70, arrive: [-1, 0] },
  { id: 'contact', x: -90, z: -30, arrive: [-1, 0] },
]

export const zoneById = (id: ZoneId): Zone => ZONES.find((z) => z.id === id)!

export const SPAWN = { x: 0, y: 0.6, z: 0, yaw: Math.PI } // facing -Z (north)
/** Radius of the dirt clearing around the spawn point, where all roads meet. */
export const SPAWN_CLEARING_RADIUS = 10

export const ROAD_WIDTH = 5

/** Turns a few control points into an evenly spaced, smooth polyline (about one point every 2 m). */
export const smoothRoad = (controls: Point[], closed = false): Point[] => smoothLine(controls, closed)

/**
 * The road from the spawn point to each zone, in ZONES order. Each road bends once on the way
 * and ends with a straight 25 m run in the zone's `arrive` direction, where its sign stands.
 */
export const ZONE_ROADS: Point[][] = ZONES.map(({ x, z, arrive: [dx, dz] }, i) => {
  const approach: Point = [x - dx * 25, z - dz * 25]
  const straightStart: Point = [x - dx * 40, z - dz * 40]
  // Bend sideways halfway out, alternating sides so the roads do not look ruled.
  const mx = straightStart[0] / 2
  const mz = straightStart[1] / 2
  const len = Math.hypot(mx, mz) || 1
  const bend = (i % 2 === 0 ? 1 : -1) * 9
  const mid: Point = [mx + (-mz / len) * bend, mz + (mx / len) * bend]
  return smoothRoad([[0, 0], mid, straightStart, approach, [x, z]])
})

/** A scenic loop road around the zones, plus two connectors from the spawn point. */
const LOOP_RADIUS = 160
const LOOP: Point[] = smoothRoad(
  Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    const r = LOOP_RADIUS + (i % 2 === 0 ? 14 : -10)
    return [Math.cos(a) * r, Math.sin(a) * r] as Point
  }),
  true,
)
const CONNECTORS: Point[][] = [
  // South, between the Projects and Experience roads
  smoothRoad([[0, 0], [6, 50], [-8, 110], [0, LOOP_RADIUS + 14]]),
  // North-east, between the About and Skills roads
  smoothRoad([[0, 0], [30, -45], [60, -100], [Math.cos(-1.1) * 152, Math.sin(-1.1) * 152]]),
]

/** Every road in the world as a polyline of [x, z] points. */
export const ROADS: Point[][] = [...ZONE_ROADS, LOOP, ...CONNECTORS]

/** Distance from a point to the nearest road centre line. */
export function distanceToRoads(px: number, pz: number): number {
  let best = Infinity
  for (const road of ROADS) {
    for (let i = 0; i < road.length - 1; i++) {
      const [ax, az] = road[i]
      const [bx, bz] = road[i + 1]
      const dx = bx - ax
      const dz = bz - az
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
      best = Math.min(best, Math.hypot(px - (ax + dx * t), pz - (az + dz * t)))
    }
  }
  return best
}

/**
 * The river: enters from the north edge, crosses the loop road and the north-east road
 * (bridges stand at each crossing), passes well clear of the cabins and leaves by the east edge.
 */
export const RIVER_WIDTH = 12
export const RIVER: Point[] = smoothRoad([
  [-70, -250],
  [-40, -200],
  [10, -160],
  [48, -120],
  [100, -92],
  [150, -90],
  [200, -110],
  [250, -118],
])

/** Ponds: centre and radius in metres. */
export const PONDS: { x: number; z: number; r: number }[] = [
  { x: -48, z: 26, r: 10 },
  { x: 140, z: 18, r: 12 },
  { x: -125, z: 150, r: 15 },
  { x: 34, z: 122, r: 9 },
  { x: 185, z: 120, r: 11 },
]

export const CRATE_TOWER = { x: -8, z: -14 }
/** A glowing mushroom hidden behind a big mossy boulder, far from the roads. */
export const SECRET = {
  mushroom: { x: -150.5, z: -153 },
  rock: { x: -150, z: -148, radius: 3.2, height: 4.2 },
}
