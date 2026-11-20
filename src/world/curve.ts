/**
 * Smooth curves through control points, without three.js, so the world layout can be imported
 * by the UI (minimap, store) without pulling the 3D library into the first-paint bundle.
 */

export type Point = [number, number]

const SAMPLES_PER_SEGMENT = 24
const EPS = 1e-4

const lerp = (a: Point, b: Point, wa: number, wb: number): Point => [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb]

/** One point on a centripetal Catmull-Rom segment between p1 and p2 (Barry-Goldman form). */
function centripetal(p0: Point, p1: Point, p2: Point, p3: Point, u: number): Point {
  const knot = (a: Point, b: Point) => Math.max(EPS, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])))
  const t0 = 0
  const t1 = t0 + knot(p0, p1)
  const t2 = t1 + knot(p1, p2)
  const t3 = t2 + knot(p2, p3)
  const t = t1 + (t2 - t1) * u
  const a1 = lerp(p0, p1, (t1 - t) / (t1 - t0), (t - t0) / (t1 - t0))
  const a2 = lerp(p1, p2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1))
  const a3 = lerp(p2, p3, (t3 - t) / (t3 - t2), (t - t2) / (t3 - t2))
  const b1 = lerp(a1, a2, (t2 - t) / (t2 - t0), (t - t0) / (t2 - t0))
  const b2 = lerp(a2, a3, (t3 - t) / (t3 - t1), (t - t1) / (t3 - t1))
  return lerp(b1, b2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1))
}

/**
 * A smooth polyline through `controls`, resampled to evenly spaced points about `spacing`
 * metres apart. A closed curve ends where it starts.
 */
export function smoothLine(controls: Point[], closed = false, spacing = 2): Point[] {
  const n = controls.length
  const at = (i: number): Point => {
    if (closed) return controls[((i % n) + n) % n]
    if (i < 0) return lerp(controls[0], controls[1], 2, -1) // extend the first segment backwards
    if (i >= n) return lerp(controls[n - 1], controls[n - 2], 2, -1)
    return controls[i]
  }

  // Dense samples along the curve
  const dense: Point[] = []
  const segments = closed ? n : n - 1
  for (let s = 0; s < segments; s++) {
    for (let k = 0; k < SAMPLES_PER_SEGMENT; k++) {
      dense.push(centripetal(at(s - 1), at(s), at(s + 1), at(s + 2), k / SAMPLES_PER_SEGMENT))
    }
  }
  dense.push(closed ? controls[0] : controls[n - 1])

  // Cumulative length, then evenly spaced points by arc length
  const lengths = [0]
  for (let i = 1; i < dense.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]))
  }
  const total = lengths[lengths.length - 1]
  const count = Math.max(8, Math.round(total / spacing))
  const out: Point[] = []
  let j = 1
  for (let i = 0; i <= count; i++) {
    const target = (i / count) * total
    while (j < lengths.length - 1 && lengths[j] < target) j++
    const span = lengths[j] - lengths[j - 1] || 1
    const f = (target - lengths[j - 1]) / span
    out.push(lerp(dense[j - 1], dense[j], 1 - f, f))
  }
  return out
}
