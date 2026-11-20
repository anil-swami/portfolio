import { useMemo } from 'react'
import { colors } from '../theme'
import { CABIN_SIZE } from '../world/layout'
import { logTexture } from './textures'

const W = CABIN_SIZE
const BASE = 0.45 // stone foundation height
const WALL = 3.1
const ROOF_RISE = 2.3
const OVERHANG = 0.6

/** Lit windows glow amber once the cabin's lantern is on. */
function windowMaterial(on: boolean) {
  return (
    <meshStandardMaterial
      color={on ? colors.glow : colors.woodDark}
      emissive={colors.glow}
      emissiveIntensity={on ? 1.4 : 0}
      roughness={0.4}
    />
  )
}

/**
 * Code-built log cabin, the fallback for each zone model. Its door faces +Z.
 * `on` lights the windows (the power-on sequence lights one cabin after another).
 */
export function Cabin({ on }: { on: boolean }) {
  const walls = useMemo(() => {
    const tex = logTexture().clone()
    tex.repeat.set(2, WALL / 2.4)
    tex.needsUpdate = true
    return tex
  }, [])

  const wallTop = BASE + WALL
  const half = W / 2
  // Roof planes: each covers half the depth plus the overhang, sloping down from the ridge.
  const slope = Math.atan2(ROOF_RISE, half)
  const planeLength = Math.hypot(half + OVERHANG, ROOF_RISE + OVERHANG * Math.tan(slope))

  return (
    <group>
      {/* Stone foundation */}
      <mesh position={[0, BASE / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.4, BASE, W + 0.4]} />
        <meshStandardMaterial color={colors.stone} roughness={1} />
      </mesh>
      {/* Log walls */}
      <mesh position={[0, BASE + WALL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, WALL, W]} />
        <meshStandardMaterial map={walls} roughness={0.9} />
      </mesh>
      {/*
        Gable ends: a 3-sided cylinder is a triangular prism with its apex towards local +Z.
        Tip it so the apex points up, then turn it so the prism runs along X under the ridge.
      */}
      <group position={[0, wallTop + ROOF_RISE / 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[half / 0.866, W, ROOF_RISE / 1.5]} castShadow>
          <cylinderGeometry args={[1, 1, 1, 3]} />
          <meshStandardMaterial color={colors.log} roughness={0.9} />
        </mesh>
      </group>
      {/* Roof planes */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, wallTop + ROOF_RISE / 2 + 0.05, (side * half) / 2]}
          rotation={[side * slope, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[W + OVERHANG * 2, 0.28, planeLength]} />
          <meshStandardMaterial color={colors.roof} roughness={0.85} />
        </mesh>
      ))}
      {/* Chimney */}
      <mesh position={[W * 0.25, wallTop + ROOF_RISE * 0.75, -half * 0.35]} castShadow>
        <boxGeometry args={[0.9, 2.4, 0.9]} />
        <meshStandardMaterial color={colors.stoneDark} roughness={1} />
      </mesh>
      {/* Door and windows on the front (+Z) */}
      <mesh position={[0, BASE + 1.15, half + 0.03]}>
        <boxGeometry args={[1.5, 2.3, 0.12]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 2.3, BASE + 1.75, half + 0.03]}>
          <boxGeometry args={[1.2, 1, 0.1]} />
          {windowMaterial(on)}
        </mesh>
      ))}
      {/* Side windows */}
      {[-1, 1].map((side) => (
        <mesh key={`s${side}`} position={[side * (half + 0.03), BASE + 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.2, 1, 0.1]} />
          {windowMaterial(on)}
        </mesh>
      ))}
      {/* Porch step */}
      <mesh position={[0, BASE / 2, half + 0.7]} receiveShadow castShadow>
        <boxGeometry args={[2.4, BASE, 1]} />
        <meshStandardMaterial color={colors.wood} roughness={0.9} />
      </mesh>
    </group>
  )
}

/** A lantern on a post beside the door; it lights during the power-on sequence. */
export function Lantern({ on }: { on: boolean }) {
  return (
    <group position={[1.6, 0, W / 2 + 1.1]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.14, 1.8, 0.14]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[0.38, 0.45, 0.38]} />
        <meshStandardMaterial
          color={on ? colors.glow : colors.ledOff}
          emissive={colors.ledAmber}
          emissiveIntensity={on ? 2.4 : 0}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}
