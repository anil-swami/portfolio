import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Mesh, Object3D } from 'three'
import { useGame } from '../state/store'

/**
 * Model slots (spec section 11). Any .glb dropped into src/assets/models/ with a
 * slot's exact name replaces that slot's code-built fallback. No file, no change.
 */
const files = import.meta.glob('../assets/models/*.glb', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const urls: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.glb$/i, '')
  urls[name] = url
}

export type SlotName =
  | 'car'
  | 'crate'
  | 'decor'
  | 'zone-about'
  | 'zone-skills'
  | 'zone-projects'
  | 'zone-experience'
  | 'zone-contact'

export const hasModel = (name: SlotName): boolean => name in urls

class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[portfolio] A model failed to load, using the built-in fallback.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

interface GltfProps {
  url: string
  onReady?: (root: Object3D | null) => void
}

function Gltf({ url, onReady }: GltfProps) {
  const { scene } = useGLTF(url, false, true) // no Draco, meshopt on
  const root = useMemo(() => {
    const copy = scene.clone(true)
    copy.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return copy
  }, [scene])

  useEffect(() => {
    onReady?.(root)
    return () => onReady?.(null)
  }, [root, onReady])

  return <primitive object={root} />
}

interface ModelSlotProps {
  name: SlotName
  /** Shown when there is no model, while it loads, or if it fails to load. */
  fallback: ReactNode
  /** Receives the loaded model root (or null when it goes away). Keep this callback stable. */
  onReady?: (root: Object3D | null) => void
}

export function ModelSlot({ name, fallback, onReady }: ModelSlotProps) {
  // Models start loading only after the start screen is up, so the first load stays small.
  const allowed = useGame((s) => s.phase !== 'loading')
  const url = urls[name]
  if (!url || !allowed) return <>{fallback}</>
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Gltf url={url} onReady={onReady} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
