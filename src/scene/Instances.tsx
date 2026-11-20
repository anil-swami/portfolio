import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Color, Object3D, type InstancedMesh } from 'three'

export interface Instance {
  p: [number, number, number]
  r?: [number, number, number]
  s?: [number, number, number]
  /** Optional per-instance colour, multiplied with the material colour (use a white material). */
  c?: string
}

interface InstancesProps {
  items: Instance[]
  /** Geometry and material elements, shared by every instance. */
  children: ReactNode
  castShadow?: boolean
  receiveShadow?: boolean
}

const dummy = new Object3D()
const tint = new Color()

/** One draw call for many copies of the same static prop (pins, trees, rocks). */
export function Instances({ items, children, castShadow, receiveShadow }: InstancesProps) {
  const ref = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((item, i) => {
      dummy.position.set(...item.p)
      dummy.rotation.set(...(item.r ?? [0, 0, 0]))
      dummy.scale.set(...(item.s ?? [1, 1, 1]))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (item.c) mesh.setColorAt(i, tint.set(item.c))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items])

  if (items.length === 0) return null
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    >
      {children}
    </instancedMesh>
  )
}
