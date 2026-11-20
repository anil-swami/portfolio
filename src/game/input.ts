/**
 * Driving input. A plain module-level object (not React state), so key presses
 * never cause re-renders. Keyboard and touch controls both write here.
 */
export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  boost: false,
  brake: false,
  /** Touch brake button: brakes while rolling forward, reverses once stopped. */
  brakeReverse: false,
  /** Set to true to request a respawn; the car clears it. */
  reset: false,
}

export type HeldKey = Exclude<keyof typeof input, 'reset'>

export function clearInput(): void {
  input.forward = false
  input.back = false
  input.left = false
  input.right = false
  input.boost = false
  input.brake = false
  input.brakeReverse = false
}
