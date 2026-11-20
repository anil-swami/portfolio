import { RIVER, RIVER_WIDTH, ROADS } from './layout'

export interface Bridge {
  x: number
  z: number
  /** Turn around Y so the bridge runs along the road (local +Z along the road). */
  yaw: number
  /** Length along the road: long enough to span the river at the crossing angle, plus the banks. */
  length: number
}

/** A bridge wherever a road crosses the river, lined up with the road. */
export const BRIDGES: Bridge[] = (() => {
  const out: Bridge[] = []
  for (const road of ROADS) {
    for (let i = 0; i < road.length - 1; i++) {
      const [ax, az] = road[i]
      const [bx, bz] = road[i + 1]
      for (let j = 0; j < RIVER.length - 1; j++) {
        const [cx, cz] = RIVER[j]
        const [dx, dz] = RIVER[j + 1]
        const den = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx)
        if (den === 0) continue
        const t = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / den
        const u = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / den
        if (t < 0 || t > 1 || u < 0 || u > 1) continue
        const roadLen = Math.hypot(bx - ax, bz - az)
        const riverLen = Math.hypot(dx - cx, dz - cz)
        const sin = Math.abs(((bx - ax) * (dz - cz) - (bz - az) * (dx - cx)) / (roadLen * riverLen))
        out.push({
          x: ax + t * (bx - ax),
          z: az + t * (bz - az),
          yaw: Math.atan2(bx - ax, bz - az),
          length: RIVER_WIDTH / Math.max(0.35, sin) + 8,
        })
      }
    }
  }
  return out
})()
