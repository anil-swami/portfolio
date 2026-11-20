import { useMemo } from 'react'
import { colors } from '../theme'
import { PLAY_HALF } from '../world/layout'
import { seeded } from '../world/random'
import { Instances, type Instance } from './Instances'

/** Rolling hills just beyond the drivable area, and a taller, hazier ring further out. */
function ring(seed: number, from: number, to: number, spacing: number, size: [number, number], height: [number, number]) {
  const random = seeded(seed)
  const items: Instance[] = []
  const side = (PLAY_HALF + from) * 2
  const steps = Math.ceil((side * 4) / spacing)
  for (let i = 0; i < steps; i++) {
    // Walk round the square perimeter, then push each hill outwards by a random amount.
    const along = (i / steps) * side * 4
    const edge = Math.floor(along / side)
    const t = (along % side) - side / 2
    const out = PLAY_HALF + from + random() * (to - from)
    const [x, z] = [
      [t, -out],
      [out, t],
      [-t, out],
      [-out, -t],
    ][edge]
    const r = size[0] + random() * (size[1] - size[0])
    const h = height[0] + random() * (height[1] - height[0])
    items.push({ p: [x, -h * 0.25, z], r: [0, random() * Math.PI, 0], s: [r, h, r * (0.8 + random() * 0.4)] })
  }
  return items
}

export function Hills() {
  const near = useMemo(() => ring(71, 14, 40, 22, [18, 30], [9, 20]), [])
  const far = useMemo(() => ring(97, 55, 95, 34, [34, 52], [22, 40]), [])

  return (
    <>
      <Instances items={near} receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={colors.hill} roughness={1} flatShading />
      </Instances>
      <Instances items={far}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={colors.hillFar} roughness={1} flatShading />
      </Instances>
    </>
  )
}
