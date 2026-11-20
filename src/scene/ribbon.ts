import { BufferAttribute, BufferGeometry, Color } from 'three'
import { noise2 } from '../world/random'

type Line = [number, number][]

interface RibbonOptions {
  width: number
  y: number
  /** Vertex colours are mixed between these two with a little noise. */
  colorA: string
  colorB: string
  seed: number
  /** Metres of length per texture repeat (u runs across the ribbon, v along it). */
  uvLength?: number
}

/**
 * One flat mesh following polylines: two vertices across each point. Used for the roads,
 * their verges, the river and its banks.
 */
export function ribbonGeometry(lines: Line[], { width, y, colorA, colorB, seed, uvLength = 10 }: RibbonOptions): BufferGeometry {
  const positions: number[] = []
  const rgb: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const a = new Color(colorA)
  const b = new Color(colorB)
  const c = new Color()

  for (const line of lines) {
    const base = positions.length / 3
    let along = 0
    for (let i = 0; i < line.length; i++) {
      const [px, pz] = line[i]
      const [ax, az] = line[Math.max(0, i - 1)]
      const [bx, bz] = line[Math.min(line.length - 1, i + 1)]
      if (i > 0) along += Math.hypot(px - line[i - 1][0], pz - line[i - 1][1])
      const tx = bx - ax
      const tz = bz - az
      const len = Math.hypot(tx, tz) || 1
      const nx = -tz / len
      const nz = tx / len
      for (const side of [-1, 1]) {
        const x = px + nx * side * (width / 2)
        const z = pz + nz * side * (width / 2)
        positions.push(x, y, z)
        c.copy(a).lerp(b, noise2(x, z, 3, seed))
        rgb.push(c.r, c.g, c.b)
        uvs.push((side + 1) / 2, along / uvLength)
      }
      if (i > 0) {
        const v = base + i * 2
        // Counter-clockwise seen from above, so the faces point up
        indices.push(v - 2, v - 1, v, v - 1, v + 1, v)
      }
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geo.setAttribute('color', new BufferAttribute(new Float32Array(rgb), 3))
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}
