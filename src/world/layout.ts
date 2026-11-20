/** World layout from the spec (section 7). Units are metres; the board is centred on the origin. */

export type ZoneId = 'about' | 'skills' | 'projects' | 'experience' | 'contact'

export interface Zone {
  id: ZoneId
  /** Reference designator printed on the board, like on a real PCB. */
  ref: string
  x: number
  z: number
}

export const BOARD_SIZE = 120
export const BOARD_HALF = BOARD_SIZE / 2

export const CHIP_SIZE = 8
export const CHIP_HEIGHT = 1.6
export const ZONE_SENSOR_HALF = 7

export const ZONES: Zone[] = [
  { id: 'about', ref: 'U1', x: 0, z: -30 },
  { id: 'skills', ref: 'U2', x: 32, z: -8 },
  { id: 'projects', ref: 'U3', x: 26, z: 26 },
  { id: 'experience', ref: 'U4', x: -26, z: 26 },
  { id: 'contact', ref: 'U5', x: -32, z: -8 },
]

export const zoneById = (id: ZoneId): Zone => ZONES.find((z) => z.id === id)!

export const SPAWN = { x: 0, y: 0.6, z: 0, yaw: Math.PI } // facing -Z (north)
export const SPAWN_PAD_RADIUS = 4

export const TRACE_WIDTH = 4
export const TRACE_HEIGHT = 0.04

/**
 * Copper trace routes from the spawn pad to each chip, as [x, z] points.
 * Each route runs diagonally (45 degrees) first, then straight.
 */
export const TRACES: [number, number][][] = ZONES.map(({ x, z }) => {
  const diag = Math.min(Math.abs(x), Math.abs(z))
  const bend: [number, number] = [Math.sign(x) * diag, Math.sign(z) * diag]
  const route: [number, number][] = [[0, 0]]
  if (diag > 0 && (bend[0] !== x || bend[1] !== z)) route.push(bend)
  route.push([x, z])
  return route
})

export const CRATE_TOWER = { x: -8, z: -12 }
export const SECRET = {
  led: { x: -51.5, z: -53.5 },
  capacitor: { x: -51, z: -48.5, radius: 2.2, height: 5 },
}

/** Rows of small parts: [centre x, centre z, along 'x' | 'z', count]. */
export const RESISTOR_ROWS: [number, number, 'x' | 'z', number][] = [
  [14, -40, 'x', 5],
  [-40, 12, 'z', 5],
  [44, 44, 'x', 5],
  [-18, 46, 'x', 5],
]
export const CERAMIC_ROWS: [number, number, 'x' | 'z', number][] = [
  [-44, -28, 'z', 4],
  [46, -36, 'x', 4],
  [4, 44, 'x', 4],
]
export const PART_SPACING = 2.1

export const MOUNTING_HOLES: [number, number][] = [
  [-54, -54],
  [54, -54],
  [-54, 54],
  [54, 54],
]

/** Distance from a point to the nearest trace centre line. */
export function distanceToTraces(px: number, pz: number): number {
  let best = Infinity
  for (const route of TRACES) {
    for (let i = 0; i < route.length - 1; i++) {
      const [ax, az] = route[i]
      const [bx, bz] = route[i + 1]
      const dx = bx - ax
      const dz = bz - az
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
      best = Math.min(best, Math.hypot(px - (ax + dx * t), pz - (az + dz * t)))
    }
  }
  return best
}
