import { SPAWN } from '../world/layout'

/** Live car state shared between the car, camera, lights and audio without React. */
export const carState = {
  x: SPAWN.x,
  y: SPAWN.y,
  z: SPAWN.z,
  /** Heading around Y in radians: the car's forward is (sin yaw, 0, cos yaw). */
  yaw: SPAWN.yaw,
  /** Signed forward speed in m/s. */
  speed: 0,
}

/** Camera zoom: multiplies the chase distance. Changed by mouse wheel and pinch. */
export const cameraZoom = { value: 1, min: 0.6, max: 1.6 }
