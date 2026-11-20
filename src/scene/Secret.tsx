import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { SECRET } from '../world/layout'

/** A hidden LED behind a large capacitor near the corner. Driving up to it shows a toast, once. */
export function Secret() {
  const found = useGame((s) => s.secretFound)
  const findSecret = useGame((s) => s.findSecret)
  const { led, capacitor: cap } = SECRET

  return (
    <>
      {/* The large capacitor that hides it */}
      <mesh position={[cap.x, cap.height / 2, cap.z]} castShadow receiveShadow>
        <cylinderGeometry args={[cap.radius, cap.radius, cap.height, 32]} />
        <meshStandardMaterial color={colors.chip} roughness={0.5} />
      </mesh>
      <mesh position={[cap.x, cap.height + 0.04, cap.z]}>
        <cylinderGeometry args={[cap.radius * 0.88, cap.radius * 0.88, 0.08, 32]} />
        <meshStandardMaterial color={colors.metal} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* The LED */}
      <mesh position={[led.x, 0.1, led.z]} receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial color={colors.silkscreen} roughness={0.6} />
      </mesh>
      <mesh position={[led.x, 0.2, led.z]}>
        <sphereGeometry args={[0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={found ? colors.ledAmber : colors.ledOff}
          emissive={colors.ledAmber}
          emissiveIntensity={found ? 2.4 : 0}
          roughness={0.3}
        />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[cap.height / 2, cap.radius]} position={[cap.x, cap.height / 2, cap.z]} />
        <BallCollider
          sensor
          args={[3]}
          position={[led.x, 0.5, led.z]}
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.userData?.car) findSecret(content.world.secret)
          }}
        />
      </RigidBody>
    </>
  )
}
