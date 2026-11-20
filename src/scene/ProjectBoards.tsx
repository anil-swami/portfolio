import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { zoneById } from '../world/layout'
import { WoodSign } from './WoodSign'

const WIDTH = 2.6
const HEIGHT = 2.1
const BOARD_Y = 1.9
const SPACING = 3.2
const ROW_OFFSET = { x: 4, z: -11 } // row stands north of the cabin, clear of the arriving road

/** One wooden notice board per project, in a row beside the Projects cabin, turned towards the arriving road. */
export function ProjectBoards() {
  const projects = content.projects.items
  const cabin = zoneById('projects')
  const mid = (projects.length - 1) / 2
  // Point on the road the boards turn to face: 25 m back along the arrival direction.
  const lookX = cabin.x - cabin.arrive[0] * 25
  const lookZ = cabin.z - cabin.arrive[1] * 25

  const spots = projects.map((project, i) => {
    const x = cabin.x + ROW_OFFSET.x + (i - mid) * SPACING
    const z = cabin.z + ROW_OFFSET.z
    return { project, x, z, yaw: Math.atan2(lookX - x, lookZ - z) }
  })

  return (
    <>
      {spots.map(({ project, x, z, yaw }) => (
        <group key={project.name} position={[x, 0, z]} rotation={[0, yaw, 0]}>
          <WoodSign text={project.name} width={WIDTH} height={HEIGHT} boardY={BOARD_Y} textSize={0.42} style="paper" />
        </group>
      ))}

      <RigidBody type="fixed" colliders={false}>
        {spots.map(({ project, x, z, yaw }) => (
          <CuboidCollider
            key={project.name}
            args={[WIDTH / 2, (BOARD_Y + HEIGHT / 2) / 2, 0.25]}
            position={[x, (BOARD_Y + HEIGHT / 2) / 2, z]}
            rotation={[0, yaw, 0]}
          />
        ))}
      </RigidBody>
    </>
  )
}
