import { PLAY_HALF, ROAD_WIDTH } from './layout'
import { forestDensity } from './forest'
import { noise2, seeded } from './random'
import { isOpen, roadDistance, waterDistance } from './worldMap'

/**
 * Where every tree, bush, rock, flower and grass tuft grows. Pure data, seeded, so the forest
 * is the same on every visit. Rendering lives in the scene components.
 */

export type TreeKind = 'pine' | 'oak' | 'birch'

export interface Tree {
  kind: TreeKind
  x: number
  z: number
  /** Overall size multiplier. */
  s: number
  /** Turn around Y. */
  r: number
  /** Foliage tint. */
  c: string
}

export interface Spot {
  x: number
  z: number
  s: number
  r: number
  c: string
}

const EXTENT = PLAY_HALF + 38 // trees also grow a little way beyond the walls, in front of the hills
const ROAD_EDGE = ROAD_WIDTH / 2

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const pick = <T>(random: () => number, list: readonly T[]) => list[Math.floor(random() * list.length)]

const PINE_GREENS = ['#2F5D34', '#365F2E', '#2B5530', '#3B6A36']
const OAK_GREENS = ['#4F7F32', '#5A8A36', '#47762F', '#628F3B']
const BIRCH_GREENS = ['#7DAA45', '#8BB54E', '#72A040']

/** Jittered-grid sampling: one candidate per cell, nudged randomly inside it. */
function* candidates(random: () => number, spacing: number, extent: number) {
  for (let gz = -extent; gz < extent; gz += spacing) {
    for (let gx = -extent; gx < extent; gx += spacing) {
      yield [gx + random() * spacing, gz + random() * spacing] as const
    }
  }
}

export function makeTrees(): Tree[] {
  const random = seeded(1201)
  const trees: Tree[] = []
  for (const [x, z] of candidates(random, 5.6, EXTENT)) {
    if (random() > forestDensity(x, z)) continue
    // Keep canopies clear of the road, where the chase camera travels.
    if (roadDistance(x, z) < ROAD_EDGE + 6) continue
    const water = waterDistance(x, z)
    if (water < 2.5 || !isOpen(x, z, 2)) continue
    const conifer = noise2(x, z, 90, 41)
    const kind: TreeKind = conifer > 0.56 ? 'pine' : (water < 22 && random() < 0.55) || random() < 0.14 ? 'birch' : 'oak'
    const greens = kind === 'pine' ? PINE_GREENS : kind === 'oak' ? OAK_GREENS : BIRCH_GREENS
    trees.push({ kind, x, z, s: 0.8 + random() * 0.6, r: random() * Math.PI * 2, c: pick(random, greens) })
  }
  return trees
}

const BUSH_GREENS = ['#3F6E2E', '#4C7D33', '#567F2C', '#3A6530']

/** Bushes gather at forest edges and along the road verges. `amount` scales the count (quality). */
export function makeBushes(amount: number): Spot[] {
  const random = seeded(2203)
  const out: Spot[] = []
  for (const [x, z] of candidates(random, 5.5, PLAY_HALF + 10)) {
    const forest = forestDensity(x, z)
    const road = roadDistance(x, z)
    const verge = road > ROAD_EDGE + 1.8 && road < ROAD_EDGE + 6 ? 0.18 : 0
    const p = (0.05 + 0.4 * smoothstep(0.2, 0.5, forest) * (1 - smoothstep(0.75, 1, forest)) + verge) * amount
    if (random() > p) continue
    if (road < ROAD_EDGE + 1.8 || waterDistance(x, z) < 1 || !isOpen(x, z)) continue
    out.push({ x, z, s: 0.6 + random() * 1.0, r: random() * Math.PI * 2, c: pick(random, BUSH_GREENS) })
  }
  return out
}

const ROCK_GREYS = ['#8E918A', '#7D817A', '#9A9C94', '#6F736C']

export function makeRocks(): Spot[] {
  const random = seeded(3307)
  const out: Spot[] = []
  let guard = 0
  while (out.length < 260 && guard++ < 6000) {
    const x = (random() * 2 - 1) * (PLAY_HALF + 20)
    const z = (random() * 2 - 1) * (PLAY_HALF + 20)
    const water = waterDistance(x, z)
    // Rocks like riverbanks: half of them are kept only when near water.
    if (water > 12 && random() < 0.5) continue
    if (roadDistance(x, z) < ROAD_EDGE + 2 || water < 0.5 || !isOpen(x, z)) continue
    const big = random() < 0.18
    out.push({ x, z, s: big ? 1.3 + random() * 1.2 : 0.35 + random() * 0.7, r: random() * Math.PI * 2, c: pick(random, ROCK_GREYS) })
  }
  return out
}

const FLOWER_COLOURS = ['#FFFFFF', '#FFD84A', '#F48FB1', '#B39DDB', '#7FB3FF', '#FF8A65']

/** Flowers grow in small patches in the meadows, each patch in one colour. */
export function makeFlowers(amount: number): Spot[] {
  const random = seeded(4409)
  const out: Spot[] = []
  let patches = 0
  let guard = 0
  while (patches < 140 * amount && guard++ < 5000) {
    const cx = (random() * 2 - 1) * PLAY_HALF
    const cz = (random() * 2 - 1) * PLAY_HALF
    if (forestDensity(cx, cz) > 0.35 || roadDistance(cx, cz) < ROAD_EDGE + 3 || waterDistance(cx, cz) < 2) continue
    patches++
    const colour = pick(random, FLOWER_COLOURS)
    const count = 10 + Math.floor(random() * 18)
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2
      const d = Math.sqrt(random()) * 3.5
      const x = cx + Math.cos(a) * d
      const z = cz + Math.sin(a) * d
      if (roadDistance(x, z) < ROAD_EDGE + 1 || waterDistance(x, z) < 0.5) continue
      out.push({ x, z, s: 0.8 + random() * 0.5, r: 0, c: colour })
    }
  }
  return out
}

const GRASS_GREENS = ['#4E8A34', '#5B9A3B', '#6AA846', '#457C2E']

/** Grass tufts everywhere except roads and water, a little denser in the meadows. */
export function makeGrass(amount: number): Spot[] {
  const random = seeded(5501)
  const out: Spot[] = []
  const target = Math.round(4200 * amount)
  let guard = 0
  while (out.length < target && guard++ < target * 4) {
    const x = (random() * 2 - 1) * PLAY_HALF
    const z = (random() * 2 - 1) * PLAY_HALF
    if (random() < forestDensity(x, z) * 0.6) continue
    if (roadDistance(x, z) < ROAD_EDGE + 0.8 || waterDistance(x, z) < 0.3 || Math.hypot(x, z) < 11) continue
    out.push({ x, z, s: 0.7 + random() * 0.7, r: random() * Math.PI * 2, c: pick(random, GRASS_GREENS) })
  }
  return out
}

/** A few fallen logs in the woods. `r` is the log's direction; `s` its length in metres. */
export function makeLogs(): Spot[] {
  const random = seeded(6607)
  const out: Spot[] = []
  let guard = 0
  while (out.length < 22 && guard++ < 3000) {
    const x = (random() * 2 - 1) * (PLAY_HALF - 10)
    const z = (random() * 2 - 1) * (PLAY_HALF - 10)
    if (forestDensity(x, z) < 0.45 || roadDistance(x, z) < ROAD_EDGE + 6 || waterDistance(x, z) < 3 || !isOpen(x, z, 4)) continue
    out.push({ x, z, s: 3.5 + random() * 3, r: random() * Math.PI, c: '' })
  }
  return out
}
