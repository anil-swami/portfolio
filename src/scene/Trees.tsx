import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { PLAY_HALF } from '../world/layout'
import { makeTrees, type Tree } from '../world/vegetation'
import { Instances, type Instance } from './Instances'

type V3 = [number, number, number]

/** Unit parts of each tree kind, in metres at size 1: [offset x, y, z], [scale x, y, z]. */
const PINE_CONES: [V3, V3][] = [
  [[0, 2.2, 0], [2.5, 3.4, 2.5]],
  [[0, 4.1, 0], [2.0, 3.0, 2.0]],
  [[0, 5.8, 0], [1.4, 2.6, 1.4]],
]
const OAK_BLOBS: [V3, V3][] = [
  [[0, 4.2, 0], [2.6, 2.2, 2.6]],
  [[1.5, 3.6, 0.6], [1.8, 1.6, 1.8]],
  [[-1.2, 3.8, -0.9], [1.9, 1.7, 1.9]],
]
const BIRCH_BLOBS: [V3, V3][] = [
  [[0, 5.0, 0], [1.4, 2.2, 1.4]],
  [[0.4, 3.9, 0.3], [1.2, 1.5, 1.2]],
]
const TRUNK = {
  pine: { radius: 0.3, height: 2.6 },
  oak: { radius: 0.42, height: 3.4 },
  birch: { radius: 0.2, height: 5.2 },
}

/** Places a tree part: offsets turn with the tree, everything scales with it. */
function part(t: Tree, [ox, oy, oz]: V3, [sx, sy, sz]: V3, c?: string): Instance {
  const cos = Math.cos(t.r)
  const sin = Math.sin(t.r)
  return {
    p: [t.x + (ox * cos + oz * sin) * t.s, oy * t.s, t.z + (-ox * sin + oz * cos) * t.s],
    r: [0, t.r, 0],
    s: [sx * t.s, sy * t.s, sz * t.s],
    c,
  }
}

function trunks(list: Tree[], kind: keyof typeof TRUNK): Instance[] {
  const { radius, height } = TRUNK[kind]
  return list.map((t) => part(t, [0, height / 2, 0], [radius, height, radius]))
}

/** The forest: pines, oaks and birches as a few instanced meshes, with solid trunks. */
export function Trees() {
  const all = useMemo(() => makeTrees(), [])
  const groups = useMemo(() => {
    const pine = all.filter((t) => t.kind === 'pine')
    const oak = all.filter((t) => t.kind === 'oak')
    const birch = all.filter((t) => t.kind === 'birch')
    return {
      darkTrunks: [...trunks(pine, 'pine'), ...trunks(oak, 'oak')],
      birchTrunks: trunks(birch, 'birch'),
      cones: pine.flatMap((t) => PINE_CONES.map(([o, s]) => part(t, o, s, t.c))),
      blobs: [
        ...oak.flatMap((t) => OAK_BLOBS.map(([o, s]) => part(t, o, s, t.c))),
        ...birch.flatMap((t) => BIRCH_BLOBS.map(([o, s]) => part(t, o, s, t.c))),
      ],
    }
  }, [all])

  // Only trees the car can reach need colliders.
  const solid = useMemo(() => all.filter((t) => Math.abs(t.x) < PLAY_HALF + 2 && Math.abs(t.z) < PLAY_HALF + 2), [all])

  return (
    <>
      <Instances items={groups.darkTrunks} castShadow>
        <cylinderGeometry args={[0.8, 1, 1, 7]} />
        <meshStandardMaterial color={colors.log} roughness={0.95} />
      </Instances>
      <Instances items={groups.birchTrunks} castShadow>
        <cylinderGeometry args={[0.8, 1, 1, 7]} />
        <meshStandardMaterial color={colors.cream} roughness={0.9} />
      </Instances>
      <Instances items={groups.cones} castShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </Instances>
      <Instances items={groups.blobs} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </Instances>

      <RigidBody type="fixed" colliders={false}>
        {solid.map((t, i) => (
          <CylinderCollider
            key={i}
            args={[2, TRUNK[t.kind].radius * t.s + 0.1]}
            position={[t.x, 2, t.z]}
          />
        ))}
      </RigidBody>
    </>
  )
}
