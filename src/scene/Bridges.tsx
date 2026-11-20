import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { BRIDGES, type Bridge } from '../world/bridges'
import { ROAD_WIDTH } from '../world/layout'
import { plankTexture } from './textures'

const DECK_WIDTH = ROAD_WIDTH + 1.2
const DECK_TOP = 0.14 // low enough that the car rolls over it without a ramp
const RAIL_HEIGHT = 1.1
const POST_SPACING = 2.4

/** A wooden bridge: plank deck, posts and rails on both sides. The rails are solid. */
function WoodBridge({ bridge }: { bridge: Bridge }) {
  const deckTex = useMemo(() => {
    const t = plankTexture().clone()
    t.repeat.set(1, bridge.length / 8)
    t.needsUpdate = true
    return t
  }, [bridge.length])

  const posts = Math.max(2, Math.round(bridge.length / POST_SPACING) + 1)
  const half = bridge.length / 2

  return (
    <group position={[bridge.x, 0, bridge.z]} rotation={[0, bridge.yaw, 0]}>
      <mesh position={[0, DECK_TOP - 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[DECK_WIDTH, 0.3, bridge.length]} />
        <meshStandardMaterial map={deckTex} roughness={0.9} />
      </mesh>
      {/* Beams under the deck edges */}
      {[-1, 1].map((side) => (
        <mesh key={`b${side}`} position={[side * (DECK_WIDTH / 2 - 0.15), DECK_TOP - 0.35, 0]} castShadow>
          <boxGeometry args={[0.35, 0.4, bridge.length + 0.4]} />
          <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (DECK_WIDTH / 2 - 0.12), 0, 0]}>
          {Array.from({ length: posts }, (_, i) => (
            <mesh key={i} position={[0, DECK_TOP + RAIL_HEIGHT / 2, -half + (i * bridge.length) / (posts - 1)]} castShadow>
              <boxGeometry args={[0.18, RAIL_HEIGHT, 0.18]} />
              <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
            </mesh>
          ))}
          {[RAIL_HEIGHT, RAIL_HEIGHT * 0.55].map((y) => (
            <mesh key={y} position={[0, DECK_TOP + y, 0]} castShadow>
              <boxGeometry args={[0.12, 0.12, bridge.length]} />
              <meshStandardMaterial color={colors.wood} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      <RigidBody type="fixed" colliders={false}>
        {[-1, 1].map((side) => (
          <CuboidCollider
            key={side}
            args={[0.15, 1, half]}
            position={[side * (DECK_WIDTH / 2 - 0.12), 1, 0]}
          />
        ))}
      </RigidBody>
    </group>
  )
}

/** Bridges wherever a road crosses the river. */
export function Bridges() {
  return (
    <>
      {BRIDGES.map((b) => (
        <WoodBridge key={`${b.x.toFixed(1)},${b.z.toFixed(1)}`} bridge={b} />
      ))}
    </>
  )
}
