import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import {
  BOARD_HALF,
  CERAMIC_ROWS,
  MOUNTING_HOLES,
  PART_SPACING,
  RESISTOR_ROWS,
  SECRET,
  ZONES,
  distanceToTraces,
} from '../world/layout'
import { Instances, type Instance } from './Instances'
import { ModelSlot } from './models'

const PART = { length: 1.5, height: 0.5, width: 0.85 }
const VIA_COUNT = 90

/** Small deterministic random generator, so the board looks the same on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rowSpots(rows: [number, number, 'x' | 'z', number][]) {
  return rows.flatMap(([cx, cz, axis, count]) =>
    Array.from({ length: count }, (_, i) => {
      const offset = (i - (count - 1) / 2) * PART_SPACING
      // Parts sit side by side: their long side runs across the row.
      return { x: axis === 'x' ? cx + offset : cx, z: axis === 'z' ? cz + offset : cz, turn: axis === 'x' }
    }),
  )
}

/** Board decoration: vias, rows of resistors and ceramic capacitors, mounting holes, optional decor.glb. */
export function Decor() {
  const resistors = useMemo(() => rowSpots(RESISTOR_ROWS), [])
  const ceramics = useMemo(() => rowSpots(CERAMIC_ROWS), [])
  const parts = useMemo(() => [...resistors, ...ceramics], [resistors, ceramics])

  const body = (list: typeof parts): Instance[] =>
    list.map(({ x, z, turn }) => ({ p: [x, PART.height / 2, z], r: [0, turn ? Math.PI / 2 : 0, 0] }))

  const resistorBodies = useMemo(() => body(resistors), [resistors])
  const ceramicBodies = useMemo(() => body(ceramics), [ceramics])
  const endCaps = useMemo<Instance[]>(
    () =>
      parts.flatMap(({ x, z, turn }) =>
        [-1, 1].map((side) => {
          const d = side * (PART.length / 2 - 0.14)
          return {
            p: [turn ? x : x + d, PART.height / 2, turn ? z + d : z] as [number, number, number],
            r: [0, turn ? Math.PI / 2 : 0, 0] as [number, number, number],
          }
        }),
      ),
    [parts],
  )

  const vias = useMemo<Instance[]>(() => {
    const random = seeded(5388)
    const items: Instance[] = []
    let guard = 0
    while (items.length < VIA_COUNT && guard++ < 4000) {
      const x = (random() * 2 - 1) * (BOARD_HALF - 4)
      const z = (random() * 2 - 1) * (BOARD_HALF - 4)
      const nearChip = ZONES.some((c) => Math.abs(c.x - x) < 14 && Math.abs(c.z - z) < 14)
      const nearPart = parts.some((p) => Math.hypot(p.x - x, p.z - z) < 3)
      const nearSecret = Math.hypot(SECRET.capacitor.x - x, SECRET.capacitor.z - z) < 6
      if (nearChip || nearPart || nearSecret || distanceToTraces(x, z) < 4 || Math.hypot(x, z) < 9) continue
      const scale = 0.7 + random() * 0.6
      items.push({ p: [x, 0.012, z], r: [-Math.PI / 2, 0, 0], s: [scale, scale, 1] })
    }
    return items
  }, [parts])

  const holeRings = useMemo<Instance[]>(() => MOUNTING_HOLES.map(([x, z]) => ({ p: [x, 0.014, z], r: [-Math.PI / 2, 0, 0] })), [])
  const holes = useMemo<Instance[]>(() => MOUNTING_HOLES.map(([x, z]) => ({ p: [x, 0.012, z], r: [-Math.PI / 2, 0, 0] })), [])

  return (
    <>
      <Instances items={vias}>
        <ringGeometry args={[0.22, 0.5, 20]} />
        <meshStandardMaterial color={colors.copper} roughness={0.4} metalness={0.3} />
      </Instances>

      <Instances items={resistorBodies} castShadow receiveShadow>
        <boxGeometry args={[PART.length, PART.height, PART.width]} />
        <meshStandardMaterial color={colors.chip} roughness={0.6} />
      </Instances>
      <Instances items={ceramicBodies} castShadow receiveShadow>
        <boxGeometry args={[PART.length, PART.height, PART.width]} />
        <meshStandardMaterial color={colors.ceramic} roughness={0.6} />
      </Instances>
      <Instances items={endCaps} castShadow>
        <boxGeometry args={[0.3, PART.height + 0.04, PART.width + 0.04]} />
        <meshStandardMaterial color={colors.metal} roughness={0.35} metalness={0.35} />
      </Instances>

      <Instances items={holeRings}>
        <ringGeometry args={[1.3, 2.1, 32]} />
        <meshStandardMaterial color={colors.copper} roughness={0.4} metalness={0.3} />
      </Instances>
      <Instances items={holes}>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial color={colors.workbench} />
      </Instances>

      <RigidBody type="fixed" colliders={false}>
        {parts.map(({ x, z, turn }, i) => (
          <CuboidCollider
            key={i}
            args={turn ? [PART.width / 2, PART.height / 2, PART.length / 2] : [PART.length / 2, PART.height / 2, PART.width / 2]}
            position={[x, PART.height / 2, z]}
          />
        ))}
      </RigidBody>

      {/* Optional extra decoration from Blender; visual only */}
      <ModelSlot name="decor" fallback={null} />
    </>
  )
}
