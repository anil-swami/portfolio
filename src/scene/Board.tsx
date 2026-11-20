import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { BOARD_HALF, BOARD_SIZE } from '../world/layout'

const THICKNESS = 0.4
const EDGE = 1.2
const WALL_HEIGHT = 3

/** The PCB itself, the workbench around it, the flat ground collider and the invisible edge walls. */
export function Board() {
  return (
    <>
      {/* Board surface, with a slightly darker rim showing around it */}
      <mesh position={[0, -THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE - EDGE * 2, THICKNESS, BOARD_SIZE - EDGE * 2]} />
        <meshStandardMaterial color={colors.solderMask} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, -THICKNESS / 2 - 0.01, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE, THICKNESS, BOARD_SIZE]} />
        <meshStandardMaterial color={colors.edgeMask} roughness={0.6} />
      </mesh>

      {/* Workbench beyond the board edge */}
      <mesh position={[0, -THICKNESS, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color={colors.workbench} roughness={0.9} />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        {/* Flat ground. Friction 0: the car controller handles grip itself. */}
        <CuboidCollider args={[BOARD_HALF + 2, 0.5, BOARD_HALF + 2]} position={[0, -0.5, 0]} friction={0} />
        {/* Invisible walls at the board edge */}
        <CuboidCollider args={[BOARD_HALF + 2, WALL_HEIGHT, 1]} position={[0, WALL_HEIGHT, -BOARD_HALF - 1]} />
        <CuboidCollider args={[BOARD_HALF + 2, WALL_HEIGHT, 1]} position={[0, WALL_HEIGHT, BOARD_HALF + 1]} />
        <CuboidCollider args={[1, WALL_HEIGHT, BOARD_HALF + 2]} position={[-BOARD_HALF - 1, WALL_HEIGHT, 0]} />
        <CuboidCollider args={[1, WALL_HEIGHT, BOARD_HALF + 2]} position={[BOARD_HALF + 1, WALL_HEIGHT, 0]} />
      </RigidBody>
    </>
  )
}
