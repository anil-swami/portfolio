import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, type InstancedMesh, Object3D } from 'three'
import { carState } from '../game/carState'
import { makeAnimals, stepAnimal, type Animal, type Species } from '../world/animals'
import { makeModels, type AnimalModel } from './animalModels'

const dummy = new Object3D()
dummy.rotation.order = 'YXZ'
const SPECIES: Species[] = ['deer', 'rabbit', 'fox', 'duck', 'bird']
/** Ducks sit on the water surface. */
const BASE_Y: Partial<Record<Species, number>> = { duck: 0.06 }

/** Sets one body matrix: position, heading, and a small lean for hopping rabbits. */
function placeBody(a: Animal, species: Species) {
  dummy.position.set(a.x, a.y + (BASE_Y[species] ?? 0), a.z)
  const lean = species === 'rabbit' && a.y > 0.02 ? -0.25 : 0
  dummy.rotation.set(lean, a.yaw, 0)
  dummy.scale.setScalar(a.scale)
  dummy.updateMatrix()
}

/** Sets one limb matrix: attached to the body, swinging around X (legs) or Z (wings). */
function placeLimb(a: Animal, species: Species, at: [number, number, number], index: number) {
  const s = a.scale
  const cos = Math.cos(a.yaw)
  const sin = Math.sin(a.yaw)
  const [lx, ly, lz] = at
  dummy.position.set(a.x + (lx * cos + lz * sin) * s, a.y + ly * s, a.z + (-lx * sin + lz * cos) * s)
  if (species === 'bird') {
    // Wings flap up and down; the left wing is the right one mirrored.
    const flap = Math.sin(a.phase * 18) * 0.7
    const left = lx < 0
    dummy.rotation.set(0, a.yaw, left ? -flap : flap)
    dummy.scale.set(left ? -s : s, s, s)
  } else {
    // Diagonal pairs swing together, like a trot.
    const pair = index === 0 || index === 3 ? 1 : -1
    const swing = a.speed > 0.15 ? Math.sin(a.phase) * 0.6 * pair : 0
    dummy.rotation.set(swing, a.yaw, 0)
    dummy.scale.setScalar(s)
  }
  dummy.updateMatrix()
}

function Herd({ species, animals, model }: { species: Species; animals: Animal[]; model: AnimalModel }) {
  const body = useRef<InstancedMesh>(null)
  const limbs = useRef<InstancedMesh>(null)
  const limbCount = model.limbs?.length ?? 0

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20)
    const time = state.clock.elapsedTime
    animals.forEach((a, i) => {
      stepAnimal(species, a, dt, carState.x, carState.z, time)
      if (body.current) {
        placeBody(a, species)
        body.current.setMatrixAt(i, dummy.matrix)
      }
      if (limbs.current && model.limbs) {
        model.limbs.forEach((at, j) => {
          placeLimb(a, species, at, j)
          limbs.current!.setMatrixAt(i * limbCount + j, dummy.matrix)
        })
      }
    })
    if (body.current) body.current.instanceMatrix.needsUpdate = true
    if (limbs.current) limbs.current.instanceMatrix.needsUpdate = true
  })

  if (animals.length === 0) return null
  return (
    <>
      <instancedMesh ref={body} args={[model.body, undefined, animals.length]} castShadow frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.9} flatShading />
      </instancedMesh>
      {model.limb && (
        <instancedMesh ref={limbs} args={[model.limb, undefined, animals.length * limbCount]} castShadow frustumCulled={false}>
          <meshStandardMaterial color={model.limbColor} roughness={0.9} side={species === 'bird' ? DoubleSide : undefined} />
        </instancedMesh>
      )}
    </>
  )
}

/** Deer, rabbits and foxes wandering the meadows and woods, ducks on the ponds, birds overhead. */
export function Animals() {
  const herds = useMemo(() => makeAnimals(), [])
  const models = useMemo(() => makeModels(), [])

  useEffect(
    () => () => {
      for (const m of Object.values(models)) {
        m.body.dispose()
        m.limb?.dispose()
      }
    },
    [models],
  )

  return (
    <>
      {SPECIES.map((s) => (
        <Herd key={s} species={s} animals={herds[s]} model={models[s]} />
      ))}
    </>
  )
}
