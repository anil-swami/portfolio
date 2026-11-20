import { useEffect, useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BufferAttribute, Color, PlaneGeometry } from 'three'
import { colors } from '../theme'
import { PLAY_HALF, WORLD_HALF } from '../world/layout'
import { noise2 } from '../world/random'

const SEGMENTS = 200
// The visible grass reaches past the world edge so the distant hills stand on it.
const GROUND_SIZE = 900
const WALL_HEIGHT = 4

/** Grass colour at a point: broad light and dark patches with finer variation on top. */
function grassColor(x: number, z: number, out: Color, dark: Color, mid: Color, light: Color): Color {
  const broad = noise2(x, z, 38, 11)
  const fine = noise2(x, z, 7, 23)
  const t = broad * 0.75 + fine * 0.25
  if (t < 0.5) return out.copy(dark).lerp(mid, t / 0.5)
  return out.copy(mid).lerp(light, (t - 0.5) / 0.5)
}

/** The grass ground, its flat collider and the invisible walls at the edge of the drivable area. */
export function Ground() {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(GROUND_SIZE, GROUND_SIZE, SEGMENTS, SEGMENTS)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const rgb = new Float32Array(pos.count * 3)
    const dark = new Color(colors.grassDark)
    const mid = new Color(colors.grass)
    const light = new Color(colors.grassLight)
    const c = new Color()
    for (let i = 0; i < pos.count; i++) {
      grassColor(pos.getX(i), pos.getZ(i), c, dark, mid, light)
      rgb.set([c.r, c.g, c.b], i * 3)
    }
    geo.setAttribute('color', new BufferAttribute(rgb, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        {/* Flat ground. Friction 0: the car controller handles grip itself. */}
        <CuboidCollider args={[WORLD_HALF, 0.5, WORLD_HALF]} position={[0, -0.5, 0]} friction={0} />
        {/* Invisible walls at the edge of the drivable area; the hills beyond are scenery */}
        <CuboidCollider args={[PLAY_HALF + 2, WALL_HEIGHT, 1]} position={[0, WALL_HEIGHT, -PLAY_HALF - 1]} />
        <CuboidCollider args={[PLAY_HALF + 2, WALL_HEIGHT, 1]} position={[0, WALL_HEIGHT, PLAY_HALF + 1]} />
        <CuboidCollider args={[1, WALL_HEIGHT, PLAY_HALF + 2]} position={[-PLAY_HALF - 1, WALL_HEIGHT, 0]} />
        <CuboidCollider args={[1, WALL_HEIGHT, PLAY_HALF + 2]} position={[PLAY_HALF + 1, WALL_HEIGHT, 0]} />
      </RigidBody>
    </>
  )
}
