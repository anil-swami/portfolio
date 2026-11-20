import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { CRATE_TOWER } from '../world/layout'
import { ModelSlot } from './models'
import { crateTexture } from './textures'

const ROWS = [4, 3, 2, 1] // 10 crates stacked as a pyramid
const GAP = 1.04

const crates = ROWS.flatMap((count, row) =>
  Array.from({ length: count }, (_, i) => ({
    key: `${row}-${i}`,
    position: [CRATE_TOWER.x + (i - (count - 1) / 2) * GAP, 0.5 + row * 1.005, CRATE_TOWER.z] as [number, number, number],
  })),
)

/** A code-built wooden crate, 1 x 1 x 1 m. */
function CrateFallback() {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={crateTexture()} roughness={0.85} />
    </mesh>
  )
}

/** Loose crates the car can knock over. */
export function CrateTower() {
  return (
    <>
      {crates.map((crate) => (
        <RigidBody key={crate.key} colliders={false} position={crate.position} linearDamping={0.3} angularDamping={0.6}>
          <CuboidCollider args={[0.5, 0.5, 0.5]} friction={1} restitution={0.05} density={0.35} />
          <ModelSlot name="crate" fallback={<CrateFallback />} />
        </RigidBody>
      ))}
    </>
  )
}
