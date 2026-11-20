import { useMemo } from 'react'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { makeBushes, makeFlowers, makeGrass } from '../world/vegetation'
import { Instances, type Instance } from './Instances'

/** Bushes, flower patches and grass tufts. Low quality grows about half as many. */
export function Undergrowth() {
  const amount = useGame((s) => (s.quality === 'high' ? 1 : 0.5))

  const bushes = useMemo<Instance[]>(
    () =>
      makeBushes(amount).flatMap((b) => {
        // Each bush is one main blob and a smaller one beside it.
        const ox = Math.cos(b.r) * 0.7 * b.s
        const oz = Math.sin(b.r) * 0.7 * b.s
        return [
          { p: [b.x, 0.45 * b.s, b.z], r: [0, b.r, 0], s: [1.1 * b.s, 0.8 * b.s, 1.1 * b.s], c: b.c },
          { p: [b.x + ox, 0.35 * b.s, b.z + oz], r: [0, b.r * 2, 0], s: [0.75 * b.s, 0.6 * b.s, 0.75 * b.s], c: b.c },
        ] satisfies Instance[]
      }),
    [amount],
  )

  const flowers = useMemo(() => makeFlowers(amount), [amount])
  const heads = useMemo<Instance[]>(
    () => flowers.map((f) => ({ p: [f.x, 0.42 * f.s, f.z], s: [0.13 * f.s, 0.1 * f.s, 0.13 * f.s], c: f.c })),
    [flowers],
  )
  const stems = useMemo<Instance[]>(() => flowers.map((f) => ({ p: [f.x, 0.2 * f.s, f.z], s: [1, f.s, 1] })), [flowers])

  // Each tuft is three thin blades leaning outwards.
  const blades = useMemo<Instance[]>(
    () =>
      makeGrass(amount).flatMap((g) =>
        [0, 2.1, 4.2].map((a) => ({
          p: [g.x + Math.cos(g.r + a) * 0.08, 0.22 * g.s, g.z + Math.sin(g.r + a) * 0.08] as [number, number, number],
          r: [Math.cos(g.r + a) * 0.35, 0, Math.sin(g.r + a) * 0.35] as [number, number, number],
          s: [g.s, g.s, g.s] as [number, number, number],
          c: g.c,
        })),
      ),
    [amount],
  )

  return (
    <>
      <Instances items={bushes} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
      </Instances>
      <Instances items={stems}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 3]} />
        <meshStandardMaterial color={colors.grassDark} roughness={1} />
      </Instances>
      <Instances items={heads}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </Instances>
      <Instances items={blades}>
        <coneGeometry args={[0.07, 0.45, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </Instances>
    </>
  )
}
