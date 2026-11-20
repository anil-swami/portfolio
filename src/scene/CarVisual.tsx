import { useCallback, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Object3D } from 'three'
import { colors } from '../theme'
import { ModelSlot } from './models'

export interface WheelState {
  /** Rolling angle in radians. */
  spin: number
  /** Front wheel steering angle in radians (positive = left). */
  steer: number
}

interface CarVisualProps {
  wheels: RefObject<WheelState>
}

const WHEEL_NAMES = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'] as const
const WHEEL_RADIUS = 0.34
// [x, z] of each wheel, in the same order as WHEEL_NAMES. +X is the car's left, +Z its front.
const WHEEL_SPOTS: [number, number][] = [
  [0.86, 0.9],
  [-0.86, 0.9],
  [0.86, -0.9],
  [-0.86, -0.9],
]

/** The car's looks: car.glb when present, otherwise the code-built amber car. */
export function CarVisual({ wheels }: CarVisualProps) {
  const fallbackWheels = useRef<(Group | null)[]>([])
  const modelWheels = useRef<(Object3D | undefined)[]>([])

  const onModel = useCallback((root: Object3D | null) => {
    modelWheels.current = root ? WHEEL_NAMES.map((name) => root.getObjectByName(name)) : []
    for (const wheel of modelWheels.current) if (wheel) wheel.rotation.order = 'YXZ'
  }, [])

  useFrame(() => {
    const { spin, steer } = wheels.current
    const targets = modelWheels.current.length ? modelWheels.current : fallbackWheels.current
    targets.forEach((wheel, i) => {
      if (!wheel) return
      wheel.rotation.x = spin
      if (i < 2) wheel.rotation.y = steer
    })
  })

  const fallback = (
    <group>
      {/* Body */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[1.7, 0.46, 2.76]} />
        <meshStandardMaterial color={colors.ledAmber} roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.42, -0.25]} castShadow>
        <boxGeometry args={[1.42, 0.36, 1.4]} />
        <meshStandardMaterial color={colors.chip} roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Bumpers */}
      <mesh position={[0, -0.12, 1.36]}>
        <boxGeometry args={[1.76, 0.2, 0.12]} />
        <meshStandardMaterial color={colors.chip} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.12, -1.36]}>
        <boxGeometry args={[1.76, 0.2, 0.12]} />
        <meshStandardMaterial color={colors.chip} roughness={0.6} />
      </mesh>
      {/* Headlights and tail lights */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`h${x}`} position={[x, 0.08, 1.385]}>
          <boxGeometry args={[0.36, 0.16, 0.04]} />
          <meshStandardMaterial color={colors.silkscreen} emissive={colors.silkscreen} emissiveIntensity={0.9} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <mesh key={`t${x}`} position={[x, 0.08, -1.385]}>
          <boxGeometry args={[0.3, 0.12, 0.04]} />
          <meshStandardMaterial color="#C2362B" emissive="#C2362B" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Wheels */}
      {WHEEL_SPOTS.map(([x, z], i) => (
        <group
          key={i}
          ref={(g) => {
            fallbackWheels.current[i] = g
          }}
          position={[x, WHEEL_RADIUS - 0.5, z]}
          rotation-order="YXZ"
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 20]} />
            <meshStandardMaterial color="#2B2E31" roughness={0.85} />
          </mesh>
          {/* A hub bar, so the spin is visible */}
          <mesh position={[x > 0 ? 0.155 : -0.155, 0, 0]}>
            <boxGeometry args={[0.02, 0.4, 0.12]} />
            <meshStandardMaterial color={colors.metal} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )

  return <ModelSlot name="car" fallback={fallback} onReady={onModel} />
}
