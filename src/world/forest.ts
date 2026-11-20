import { noise2 } from './random'

/**
 * How wooded the world is at each point, from seeded noise. Kept in its own small module so
 * the minimap can draw the forests without loading the placement code.
 */

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 0..1: how wooded a spot is. Patches of forest, open meadows, and a thick band at the world edge. */
export function forestDensity(x: number, z: number): number {
  const f = noise2(x, z, 70, 3) * 0.7 + noise2(x, z, 23, 9) * 0.3
  const edge = Math.max(Math.abs(x), Math.abs(z))
  return Math.min(1, smoothstep(0.47, 0.7, f) * 0.8 + 0.02 + Math.max(0, (edge - 192) / 40))
}
