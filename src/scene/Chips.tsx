import { useCallback, useEffect, useMemo, useState } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from 'three'
import { content } from '../content'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { CHIP_HEIGHT, CHIP_SIZE, ZONES, ZONE_SENSOR_HALF, type Zone } from '../world/layout'
import { Instances, type Instance } from './Instances'
import { hasModel, ModelSlot, type SlotName } from './models'
import { SilkLabel } from './SilkLabel'

const HALF = CHIP_SIZE / 2
const PINS_PER_SIDE = 8
const PIN_REACH = 0.9

const slotOf = (zone: Zone) => `zone-${zone.id}` as SlotName

/** The amber LED on a chip. Lights up during the power-on sequence. */
function Led({ on }: { on: boolean }) {
  return (
    <group position={[-HALF + 1.1, CHIP_HEIGHT, HALF - 1.1]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.24, 20]} />
        <meshStandardMaterial
          color={on ? colors.ledAmber : colors.ledOff}
          emissive={colors.ledAmber}
          emissiveIntensity={on ? 2.2 : 0}
          roughness={0.3}
        />
      </mesh>
      {on && (
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.05, 24]} />
          <meshBasicMaterial color={colors.ledAmber} transparent opacity={0.28} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function Chip({ zone, index }: { zone: Zone; index: number }) {
  const on = useGame((s) => s.ledsOn > index)
  const title = content[zone.id].title
  // A zone model may bring its own LED: any mesh whose name starts with "led".
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

  const body = (
    <group>
      <mesh position={[0, CHIP_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[CHIP_SIZE, CHIP_HEIGHT, CHIP_SIZE]} />
        <meshStandardMaterial color={colors.chip} roughness={0.7} />
      </mesh>
      {/* Laser-marked title on top of the package */}
      <SilkLabel text={title} width={5.6} height={3.4} size={0.95} color={colors.chipMark} position={[0.6, CHIP_HEIGHT + 0.012, -0.4]} />
    </group>
  )

  return (
    <group position={[zone.x, 0, zone.z]}>
      <ModelSlot name={slotOf(zone)} fallback={body} onReady={onModel} />
      {!modelLed && <Led on={on} />}
      <SilkLabel
        text={`${zone.ref} ${title}`}
        width={11}
        height={3}
        size={1.05}
        plate
        position={[0, 0.075, HALF + PIN_REACH + 1.7]}
      />
    </group>
  )
}

/** Pins along all four sides of every code-built chip, as one instanced mesh. */
function ChipPins() {
  const pins = useMemo(() => {
    const items: Instance[] = []
    for (const zone of ZONES) {
      if (hasModel(slotOf(zone))) continue
      for (let i = 0; i < PINS_PER_SIDE; i++) {
        const along = -HALF + (CHIP_SIZE / PINS_PER_SIDE) * (i + 0.5)
        const out = HALF + PIN_REACH / 2 - 0.05
        items.push({ p: [zone.x + along, 0.2, zone.z - out] })
        items.push({ p: [zone.x + along, 0.2, zone.z + out] })
        items.push({ p: [zone.x - out, 0.2, zone.z + along], r: [0, Math.PI / 2, 0] })
        items.push({ p: [zone.x + out, 0.2, zone.z + along], r: [0, Math.PI / 2, 0] })
      }
    }
    return items
  }, [])

  return (
    <Instances items={pins} castShadow receiveShadow>
      <boxGeometry args={[0.5, 0.4, PIN_REACH]} />
      <meshStandardMaterial color={colors.metal} roughness={0.35} metalness={0.35} />
    </Instances>
  )
}

/** The five content chips: solid bodies plus the sensor zones that arm the interact prompt. */
export function Chips() {
  const setActiveZone = useGame((s) => s.setActiveZone)
  const clearActiveZone = useGame((s) => s.clearActiveZone)

  return (
    <>
      {ZONES.map((zone, i) => (
        <Chip key={zone.id} zone={zone} index={i} />
      ))}
      <ChipPins />
      <RigidBody type="fixed" colliders={false}>
        {ZONES.map((zone) => (
          <CuboidCollider
            key={zone.id}
            args={[HALF + 0.3, CHIP_HEIGHT / 2, HALF + 0.3]}
            position={[zone.x, CHIP_HEIGHT / 2, zone.z]}
          />
        ))}
        {ZONES.map((zone) => (
          <CuboidCollider
            key={`sensor-${zone.id}`}
            sensor
            args={[ZONE_SENSOR_HALF, 2, ZONE_SENSOR_HALF]}
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
