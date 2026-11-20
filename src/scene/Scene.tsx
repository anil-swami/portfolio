import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { WebGPURenderer } from 'three/webgpu'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { Car } from './Car'
import { Animals } from './Animals'
import { Bridges } from './Bridges'
import { Cabins } from './Cabins'
import { CrateTower } from './CrateTower'
import { Decor } from './Decor'
import { FollowCamera } from './FollowCamera'
import { Ground } from './Ground'
import { Hills } from './Hills'
import { Lights } from './Lights'
import { ProjectBoards } from './ProjectBoards'
import { Secret } from './Secret'
import { Roads } from './Roads'
import { Rocks } from './Rocks'
import { SkillPosts } from './SkillPosts'
import { Trees } from './Trees'
import { Undergrowth } from './Undergrowth'
import { Water } from './Water'

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
      camera={{ fov: 50, near: 0.5, far: 700, position: [0, 5, 10] }}
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
      <color attach="background" args={[colors.sky]} />
      <fog attach="fog" args={[colors.haze, 90, 380]} />

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
          <Ground />
          <Hills />
          <Roads />
          <Water />
          <Bridges />
          <Trees />
          <Undergrowth />
          <Rocks />
          <Animals />
          <Cabins />
          <SkillPosts />
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
