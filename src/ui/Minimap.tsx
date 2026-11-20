import { useEffect, useRef } from 'react'
import { content } from '../content'
import { carState } from '../game/carState'
import { colors } from '../theme'
import { forestDensity } from '../world/forest'
import { PLAY_HALF, PONDS, RIVER, RIVER_WIDTH, ROAD_WIDTH, ROADS, ZONES } from '../world/layout'
import { strings } from './strings'

const RANGE = PLAY_HALF + 8 // metres from the centre to the map edge
const FOREST_STEP = 5 // metres per forest sample

/** World (x, z) to map pixels: north (−Z) is up. */
const toMap = (v: number, size: number) => ((v + RANGE) / (RANGE * 2)) * size

/** Draws everything that never moves: meadows, forests, water, roads and the cabins. */
function drawStatic(ctx: CanvasRenderingContext2D, size: number) {
  const m = size / (RANGE * 2) // pixels per metre
  ctx.fillStyle = colors.grassLight
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = colors.grassDark
  const cell = Math.max(1, FOREST_STEP * m)
  for (let z = -RANGE; z < RANGE; z += FOREST_STEP) {
    for (let x = -RANGE; x < RANGE; x += FOREST_STEP) {
      const d = forestDensity(x + FOREST_STEP / 2, z + FOREST_STEP / 2)
      if (d < 0.35) continue
      ctx.globalAlpha = Math.min(1, (d - 0.2) * 1.4)
      ctx.fillRect(toMap(x, size), toMap(z, size), cell + 0.5, cell + 0.5)
    }
  }
  ctx.globalAlpha = 1

  const line = (points: [number, number][], width: number, colour: string, closed = false) => {
    ctx.beginPath()
    points.forEach(([x, z], i) => (i === 0 ? ctx.moveTo(toMap(x, size), toMap(z, size)) : ctx.lineTo(toMap(x, size), toMap(z, size))))
    if (closed) ctx.closePath()
    ctx.lineWidth = width
    ctx.strokeStyle = colour
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  line(RIVER, Math.max(2, RIVER_WIDTH * m), colors.water)
  ctx.fillStyle = colors.water
  for (const p of PONDS) {
    ctx.beginPath()
    ctx.arc(toMap(p.x, size), toMap(p.z, size), Math.max(2, p.r * m), 0, Math.PI * 2)
    ctx.fill()
  }
  for (const road of ROADS) line(road, Math.max(1.6, ROAD_WIDTH * m), colors.dirt)

  // Cabins: amber discs with the first letter of each zone's title
  const r = Math.max(6, size * 0.045)
  ctx.font = `700 ${Math.round(r * 1.25)}px "Saira Semi Condensed", "Arial Narrow", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const zone of ZONES) {
    const x = toMap(zone.x, size)
    const y = toMap(zone.z, size)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors.ledAmber
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = colors.ink
    ctx.stroke()
    ctx.fillStyle = colors.ink
    ctx.fillText(content[zone.id].title.charAt(0), x, y + r * 0.08)
  }
}

/** The car: a white arrow pointing the way it faces. */
function drawCar(ctx: CanvasRenderingContext2D, size: number) {
  const x = toMap(carState.x, size)
  const y = toMap(carState.z, size)
  const a = size * 0.035
  ctx.save()
  ctx.translate(x, y)
  // The car's forward is (sin yaw, cos yaw) in (x, z), which is the same direction in map pixels.
  ctx.rotate(Math.atan2(Math.cos(carState.yaw), Math.sin(carState.yaw)))
  ctx.beginPath()
  ctx.moveTo(a * 1.5, 0)
  ctx.lineTo(-a, a)
  ctx.lineTo(-a * 0.4, 0)
  ctx.lineTo(-a, -a)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = colors.ink
  ctx.stroke()
  ctx.restore()
}

/** A north-up map of the whole world in the corner of the screen, with the car's position and heading. */
export function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let frame = 0
    let size = 0
    const base = document.createElement('canvas')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = Math.round(canvas.clientWidth * dpr)
      if (size === 0 || (canvas.width === size && base.width === size)) return
      canvas.width = canvas.height = size
      base.width = base.height = size
      const b = base.getContext('2d')
      if (b) drawStatic(b, size)
    }

    const tick = () => {
      resize()
      if (size > 0) {
        ctx.drawImage(base, 0, 0)
        drawCar(ctx, size)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    // Redraw the letters once the display font has loaded.
    void document.fonts?.ready.then(() => {
      const b = base.getContext('2d')
      if (b && size > 0) drawStatic(b, size)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={ref} className="minimap" role="img" aria-label={strings.map} />
}
