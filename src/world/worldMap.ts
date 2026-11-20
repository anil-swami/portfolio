import {
  CRATE_TOWER,
  PONDS,
  RIVER,
  RIVER_WIDTH,
  ROADS,
  SECRET,
  SPAWN_CLEARING_RADIUS,
  WORLD_HALF,
  WORLD_SIZE,
  ZONES,
} from './layout'

/**
 * A coarse grid over the whole world (one cell every 2 m) holding the distance to the nearest
 * road centre line and to the nearest water edge. Built once, then placement code (trees,
 * rocks, animals) can ask "is this spot free?" in constant time.
 */
const CELL = 2
const N = Math.ceil(WORLD_SIZE / CELL)
const FAR = 30 // distances are clamped at this value

const roadDist = new Float32Array(N * N).fill(FAR)
const waterDist = new Float32Array(N * N).fill(FAR)

const cellOf = (v: number) => Math.min(N - 1, Math.max(0, Math.floor((v + WORLD_HALF) / CELL)))
const centreOf = (i: number) => -WORLD_HALF + (i + 0.5) * CELL

function segmentDistance(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t))
}

/** Stamps the distance to each segment of a polyline into the cells near it (minus `inset`). */
function stampLine(grid: Float32Array, line: [number, number][], inset: number) {
  const reach = FAR + inset
  for (let s = 0; s < line.length - 1; s++) {
    const [ax, az] = line[s]
    const [bx, bz] = line[s + 1]
    const x0 = cellOf(Math.min(ax, bx) - reach)
    const x1 = cellOf(Math.max(ax, bx) + reach)
    const z0 = cellOf(Math.min(az, bz) - reach)
    const z1 = cellOf(Math.max(az, bz) + reach)
    for (let iz = z0; iz <= z1; iz++) {
      for (let ix = x0; ix <= x1; ix++) {
        const d = segmentDistance(centreOf(ix), centreOf(iz), ax, az, bx, bz) - inset
        const k = iz * N + ix
        if (d < grid[k]) grid[k] = d
      }
    }
  }
}

function stampCircle(grid: Float32Array, cx: number, cz: number, r: number) {
  const reach = FAR + r
  for (let iz = cellOf(cz - reach); iz <= cellOf(cz + reach); iz++) {
    for (let ix = cellOf(cx - reach); ix <= cellOf(cx + reach); ix++) {
      const d = Math.hypot(centreOf(ix) - cx, centreOf(iz) - cz) - r
      const k = iz * N + ix
      if (d < grid[k]) grid[k] = d
    }
  }
}

for (const road of ROADS) stampLine(roadDist, road, 0)
stampLine(waterDist, RIVER, RIVER_WIDTH / 2)
for (const pond of PONDS) stampCircle(waterDist, pond.x, pond.z, pond.r)

const lookup = (grid: Float32Array, x: number, z: number) => grid[cellOf(z) * N + cellOf(x)]

/** Distance from a point to the nearest road centre line (clamped at 30 m; accurate to about 1 m). */
export const roadDistance = (x: number, z: number) => lookup(roadDist, x, z)

/** Distance from a point to the nearest water edge; negative inside the river or a pond. */
export const waterDistance = (x: number, z: number) => lookup(waterDist, x, z)

/** Places that must stay open: the spawn clearing, each zone and its props, the crate tower, the secret. */
const RESERVED: { x: number; z: number; r: number }[] = [
  { x: 0, z: 0, r: SPAWN_CLEARING_RADIUS + 8 },
  ...ZONES.map((z) => ({ x: z.x, z: z.z, r: 24 })),
  { x: CRATE_TOWER.x, z: CRATE_TOWER.z, r: 6 },
  { x: SECRET.rock.x, z: SECRET.rock.z, r: 6 },
  { x: SECRET.mushroom.x, z: SECRET.mushroom.z, r: 4 },
]

/** True when the point is at least `pad` metres outside every reserved area. */
export function isOpen(x: number, z: number, pad = 0): boolean {
  return RESERVED.every((a) => Math.hypot(x - a.x, z - a.z) > a.r + pad)
}
