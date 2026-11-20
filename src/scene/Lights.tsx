import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type DirectionalLight } from 'three'
import { carState } from '../game/carState'
import { useGame } from '../state/store'
import { colors } from '../theme'

const SHADOW_RANGE = 26

/** Hemisphere light plus one sun. The sun and its shadow camera follow the car. */
export function Lights() {
  const shadows = useGame((s) => s.quality === 'high')
  const sun = useRef<DirectionalLight>(null)
  const target = useMemo(() => new Object3D(), [])

  useFrame(() => {
    if (!sun.current) return
    // Assigned here (not as a JSX prop) so the light aims at this exact object, which is in the scene.
    if (sun.current.target !== target) sun.current.target = target
    sun.current.position.set(carState.x - 15, 26, carState.z + 9)
    target.position.set(carState.x, 0, carState.z)
    target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={['#ffffff', colors.solderMask, 1.0]} />
      <directionalLight
        ref={sun}
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
