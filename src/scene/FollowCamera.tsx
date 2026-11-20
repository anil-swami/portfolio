import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { cameraZoom, carState } from '../game/carState'
import { prefersReducedMotion } from '../state/store'

const OFFSET = new Vector3(0, 14, 16)
const EASE = 4

const clampZoom = (z: number) => Math.min(cameraZoom.max, Math.max(cameraZoom.min, z))

/** Fixed-angle camera that eases after the car. Mouse wheel and pinch zoom the offset. */
export function FollowCamera() {
  const camera = useThree((s) => s.camera)
  const canvas = useThree((s) => s.gl.domElement)
  const focus = useRef(new Vector3(carState.x, 0, carState.z))
  const zoom = useRef(cameraZoom.value)

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cameraZoom.value = clampZoom(cameraZoom.value * Math.exp(e.deltaY * 0.001))
    }

    let pinchStart = 0
    let zoomStart = 1
    const spread = (e: TouchEvent) =>
      Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStart = spread(e)
        zoomStart = cameraZoom.value
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStart > 0) {
        e.preventDefault()
        cameraZoom.value = clampZoom(zoomStart * (pinchStart / spread(e)))
      }
    }
    const onTouchEnd = () => {
      pinchStart = 0
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [canvas])

  useFrame(({ size }, delta) => {
    // Frame-rate-independent easing; reduced motion snaps instead of easing.
    const k = prefersReducedMotion() ? 1 : 1 - Math.exp(-EASE * delta)
    focus.current.x += (carState.x - focus.current.x) * k
    focus.current.z += (carState.z - focus.current.z) * k
    zoom.current += (cameraZoom.value - zoom.current) * (prefersReducedMotion() ? 1 : 1 - Math.exp(-8 * delta))
    // Pull back on tall (portrait) screens so phones still see the road ahead and to the sides
    const portrait = Math.min(1.5, Math.max(1, 1 + (size.height / size.width - 1) * 0.45))
    const distance = zoom.current * portrait
    camera.position.set(focus.current.x + OFFSET.x * distance, OFFSET.y * distance, focus.current.z + OFFSET.z * distance)
    camera.lookAt(focus.current)
  })

  return null
}
