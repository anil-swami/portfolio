import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type DirectionalLight } from 'three'
import { carState } from '../game/carState'
import { useGame } from '../state/store'
import { colors } from '../theme'

const SHADOW_RANGE = 26
const SHADOW_AHEAD = 12 // centre the shadow area ahead of the car, where the chase camera looks

/** Hemisphere light plus one sun. The sun and its shadow camera follow the car. */
export function Lights() {
  const shadows = useGame((s) => s.quality === 'high')
  const sun = useRef<DirectionalLight>(null)
  const target = useMemo(() => new Object3D(), [])

  useFrame(() => {
    if (!sun.current) return
    // Assigned here (not as a JSX prop) so the light aims at this exact object, which is in the scene.
    if (sun.current.target !== target) sun.current.target = target
    const cx = carState.x + Math.sin(carState.yaw) * SHADOW_AHEAD
    const cz = carState.z + Math.cos(carState.yaw) * SHADOW_AHEAD
    sun.current.position.set(cx - 15, 26, cz + 9)
    target.position.set(cx, 0, cz)
    target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={[colors.sky, colors.grassDark, 1.1]} />
      <directionalLight
        ref={sun}
        color={colors.sun}
        intensity={3.1}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-SHADOW_RANGE}
        shadow-camera-right={SHADOW_RANGE}
        shadow-camera-top={SHADOW_RANGE}
        shadow-camera-bottom={-SHADOW_RANGE}
      />
      <primitive object={target} />
    </>
  )
}
