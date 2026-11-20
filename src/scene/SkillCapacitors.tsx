import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { colors } from '../theme'
import { zoneById } from '../world/layout'
import { Instances, type Instance } from './Instances'
import { SilkLabel } from './SilkLabel'

const RADIUS = 0.85
const HEIGHT = 2.1
const ARC_RADIUS = 12
const ARC_CENTRE = -Math.PI * 0.16 // points away from the spawn pad, slightly north of east
const ARC_SPREAD = Math.PI * 0.78

/** One capacitor per skill, in an arc behind the Skills chip, each with its name printed beside it. */
export function SkillCapacitors() {
  const skills = content.skills.zones
  const chip = zoneById('skills')

  const spots = useMemo(
    () =>
      skills.map((_, i) => {
        const t = skills.length > 1 ? i / (skills.length - 1) - 0.5 : 0
        const angle = ARC_CENTRE + t * ARC_SPREAD
        return [chip.x + Math.cos(angle) * ARC_RADIUS, chip.z + Math.sin(angle) * ARC_RADIUS] as const
      }),
    [skills, chip],
  )

  const bodies: Instance[] = useMemo(() => spots.map(([x, z]) => ({ p: [x, HEIGHT / 2, z] })), [spots])
  const tops: Instance[] = useMemo(() => spots.map(([x, z]) => ({ p: [x, HEIGHT + 0.03, z] })), [spots])
  const pads: Instance[] = useMemo(() => spots.map(([x, z]) => ({ p: [x, 0.02, z] })), [spots])

  return (
    <>
      <Instances items={bodies} castShadow receiveShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, HEIGHT, 24]} />
        <meshStandardMaterial color={colors.chip} roughness={0.5} />
      </Instances>
      <Instances items={tops}>
        <cylinderGeometry args={[RADIUS * 0.86, RADIUS * 0.86, 0.06, 24]} />
        <meshStandardMaterial color={colors.metal} roughness={0.3} metalness={0.4} />
      </Instances>
      <Instances items={pads} receiveShadow>
        <cylinderGeometry args={[RADIUS + 0.3, RADIUS + 0.3, 0.04, 24]} />
        <meshStandardMaterial color={colors.copper} roughness={0.4} metalness={0.3} />
      </Instances>

      {spots.map(([x, z], i) => (
        <SilkLabel key={skills[i].name} text={skills[i].name} width={3.9} height={1.5} size={0.58} position={[x, 0.05, z + RADIUS + 1.15]} />
      ))}

      <RigidBody type="fixed" colliders={false}>
        {spots.map(([x, z], i) => (
          <CylinderCollider key={i} args={[HEIGHT / 2, RADIUS]} position={[x, HEIGHT / 2, z]} />
        ))}
      </RigidBody>
    </>
  )
}
