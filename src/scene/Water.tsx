import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { PLAY_HALF, PONDS, RIVER, RIVER_WIDTH, ROAD_WIDTH } from '../world/layout'
import { seeded } from '../world/random'
import { roadDistance } from '../world/worldMap'
import { prefersReducedMotion } from '../state/store'
import { Instances, type Instance } from './Instances'
import { ribbonGeometry } from './ribbon'
import { waterTexture } from './textures'

const WATER_Y = 0.06
const BANK_Y = 0.04
const BANK = 2.6 // width of the bank on each side
const FLOW = 0.12 // river texture repeats per second

/** Reeds along the banks and lily pads on the ponds. */
function useShoreDetails() {
  return useMemo(() => {
    const random = seeded(7717)
    const reeds: Instance[] = []
    const pads: Instance[] = []
    const blossoms: Instance[] = []
    const reedAt = (x: number, z: number) => {
      const count = 3 + Math.floor(random() * 4)
      for (let i = 0; i < count; i++) {
        const h = 0.8 + random() * 0.9
        reeds.push({
          p: [x + (random() - 0.5) * 1.2, h / 2, z + (random() - 0.5) * 1.2],
          r: [(random() - 0.5) * 0.25, 0, (random() - 0.5) * 0.25],
          s: [1, h, 1],
          c: random() < 0.3 ? colors.mud : colors.reed,
        })
      }
    }
    // River banks: a clump every few metres on alternating sides, skipping road crossings.
    for (let i = 1; i < RIVER.length - 1; i += 3) {
      const [x, z] = RIVER[i]
      if (Math.abs(x) > PLAY_HALF + 20 || roadDistance(x, z) < 14 || random() < 0.35) continue
      const [ax, az] = RIVER[i - 1]
      const [bx, bz] = RIVER[i + 1]
      const len = Math.hypot(bx - ax, bz - az) || 1
      const side = random() < 0.5 ? -1 : 1
      const out = RIVER_WIDTH / 2 + 0.2
      reedAt(x + (-(bz - az) / len) * side * out, z + ((bx - ax) / len) * side * out)
    }
    for (const pond of PONDS) {
      const clumps = Math.round(pond.r * 0.9)
      for (let i = 0; i < clumps; i++) {
        const a = random() * Math.PI * 2
        reedAt(pond.x + Math.cos(a) * (pond.r + 0.1), pond.z + Math.sin(a) * (pond.r + 0.1))
      }
      const lilies = Math.round(pond.r * 0.8)
      for (let i = 0; i < lilies; i++) {
        const a = random() * Math.PI * 2
        const d = pond.r * (0.35 + random() * 0.5)
        const x = pond.x + Math.cos(a) * d
        const z = pond.z + Math.sin(a) * d
        const s = 0.45 + random() * 0.35
        pads.push({ p: [x, WATER_Y + 0.02, z], r: [0, random() * Math.PI * 2, 0], s: [s, 1, s] })
        if (random() < 0.3) blossoms.push({ p: [x + 0.1, WATER_Y + 0.12, z], s: [0.14, 0.1, 0.14] })
      }
    }
    return { reeds, pads, blossoms }
  }, [])
}

/** The river, its banks and the ponds. The water is solid to the car, except where a bridge crosses. */
export function Water() {
  const riverTex = useMemo(() => {
    const t = waterTexture().clone()
    t.repeat.set(RIVER_WIDTH / 10, 1)
    t.needsUpdate = true
    return t
  }, [])
  const pondTex = useMemo(() => {
    const t = waterTexture().clone()
    t.repeat.set(3, 3)
    t.needsUpdate = true
    return t
  }, [])
  const river = useMemo(
    () => ribbonGeometry([RIVER], { width: RIVER_WIDTH, y: WATER_Y, colorA: '#ffffff', colorB: '#ffffff', seed: 1 }),
    [],
  )
  const banks = useMemo(
    () => ribbonGeometry([RIVER], { width: RIVER_WIDTH + BANK * 2, y: BANK_Y, colorA: colors.sand, colorB: colors.mud, seed: 8 }),
    [],
  )
  const { reeds, pads, blossoms } = useShoreDetails()

  useEffect(
    () => () => {
      river.dispose()
      banks.dispose()
      riverTex.dispose()
      pondTex.dispose()
    },
    [river, banks, riverTex, pondTex],
  )

  useFrame((_, delta) => {
    if (prefersReducedMotion()) return
    riverTex.offset.y -= delta * FLOW
    pondTex.offset.x += delta * 0.01
    pondTex.offset.y += delta * 0.006
  })

  // The river is solid in short boxes along its length, left open where roads (and bridges) cross.
  const riverBoxes = useMemo(() => {
    const boxes: { x: number; z: number; yaw: number; half: number }[] = []
    for (let i = 0; i < RIVER.length - 1; i++) {
      const [ax, az] = RIVER[i]
      const [bx, bz] = RIVER[i + 1]
      const x = (ax + bx) / 2
      const z = (az + bz) / 2
      if (Math.abs(x) > PLAY_HALF + 2 || Math.abs(z) > PLAY_HALF + 2) continue
      if (roadDistance(x, z) < ROAD_WIDTH / 2 + 1.5) continue
      boxes.push({ x, z, yaw: Math.atan2(bx - ax, bz - az), half: Math.hypot(bx - ax, bz - az) / 2 + 0.3 })
    }
    return boxes
  }, [])

  return (
    <>
      <mesh geometry={banks} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <mesh geometry={river} receiveShadow>
        <meshStandardMaterial map={riverTex} roughness={0.2} metalness={0.1} />
      </mesh>

      {PONDS.map((p) => (
        <group key={`${p.x},${p.z}`} position={[p.x, 0, p.z]}>
          <mesh position={[0, BANK_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[p.r + BANK, 40]} />
            <meshStandardMaterial color={colors.sand} roughness={1} />
          </mesh>
          <mesh position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[p.r, 40]} />
            <meshStandardMaterial map={pondTex} color={colors.waterDeep} roughness={0.15} metalness={0.1} />
          </mesh>
        </group>
      ))}

      <Instances items={reeds}>
        <coneGeometry args={[0.05, 1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </Instances>
      <Instances items={pads}>
        <cylinderGeometry args={[1, 1, 0.03, 10]} />
        <meshStandardMaterial color={colors.lily} roughness={0.8} />
      </Instances>
      <Instances items={blossoms}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#F7A8C8" roughness={0.6} />
      </Instances>

      <RigidBody type="fixed" colliders={false}>
        {riverBoxes.map((b, i) => (
          <CuboidCollider key={i} args={[RIVER_WIDTH / 2 - 1, 2, b.half]} position={[b.x, 1, b.z]} rotation={[0, b.yaw, 0]} />
        ))}
        {PONDS.map((p) => (
          <CylinderCollider key={`${p.x},${p.z}`} args={[2, p.r - 0.6]} position={[p.x, 1, p.z]} />
        ))}
      </RigidBody>
    </>
  )
}
