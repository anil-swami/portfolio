import { useMemo } from 'react'
import { BallCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { makeLogs, makeRocks } from '../world/vegetation'
import { Instances, type Instance } from './Instances'

const LOG_RADIUS = 0.42

/** Boulders and pebbles (more of them by the water), and fallen logs in the woods. Big ones are solid. */
export function Rocks() {
  const rocks = useMemo(() => makeRocks(), [])
  const logs = useMemo(() => makeLogs(), [])

  const rockItems = useMemo<Instance[]>(
    () => rocks.map((r) => ({ p: [r.x, r.s * 0.3, r.z], r: [r.r * 0.3, r.r, 0], s: [r.s, r.s * 0.7, r.s * 0.9], c: r.c })),
    [rocks],
  )
  // A log lies along its direction r: turn the Y-up cylinder onto its side, then around Y.
  const logItems = useMemo<Instance[]>(
    () => logs.map((l) => ({ p: [l.x, LOG_RADIUS, l.z], r: [0, l.r, Math.PI / 2], s: [LOG_RADIUS, l.s, LOG_RADIUS] })),
    [logs],
  )
  const logEnds = useMemo<Instance[]>(
    () =>
      logs.flatMap((l) =>
        [-1, 1].map((side) => ({
          p: [l.x + Math.cos(l.r) * side * (l.s / 2), LOG_RADIUS, l.z - Math.sin(l.r) * side * (l.s / 2)] as [number, number, number],
          r: [0, l.r, Math.PI / 2] as [number, number, number],
          s: [LOG_RADIUS * 0.85, 0.04, LOG_RADIUS * 0.85] as [number, number, number],
        })),
      ),
    [logs],
  )

  return (
    <>
      <Instances items={rockItems} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
      </Instances>
      <Instances items={logItems} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 9]} />
        <meshStandardMaterial color={colors.log} roughness={0.95} />
      </Instances>
      <Instances items={logEnds}>
        <cylinderGeometry args={[1, 1, 1, 9]} />
        <meshStandardMaterial color={colors.woodLight} roughness={0.9} />
      </Instances>

      <RigidBody type="fixed" colliders={false}>
        {rocks
          .filter((r) => r.s > 1.2)
          .map((r, i) => (
            <BallCollider key={`r${i}`} args={[r.s * 0.75]} position={[r.x, r.s * 0.15, r.z]} />
          ))}
        {logs.map((l, i) => (
          <CuboidCollider key={`l${i}`} args={[l.s / 2, LOG_RADIUS, LOG_RADIUS]} position={[l.x, LOG_RADIUS, l.z]} rotation={[0, l.r, 0]} />
        ))}
      </RigidBody>
    </>
  )
}
