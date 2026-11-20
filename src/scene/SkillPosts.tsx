import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { colors } from '../theme'
import { zoneById } from '../world/layout'
import { Instances, type Instance } from './Instances'
import { WoodSign } from './WoodSign'

const RADIUS = 0.6
const HEIGHT = 2.6
const ARC_RADIUS = 13
const ARC_SPREAD = Math.PI * 0.78

/** One carved wooden post per skill, in an arc beyond the Skills cabin, each with a name placard facing it. */
export function SkillPosts() {
  const skills = content.skills.zones
  const cabin = zoneById('skills')
  // The arc opens away from the arriving road, behind the cabin.
  const centre = Math.atan2(cabin.arrive[1], cabin.arrive[0])

  const spots = useMemo(
    () =>
      skills.map((_, i) => {
        const t = skills.length > 1 ? i / (skills.length - 1) - 0.5 : 0
        const angle = centre + t * ARC_SPREAD
        return [cabin.x + Math.cos(angle) * ARC_RADIUS, cabin.z + Math.sin(angle) * ARC_RADIUS] as const
      }),
    [skills, cabin, centre],
  )

  const logs: Instance[] = useMemo(() => spots.map(([x, z]) => ({ p: [x, HEIGHT / 2, z] })), [spots])
  const bands: Instance[] = useMemo(
    () => spots.flatMap(([x, z]) => [0.7, 1.9].map((y) => ({ p: [x, y, z] as [number, number, number] }))),
    [spots],
  )
  const caps: Instance[] = useMemo(() => spots.map(([x, z]) => ({ p: [x, HEIGHT, z] })), [spots])

  return (
    <>
      <Instances items={logs} castShadow receiveShadow>
        <cylinderGeometry args={[RADIUS * 0.9, RADIUS, HEIGHT, 12]} />
        <meshStandardMaterial color={colors.log} roughness={0.9} />
      </Instances>
      {/* Carved bands */}
      <Instances items={bands}>
        <cylinderGeometry args={[RADIUS * 1.04, RADIUS * 1.04, 0.22, 12]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
      </Instances>
      {/* Rounded top */}
      <Instances items={caps} castShadow>
        <sphereGeometry args={[RADIUS * 0.9, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={colors.woodLight} roughness={0.85} />
      </Instances>

      {/* Name placards on the cabin side of each post, facing the cabin */}
      {spots.map(([x, z], i) => {
        const toX = cabin.x - x
        const toZ = cabin.z - z
        const d = Math.hypot(toX, toZ)
        const out = RADIUS + 0.45
        return (
          <group key={skills[i].name} position={[x + (toX / d) * out, 0, z + (toZ / d) * out]} rotation={[0, Math.atan2(toX, toZ), 0]}>
            <WoodSign text={skills[i].name} width={3.4} height={1.2} boardY={1.1} textSize={0.52} twoSided />
          </group>
        )
      })}

      <RigidBody type="fixed" colliders={false}>
        {spots.map(([x, z], i) => (
          <CylinderCollider key={i} args={[HEIGHT / 2, RADIUS]} position={[x, HEIGHT / 2, z]} />
        ))}
      </RigidBody>
    </>
  )
}
