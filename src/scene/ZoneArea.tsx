import { useGame } from '../state/store'
import { colors } from '../theme'
import { ZONE_AREA_RADIUS, type Zone } from '../world/layout'

const LINE = 0.28 // ring line width in metres
const Y = 0.06 // just above the copper traces

/**
 * The fixed area around a chip, drawn as a silkscreen ring on the board.
 * It lights up amber while the car is inside it.
 */
export function ZoneArea({ zone }: { zone: Zone }) {
  const inside = useGame((s) => s.activeZone === zone.id)
  const color = inside ? colors.ledAmber : colors.silkscreen

  return (
    <group position={[zone.x, Y, zone.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh renderOrder={1}>
        <ringGeometry args={[ZONE_AREA_RADIUS - LINE, ZONE_AREA_RADIUS, 96]} />
        <meshBasicMaterial color={color} transparent opacity={inside ? 0.95 : 0.55} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh renderOrder={1}>
        <circleGeometry args={[ZONE_AREA_RADIUS - LINE, 96]} />
        <meshBasicMaterial color={color} transparent opacity={inside ? 0.12 : 0.04} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
