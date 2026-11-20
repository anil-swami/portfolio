import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { colors } from '../theme'
import { zoneById } from '../world/layout'
import { SilkLabel } from './SilkLabel'

const WIDTH = 2.6
const HEIGHT = 3.4
const DEPTH = 0.18
const SPACING = 3.1
const TILT = -0.3 // lean back so the titles face the camera
const ROW_OFFSET = { x: 4, z: -10 } // row sits north of the chip, clear of the incoming trace

/** One standing board (like an SD card) per project, with the project name printed on it. */
export function ProjectBoards() {
  const projects = content.projects.items
  const chip = zoneById('projects')
  const mid = (projects.length - 1) / 2

  return (
    <>
      {projects.map((project, i) => (
        <group key={project.name} position={[chip.x + ROW_OFFSET.x + (i - mid) * SPACING, 0, chip.z + ROW_OFFSET.z]} rotation={[TILT, 0, 0]}>
          <mesh position={[0, HEIGHT / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
            <meshStandardMaterial color={colors.chip} roughness={0.6} />
          </mesh>
          {/* Copper contacts along the bottom edge */}
          <mesh position={[0, 0.5, DEPTH / 2 + 0.006]}>
            <planeGeometry args={[WIDTH - 0.4, 0.5]} />
            <meshStandardMaterial color={colors.copper} roughness={0.4} metalness={0.3} />
          </mesh>
          <SilkLabel text={project.name} width={WIDTH - 0.3} height={2.2} size={0.5} flat={false} position={[0, 2.05, DEPTH / 2 + 0.012]} />
        </group>
      ))}

      <RigidBody type="fixed" colliders={false}>
        {projects.map((project, i) => (
          <CuboidCollider
            key={project.name}
            args={[WIDTH / 2, HEIGHT / 2, 0.6]}
            position={[chip.x + ROW_OFFSET.x + (i - mid) * SPACING, HEIGHT / 2, chip.z + ROW_OFFSET.z - 0.4]}
          />
        ))}
      </RigidBody>
    </>
  )
}
