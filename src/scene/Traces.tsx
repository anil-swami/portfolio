import { content } from '../content'
import { colors } from '../theme'
import { SPAWN_PAD_RADIUS, TRACE_HEIGHT, TRACE_WIDTH, TRACES } from '../world/layout'
import { SilkLabel } from './SilkLabel'

function Copper() {
  return <meshStandardMaterial color={colors.copper} roughness={0.4} metalness={0.3} />
}

/** The round spawn pad, the name printed in front of it, and the copper roads to each chip. */
export function Traces() {
  return (
    <>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[SPAWN_PAD_RADIUS, SPAWN_PAD_RADIUS, 0.06, 48]} />
        <Copper />
      </mesh>
      <SilkLabel text={content.start.name} width={7} height={1.8} size={1.35} position={[0, 0.05, SPAWN_PAD_RADIUS + 2.4]} />

      {TRACES.map((route, r) =>
        route.slice(0, -1).map(([ax, az], i) => {
          const [bx, bz] = route[i + 1]
          const length = Math.hypot(bx - ax, bz - az)
          return (
            <group key={`${r}-${i}`}>
              <mesh
                position={[(ax + bx) / 2, TRACE_HEIGHT / 2, (az + bz) / 2]}
                rotation={[0, Math.atan2(bx - ax, bz - az), 0]}
                receiveShadow
              >
                <boxGeometry args={[TRACE_WIDTH, TRACE_HEIGHT, length]} />
                <Copper />
              </mesh>
              {/* Round joint at each bend */}
              {i > 0 && (
                <mesh position={[ax, TRACE_HEIGHT / 2 - 0.001, az]} receiveShadow>
                  <cylinderGeometry args={[TRACE_WIDTH / 2, TRACE_WIDTH / 2, TRACE_HEIGHT, 32]} />
                  <Copper />
                </mesh>
              )}
            </group>
          )
        }),
      )}
    </>
  )
}
