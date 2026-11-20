import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { cameraZoom, carState } from '../game/carState'
import { prefersReducedMotion } from '../state/store'

// Chase camera tuning (racing-game style: behind the car, looking down the road)
const BEHIND = 10 // metres behind the car at zoom 1
const HEIGHT = 4.5 // metres above the car at zoom 1
const LOOK_AHEAD = 6 // the camera aims at a point this far in front of the car
const LOOK_HEIGHT = 1.2
const SPEED_PULLBACK = 0.12 // extra metres behind per m/s, so speed feels faster
const FOLLOW_EASE = 6 // position easing (per second)
const TURN_EASE = 3.5 // how fast the camera swings round behind the car (per second)

const clampZoom = (z: number) => Math.min(cameraZoom.max, Math.max(cameraZoom.min, z))

/** Shortest signed difference between two angles, in -PI..PI. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/** Chase camera: sits behind the car, turns with it and looks ahead. Mouse wheel and pinch zoom the distance. */
export function FollowCamera() {
  const camera = useThree((s) => s.camera)
  const canvas = useThree((s) => s.gl.domElement)
  const focus = useRef(new Vector3(carState.x, carState.y, carState.z))
  const yaw = useRef(carState.yaw)
  const pullback = useRef(0)
  const zoom = useRef(cameraZoom.value)
  const lookAt = useRef(new Vector3())

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
    const reduced = prefersReducedMotion()
    const ease = (rate: number) => (reduced ? 1 : 1 - Math.exp(-rate * delta))

    // The camera position follows the car closely; the heading swings round more slowly,
    // so turns read clearly without the view snapping.
    const kFollow = ease(FOLLOW_EASE)
    focus.current.x += (carState.x - focus.current.x) * kFollow
    focus.current.y += (carState.y - focus.current.y) * kFollow
    focus.current.z += (carState.z - focus.current.z) * kFollow
    yaw.current += angleDelta(yaw.current, carState.yaw) * ease(TURN_EASE)
    pullback.current += (Math.max(0, carState.speed) * SPEED_PULLBACK - pullback.current) * ease(2)
    zoom.current += (cameraZoom.value - zoom.current) * ease(8)

    // Pull back a little on tall (portrait) screens so phones still see the sides of the road
    const portrait = Math.min(1.3, Math.max(1, 1 + (size.height / size.width - 1) * 0.25))
    const distance = zoom.current * portrait
    const fx = Math.sin(yaw.current)
    const fz = Math.cos(yaw.current)
    const back = BEHIND * distance + pullback.current

    camera.position.set(focus.current.x - fx * back, focus.current.y + HEIGHT * distance, focus.current.z - fz * back)
    lookAt.current.set(focus.current.x + fx * LOOK_AHEAD, focus.current.y + LOOK_HEIGHT, focus.current.z + fz * LOOK_AHEAD)
    camera.lookAt(lookAt.current)
  })

  return null
}
