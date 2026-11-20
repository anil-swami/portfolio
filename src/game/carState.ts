import { SPAWN } from '../world/layout'

/** Live car state shared between the car, camera, lights and audio without React. */
export const carState = {
  x: SPAWN.x,
  y: SPAWN.y,
  z: SPAWN.z,
  /** Signed forward speed in m/s. */
  speed: 0,
}

/** Camera zoom: multiplies the follow offset. Changed by mouse wheel and pinch. */
export const cameraZoom = { value: 1, min: 0.6, max: 1.6 }
