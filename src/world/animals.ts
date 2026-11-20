import { PLAY_HALF, PONDS } from './layout'
import { seeded } from './random'
import { forestDensity } from './forest'
import { isOpen, roadDistance, waterDistance } from './worldMap'

/**
 * Animal behaviour, kept free of three.js so it is easy to read and tune. Land animals wander
 * between random spots near home, pause to graze, and run from the car. Ducks paddle inside
 * their pond. Birds circle in flocks.
 */

export type Species = 'deer' | 'rabbit' | 'fox' | 'duck' | 'bird'

export interface Animal {
  x: number
  y: number
  z: number
  yaw: number
  /** Current forward speed in m/s. */
  speed: number
  state: 'idle' | 'walk' | 'run'
  /** Seconds left in the current idle pause. */
  wait: number
  tx: number
  tz: number
  homeX: number
  homeZ: number
  /** Walk/flap cycle, in radians. */
  phase: number
  scale: number
  /** Birds: circle radius, height and direction; ducks: pond radius. */
  orbit: number
  height: number
  spin: number
}

interface Behaviour {
  walk: number
  run: number
  /** Distance from the car that makes it run. */
  shy: number
  /** How far from home it wanders. */
  range: number
  /** How fast it turns, radians per second. */
  turn: number
  /** Walk cycle speed: radians of leg swing per metre travelled. */
  stride: number
}

export const BEHAVIOUR: Record<Species, Behaviour> = {
  deer: { walk: 1.3, run: 9, shy: 18, range: 30, turn: 3, stride: 4.2 },
  rabbit: { walk: 1.1, run: 7, shy: 11, range: 14, turn: 6, stride: 7 },
  fox: { walk: 1.6, run: 8, shy: 15, range: 35, turn: 4, stride: 6 },
  duck: { walk: 0.5, run: 1.6, shy: 8, range: 0, turn: 2, stride: 0 },
  bird: { walk: 0, run: 0, shy: 0, range: 0, turn: 0, stride: 0 },
}

const inPlay = (x: number, z: number, margin = 8) => Math.abs(x) < PLAY_HALF - margin && Math.abs(z) < PLAY_HALF - margin

/** A spot a land animal may stand on: dry, inside the world and outside the reserved areas. */
const dryLand = (x: number, z: number) => inPlay(x, z) && waterDistance(x, z) > 1.5 && isOpen(x, z)

function blank(random: () => number, x: number, z: number, scale: number): Animal {
  return {
    x,
    y: 0,
    z,
    yaw: random() * Math.PI * 2,
    speed: 0,
    state: 'idle',
    wait: random() * 4,
    tx: x,
    tz: z,
    homeX: x,
    homeZ: z,
    phase: random() * Math.PI * 2,
    scale,
    orbit: 0,
    height: 0,
    spin: 1,
  }
}

/** Finds homes for land animals where `likes` says the ground suits them. */
function landHerd(seed: number, count: number, likes: (x: number, z: number) => boolean, size: [number, number]): Animal[] {
  const random = seeded(seed)
  const out: Animal[] = []
  let guard = 0
  while (out.length < count && guard++ < 4000) {
    const x = (random() * 2 - 1) * (PLAY_HALF - 15)
    const z = (random() * 2 - 1) * (PLAY_HALF - 15)
    if (!dryLand(x, z) || roadDistance(x, z) < 8 || Math.hypot(x, z) < 30 || !likes(x, z)) continue
    out.push(blank(random, x, z, size[0] + random() * (size[1] - size[0])))
  }
  return out
}

export function makeAnimals(): Record<Species, Animal[]> {
  const random = seeded(9091)

  const ducks: Animal[] = []
  for (const pond of PONDS) {
    for (let i = 0; i < 3; i++) {
      const a = random() * Math.PI * 2
      const d = random() * pond.r * 0.6
      const duck = blank(random, pond.x + Math.cos(a) * d, pond.z + Math.sin(a) * d, 0.9 + random() * 0.2)
      duck.homeX = pond.x
      duck.homeZ = pond.z
      duck.orbit = pond.r
      ducks.push(duck)
    }
  }

  const birds: Animal[] = []
  for (let flock = 0; flock < 3; flock++) {
    const cx = (random() * 2 - 1) * 150
    const cz = (random() * 2 - 1) * 150
    for (let i = 0; i < 6; i++) {
      const bird = blank(random, cx, cz, 0.9 + random() * 0.3)
      bird.orbit = 14 + random() * 20
      bird.height = 14 + random() * 10
      bird.spin = (flock % 2 === 0 ? 1 : -1) * (0.25 + random() * 0.15)
      birds.push(bird)
    }
  }

  return {
    deer: landHerd(101, 14, (x, z) => forestDensity(x, z) > 0.15 && forestDensity(x, z) < 0.75, [0.9, 1.15]),
    rabbit: landHerd(202, 26, (x, z) => forestDensity(x, z) < 0.4, [0.85, 1.15]),
    fox: landHerd(303, 7, (x, z) => forestDensity(x, z) > 0.3, [0.9, 1.1]),
    duck: ducks,
    bird: birds,
  }
}

const turnTowards = (from: number, to: number, max: number) => {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + Math.max(-max, Math.min(max, d))
}

/** Picks the next wandering target near home that suits the animal. */
function pickTarget(a: Animal, b: Behaviour, random: () => number, ok: (x: number, z: number) => boolean) {
  for (let i = 0; i < 8; i++) {
    const ang = random() * Math.PI * 2
    const d = random() * b.range
    const x = a.homeX + Math.cos(ang) * d
    const z = a.homeZ + Math.sin(ang) * d
    if (ok(x, z)) {
      a.tx = x
      a.tz = z
      return true
    }
  }
  return false
}

/** Ducks stay inside their pond, a little away from the shore. */
const inPond = (a: Animal) => (x: number, z: number) => Math.hypot(x - a.homeX, z - a.homeZ) < a.orbit - 1.6

const random = seeded(4242)

/** Advances one animal by `dt` seconds. The car position decides when it runs. */
export function stepAnimal(species: Species, a: Animal, dt: number, carX: number, carZ: number, time: number) {
  if (species === 'bird') {
    // Circle round the flock centre, rising and dipping a little.
    a.phase += a.spin * dt
    a.x = a.homeX + Math.cos(a.phase) * a.orbit
    a.z = a.homeZ + Math.sin(a.phase) * a.orbit
    a.y = a.height + Math.sin(time * 0.6 + a.orbit) * 1.5
    a.yaw = Math.atan2(-Math.sin(a.phase) * a.spin, Math.cos(a.phase) * a.spin)
    return
  }

  const b = BEHAVIOUR[species]
  const ok = species === 'duck' ? inPond(a) : dryLand
  const carDist = Math.hypot(a.x - carX, a.z - carZ)

  // Run (or paddle) away from a car that comes close.
  if (carDist < b.shy) {
    const away = Math.atan2(a.x - carX, a.z - carZ)
    const dist = species === 'duck' ? 3 : 18
    const x = a.x + Math.sin(away) * dist
    const z = a.z + Math.cos(away) * dist
    if (ok(x, z)) {
      a.tx = x
      a.tz = z
      if (species !== 'duck') {
        // Let it settle wherever it ends up.
        a.homeX = x
        a.homeZ = z
      }
    } else if (a.state !== 'run') {
      pickTarget(a, { ...b, range: species === 'duck' ? a.orbit : b.range }, random, ok)
    }
    a.state = 'run'
  }

  if (a.state === 'idle') {
    a.speed = Math.max(0, a.speed - 4 * dt)
    a.wait -= dt
    if (a.wait <= 0) {
      const range = species === 'duck' ? a.orbit : b.range
      if (pickTarget(a, { ...b, range }, random, ok)) a.state = 'walk'
      else a.wait = 1
    }
  } else {
    const target = a.state === 'run' ? b.run : b.walk
    a.speed += Math.sign(target - a.speed) * Math.min(Math.abs(target - a.speed), 12 * dt)
    const want = Math.atan2(a.tx - a.x, a.tz - a.z)
    a.yaw = turnTowards(a.yaw, want, b.turn * dt)
    const nx = a.x + Math.sin(a.yaw) * a.speed * dt
    const nz = a.z + Math.cos(a.yaw) * a.speed * dt
    if (ok(nx, nz)) {
      a.x = nx
      a.z = nz
    } else {
      a.state = 'idle'
      a.wait = 0.3
    }
    if (Math.hypot(a.tx - a.x, a.tz - a.z) < 1) {
      a.state = 'idle'
      a.wait = 2 + random() * 6
    }
  }

  a.phase += a.speed * dt * b.stride
  if (species === 'rabbit') a.y = a.speed > 0.2 ? Math.abs(Math.sin(a.phase * 0.5)) * (a.state === 'run' ? 0.45 : 0.22) : 0
  if (species === 'duck') a.y = Math.sin(time * 2 + a.homeX) * 0.02
}
