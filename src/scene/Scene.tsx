import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { WebGPURenderer } from 'three/webgpu'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { Board } from './Board'
import { Car } from './Car'
import { Chips } from './Chips'
import { CrateTower } from './CrateTower'
import { Decor } from './Decor'
import { FollowCamera } from './FollowCamera'
import { Lights } from './Lights'
import { ProjectBoards } from './ProjectBoards'
import { Secret } from './Secret'
import { SkillCapacitors } from './SkillCapacitors'
import { Traces } from './Traces'

type RendererOptions = ConstructorParameters<typeof WebGPURenderer>[0]

/** Tells the UI the world is on screen, once physics is up and a few frames have rendered. */
function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    if (frames.current < 0) return
    if (++frames.current >= 3) {
      frames.current = -1
      useGame.getState().sceneReady()
    }
  })
  return null
}

/** Feeds asset loading progress (drei useProgress) into the loading screen. */
function ProgressBridge() {
  const { active, progress } = useProgress()
  useEffect(() => {
    if (active) useGame.getState().setLoadProgress(0.7 + (progress / 100) * 0.25)
  }, [active, progress])
  return null
}

export default function Scene() {
  const compat = useGame((s) => s.compat)
  const quality = useGame((s) => s.quality)
  const maxDpr = quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1
  const [dpr, setDpr] = useState(maxDpr)

  useEffect(() => setDpr(maxDpr), [maxDpr])
  useEffect(() => useGame.getState().setLoadProgress(0.4), [])

  return (
    <Canvas
      // Remount with the other renderer when compatibility mode changes
      key={compat ? 'webgl' : 'webgpu'}
      shadows="percentage"
      flat
      onCreated={(state) => {
        if (import.meta.env.DEV) (window as unknown as { __r3f?: unknown }).__r3f = state
      }}
      dpr={dpr}
      camera={{ fov: 45, near: 0.5, far: 500, position: [0, 14, 16] }}
      gl={async (props) => {
        const renderer = new WebGPURenderer({
          ...(props as unknown as RendererOptions),
          antialias: true,
          forceWebGL: compat,
        })
        await renderer.init()
        const isWebGPU = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true
        const backend = isWebGPU ? 'WebGPU' : 'WebGL 2'
        console.info(`[portfolio] Renderer in use: ${backend}${compat ? ' (compatibility mode)' : ''}`)
        useGame.getState().setBackend(backend)
        useGame.getState().setLoadProgress(0.7)
        return renderer
      }}
    >
      <color attach="background" args={[colors.workbench]} />
      <fog attach="fog" args={[colors.workbench, 75, 210]} />

      {/* Lower the resolution when the frame rate drops, raise it again when there is headroom */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />

      <Lights />
      <FollowCamera />
      <ProgressBridge />

      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]}>
          <Board />
          <Traces />
          <Chips />
          <SkillCapacitors />
          <ProjectBoards />
          <Decor />
          <CrateTower />
          <Secret />
          <Car />
          <ReadySignal />
        </Physics>
      </Suspense>
    </Canvas>
  )
}
