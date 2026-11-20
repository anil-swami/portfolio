import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Object3D, type InstancedMesh } from 'three'

export interface Instance {
  p: [number, number, number]
  r?: [number, number, number]
  s?: [number, number, number]
}

interface InstancesProps {
  items: Instance[]
  /** Geometry and material elements, shared by every instance. */
  children: ReactNode
  castShadow?: boolean
  receiveShadow?: boolean
}

const dummy = new Object3D()

/** One draw call for many copies of the same static prop (pins, vias, resistors). */
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
    })
    mesh.instanceMatrix.needsUpdate = true
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
