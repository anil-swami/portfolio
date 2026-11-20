import { useEffect, useMemo } from 'react'
import { content } from '../content'
import { colors } from '../theme'
import { ROAD_WIDTH, ROADS, SPAWN_CLEARING_RADIUS } from '../world/layout'
import { ribbonGeometry } from './ribbon'
import { WoodSign } from './WoodSign'

const VERGE = 1.4 // extra width of the softer worn edge on each side
const CORE_Y = 0.045
const VERGE_Y = 0.03
const WELCOME = { x: 7, z: -12 }

/** The dirt roads, the clearing at the spawn point where they meet, and a welcome sign with the name. */
export function Roads() {
  const core = useMemo(
    () => ribbonGeometry(ROADS, { width: ROAD_WIDTH, y: CORE_Y, colorA: colors.dirt, colorB: colors.dirtDark, seed: 3 }),
    [],
  )
  const verge = useMemo(
    () =>
      ribbonGeometry(ROADS, { width: ROAD_WIDTH + VERGE * 2, y: VERGE_Y, colorA: colors.dirtEdge, colorB: colors.dirtDark, seed: 5 }),
    [],
  )

  useEffect(
    () => () => {
      core.dispose()
      verge.dispose()
    },
    [core, verge],
  )

  return (
    <>
      <mesh geometry={verge} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <mesh geometry={core} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>

      {/* Clearing where all roads meet */}
      <mesh position={[0, VERGE_Y - 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[SPAWN_CLEARING_RADIUS + VERGE, 48]} />
        <meshStandardMaterial color={colors.dirtEdge} roughness={1} />
      </mesh>
      <mesh position={[0, CORE_Y + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[SPAWN_CLEARING_RADIUS, 48]} />
        <meshStandardMaterial color={colors.dirt} roughness={1} />
      </mesh>
      {/* Welcome sign at the edge of the clearing, turned towards the start position */}
      <group position={[WELCOME.x, 0, WELCOME.z]} rotation={[0, Math.atan2(-WELCOME.x, -WELCOME.z), 0]}>
        <WoodSign text={content.start.name} width={4.6} height={1.5} boardY={1.6} textSize={0.8} twoSided />
      </group>
    </>
  )
}
