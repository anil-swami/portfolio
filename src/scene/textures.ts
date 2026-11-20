import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'
import { colors } from '../theme'

/**
 * Small textures painted with the 2D canvas, so they work under WebGPU and WebGL and need no
 * image files. Each is created once and shared.
 */
const cache = new Map<string, Texture>()

function painted(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): Texture {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) paint(ctx)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/** Stacked horizontal logs for cabin walls. One repeat is 6 logs. */
export function logTexture(): Texture {
  return painted('logs', 64, 256, (ctx) => {
    const logs = 6
    const h = 256 / logs
    for (let i = 0; i < logs; i++) {
      const y = i * h
      const grad = ctx.createLinearGradient(0, y, 0, y + h)
      grad.addColorStop(0, colors.woodDark)
      grad.addColorStop(0.18, colors.log)
      grad.addColorStop(0.5, colors.woodLight)
      grad.addColorStop(0.82, colors.log)
      grad.addColorStop(1, colors.woodDark)
      ctx.fillStyle = grad
      ctx.fillRect(0, y, 64, h)
    }
  })
}

/** A plank crate face: light boards, a dark frame and a diagonal brace. */
export function crateTexture(): Texture {
  return painted('crate', 128, 128, (ctx) => {
    ctx.fillStyle = colors.woodLight
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = colors.wood
    ctx.lineWidth = 2
    for (let y = 32; y < 128; y += 32) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(128, y)
      ctx.stroke()
    }
    ctx.strokeStyle = colors.woodDark
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, 114, 114)
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(12, 116)
    ctx.lineTo(116, 12)
    ctx.stroke()
  })
}

/** Soft light ripples on water, tiling in both directions. */
export function waterTexture(): Texture {
  return painted('water', 128, 128, (ctx) => {
    ctx.fillStyle = colors.water
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineCap = 'round'
    ctx.lineWidth = 2
    // Short wavy dashes, drawn twice with an offset so the tile wraps cleanly.
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 26; i++) {
      const x = rand() * 128
      const y = rand() * 128
      const w = 8 + rand() * 18
      for (const [dx, dy] of [[0, 0], [-128, 0], [0, -128], [-128, -128]]) {
        ctx.beginPath()
        ctx.moveTo(x + dx, y + dy)
        ctx.quadraticCurveTo(x + dx + w / 2, y + dy - 3, x + dx + w, y + dy)
        ctx.stroke()
      }
    }
  })
}

/** Deck planks running across a bridge: one repeat is 8 planks along the length. */
export function plankTexture(): Texture {
  return painted('planks', 64, 256, (ctx) => {
    const planks = 8
    const h = 256 / planks
    for (let i = 0; i < planks; i++) {
      ctx.fillStyle = i % 2 === 0 ? colors.woodLight : colors.wood
      ctx.fillRect(0, i * h, 64, h)
      ctx.fillStyle = colors.woodDark
      ctx.fillRect(0, i * h, 64, 3)
    }
  })
}
