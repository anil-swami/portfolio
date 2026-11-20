import { ModelSlot } from './models'

/** Optional extra decoration from Blender (decor.glb), placed at the world origin. Visual only. */
export function Decor() {
  return <ModelSlot name="decor" fallback={null} />
}
