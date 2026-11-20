import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Quaternion, Vector3, type Group } from 'three'
import { updateEngine } from '../game/audio'
import { carState } from '../game/carState'
import { input } from '../game/input'
import { useGame } from '../state/store'
import { SPAWN } from '../world/layout'
import { CarVisual, type WheelState } from './CarVisual'

// Tuning (spec section 8)
const MAX_SPEED = 16
const BOOST_SPEED = 24
const REVERSE_SPEED = 8
const ACCEL = 22 // m/s^2
const GRIP = 7 // how fast sideways speed is removed (per second); lower = more drift
const BRAKE = 5 // braking strength (per second)
const TURN_RATE = 2.3 // rad/s at full grip
const HINT_AFTER_SECONDS = 5

const quat = new Quaternion()
const forward = new Vector3()
const worldPos = new Vector3()
const spawnRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), SPAWN.yaw)

/** Arcade car: one dynamic box that never flips. Forward is local +Z. */
export function Car() {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const wheels = useRef<WheelState>({ spin: 0, steer: 0 })
  const movedFor = useRef(0)

  useFrame((_, rawDelta) => {
    const rb = body.current
    if (!rb) return
    if (import.meta.env.DEV) {
      // Dev aid: __teleport(x, z) in the browser console moves the car.
      ;(window as unknown as { __teleport?: (x: number, z: number) => void }).__teleport = (x, z) =>
        rb.setTranslation({ x, y: SPAWN.y, z }, true)
    }
    const dt = Math.min(rawDelta, 1 / 30)
    const game = useGame.getState()
    const driving = game.phase === 'playing' && game.panel === null

    // Respawn on R, or if the car ever falls off the world
    if (input.reset || rb.translation().y < -5) {
      input.reset = false
      rb.setTranslation({ x: SPAWN.x, y: SPAWN.y, z: SPAWN.z }, true)
      rb.setRotation(spawnRotation, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }

    const r = rb.rotation()
    quat.set(r.x, r.y, r.z, r.w)
    forward.set(0, 0, 1).applyQuaternion(quat)
    forward.y = 0
    forward.normalize()
    // Local +X, which is the car's left when it looks along +Z
    const leftX = forward.z
    const leftZ = -forward.x

    const v = rb.linvel()
    let speed = v.x * forward.x + v.z * forward.z
    let slide = v.x * leftX + v.z * leftZ

    let throttle = driving ? Number(input.forward) - Number(input.back) : 0
    let braking = !driving || input.brake
    if (driving && input.brakeReverse) {
      if (speed > 1.5) braking = true
      else throttle = -1
    }

    // Grip: remove most of the sideways velocity so the car drifts only slightly
    slide *= Math.exp(-GRIP * dt)
    if (braking) speed *= Math.exp(-BRAKE * dt)
    rb.setLinvel({ x: forward.x * speed + leftX * slide, y: v.y, z: forward.z * speed + leftZ * slide }, true)

    // Throttle: an impulse along the forward vector, up to the top speed
    if (throttle !== 0) {
      const boosting = input.boost && throttle > 0
      const top = throttle > 0 ? (boosting ? BOOST_SPEED : MAX_SPEED) : REVERSE_SPEED
      const room = top - speed * throttle
      if (room > 0) {
        const dv = Math.min(ACCEL * (boosting ? 1.5 : 1) * dt, room) * throttle
        const impulse = dv * rb.mass()
        rb.applyImpulse({ x: forward.x * impulse, y: 0, z: forward.z * impulse }, true)
        speed += dv
      }
    }

    // Steering: angular velocity around Y, scaled by speed, reversed when driving backwards
    const steer = driving ? Number(input.left) - Number(input.right) : 0
    if (steer !== 0) {
      const grip = Math.min(Math.abs(speed) / 5, 1)
      const target = steer * TURN_RATE * grip * Math.sign(speed)
      const current = rb.angvel().y
      rb.setAngvel({ x: 0, y: current + (target - current) * (1 - Math.exp(-12 * dt)), z: 0 }, true)
    }

    // Share state with the wheels, camera, lights and audio
    wheels.current.spin += (speed / 0.34) * dt
    wheels.current.steer += (steer * 0.45 - wheels.current.steer) * (1 - Math.exp(-10 * dt))
    if (visual.current) {
      visual.current.getWorldPosition(worldPos)
      carState.x = worldPos.x
      carState.y = worldPos.y
      carState.z = worldPos.z
    }
    carState.yaw = Math.atan2(forward.x, forward.z)
    carState.speed = speed
    updateEngine(speed, driving)

    if (!game.hintDone && Math.abs(speed) > 1) {
      movedFor.current += dt
      if (movedFor.current > HINT_AFTER_SECONDS) game.finishHint()
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[SPAWN.x, SPAWN.y, SPAWN.z]}
      rotation={[0, SPAWN.yaw, 0]}
      enabledRotations={[false, true, false]}
      linearDamping={0.6}
      angularDamping={4}
      canSleep={false}
      ccd
      userData={{ car: true }}
    >
      <CuboidCollider args={[0.9, 0.5, 1.4]} friction={0} restitution={0.15} />
      <group ref={visual}>
        <CarVisual wheels={wheels} />
      </group>
    </RigidBody>
  )
}
