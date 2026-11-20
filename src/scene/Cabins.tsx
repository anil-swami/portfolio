import { useCallback, useEffect, useMemo, useState } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from 'three'
import { content } from '../content'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { CABIN_SIZE, ROAD_WIDTH, ZONE_ROADS, ZONES, ZONE_AREA_RADIUS, type Zone } from '../world/layout'
import { Cabin, Lantern } from './Cabin'
import { ModelSlot, type SlotName } from './models'
import { Signboard } from './Signboard'
import { ZoneArea } from './ZoneArea'

const HALF = CABIN_SIZE / 2
const PORCH = 0.9
const SIGN_GAP = 3.2 // how far the sign stands out from the porch, along the road
const COLLIDER_HEIGHT = 6

const slotOf = (zone: Zone) => `zone-${zone.id}` as SlotName

/**
 * Where a zone's sign stands: on the last stretch of road into the cabin, facing the car
 * as it arrives. Roads that arrive diagonally meet a corner, so the sign stands further out.
 */
function signSpot(index: number) {
  const route = ZONE_ROADS[index]
  const [ax, az] = route[route.length - 2]
  const [bx, bz] = route[route.length - 1]
  const length = Math.hypot(bx - ax, bz - az)
  const dx = (bx - ax) / length
  const dz = (bz - az) / length
  const edge = HALF / Math.max(Math.abs(dx), Math.abs(dz))
  const back = edge + PORCH + SIGN_GAP
  // The sign's front faces back down the road, towards the arriving car.
  return { x: -dx * back, z: -dz * back, yaw: Math.atan2(-dx, -dz) }
}

function ZoneCabin({ zone, index }: { zone: Zone; index: number }) {
  const on = useGame((s) => s.ledsOn > index)
  const title = content[zone.id].title
  const sign = useMemo(() => signSpot(index), [index])
  // The door faces the arriving car.
  const yaw = Math.atan2(-zone.arrive[0], -zone.arrive[1])
  // A zone model may bring its own light: any mesh whose name starts with "led" glows when on.
  const [modelLed, setModelLed] = useState<Mesh | null>(null)

  const onModel = useCallback((root: Object3D | null) => {
    let found: Mesh | null = null
    root?.traverse((o) => {
      if (!found && /^led/i.test(o.name) && (o as Mesh).isMesh) found = o as Mesh
    })
    if (found) {
      const mesh = found as Mesh
      mesh.material = (mesh.material as MeshStandardMaterial).clone()
    }
    setModelLed(found)
  }, [])

  useEffect(() => {
    if (!modelLed) return
    const material = modelLed.material as MeshStandardMaterial
    material.emissive = new Color(colors.ledAmber)
    material.emissiveIntensity = on ? 2.2 : 0
  }, [modelLed, on])

  return (
    <group position={[zone.x, 0, zone.z]}>
      <group rotation={[0, yaw, 0]}>
        <ModelSlot name={slotOf(zone)} fallback={<Cabin on={on} />} onReady={onModel} />
        {!modelLed && <Lantern on={on} />}
      </group>
      <Signboard text={title} x={sign.x} z={sign.z} yaw={sign.yaw} span={ROAD_WIDTH + 2.6} />
    </group>
  )
}

/** The five content cabins: solid bodies plus the fixed circular areas that open each zone's panel. */
export function Cabins() {
  const setActiveZone = useGame((s) => s.setActiveZone)
  const clearActiveZone = useGame((s) => s.clearActiveZone)

  return (
    <>
      {ZONES.map((zone, i) => (
        <ZoneCabin key={zone.id} zone={zone} index={i} />
      ))}
      {ZONES.map((zone) => (
        <ZoneArea key={`area-${zone.id}`} zone={zone} />
      ))}
      <RigidBody type="fixed" colliders={false}>
        {ZONES.map((zone) => (
          <CuboidCollider
            key={zone.id}
            args={[HALF + 0.3, COLLIDER_HEIGHT / 2, HALF + 0.3]}
            position={[zone.x, COLLIDER_HEIGHT / 2, zone.z]}
          />
        ))}
        {ZONES.map((zone) => (
          <CylinderCollider
            key={`sensor-${zone.id}`}
            sensor
            args={[2, ZONE_AREA_RADIUS]}
            position={[zone.x, 2, zone.z]}
            onIntersectionEnter={(e) => {
              if (e.other.rigidBodyObject?.userData?.car) setActiveZone(zone.id)
            }}
            onIntersectionExit={(e) => {
              if (e.other.rigidBodyObject?.userData?.car) clearActiveZone(zone.id)
            }}
          />
        ))}
      </RigidBody>
    </>
  )
}
