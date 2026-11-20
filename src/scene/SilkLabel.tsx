import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { colors, fonts } from '../theme'

interface SilkLabelProps {
  text: string
  /** Size of the label area in metres. Text wraps and shrinks to fit inside it. */
  width: number
  height: number
  /** Letter height in metres. */
  size: number
  color?: string
  /** Draw a plate with an outline behind the text. */
  plate?: boolean
  /** Plate fill and outline colours (default: dark green with a light outline). */
  plateColor?: string
  plateStroke?: string
  /** Lie flat on the board (default) or stand upright facing +Z. */
  flat?: boolean
  position?: [number, number, number]
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function draw(
  canvas: HTMLCanvasElement,
  p: Required<Pick<SilkLabelProps, 'text' | 'color' | 'plate' | 'plateColor' | 'plateStroke'>>,
  fontPx: number,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: w, height: h } = canvas
  ctx.clearRect(0, 0, w, h)

  let px = fontPx
  let lines: string[] = []
  let pad = 0
  // Shrink the text until every line fits the label area.
  for (let i = 0; i < 12; i++) {
    ctx.font = `700 ${px}px ${fonts.display}, "Arial Narrow", sans-serif`
    pad = p.plate ? px * 0.5 : px * 0.1
    lines = wrap(ctx, p.text, w - pad * 2)
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
    if (lines.length * px * 1.15 + pad * 2 <= h && widest + pad * 2 <= w) break
    px *= 0.9
  }

  const lineHeight = px * 1.15
  const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width))
  const textHeight = lines.length * lineHeight

  if (p.plate) {
    const stroke = Math.max(2, px * 0.07)
    const bw = Math.min(w - stroke, textWidth + pad * 2)
    const bh = Math.min(h - stroke, textHeight + pad * 1.4)
    ctx.beginPath()
    ctx.roundRect((w - bw) / 2, (h - bh) / 2, bw, bh, px * 0.25)
    ctx.fillStyle = p.plateColor
    ctx.fill()
    ctx.lineWidth = stroke
    ctx.strokeStyle = p.plateStroke
    ctx.stroke()
  }

  ctx.fillStyle = p.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h / 2 - textHeight / 2 + lineHeight * (i + 0.5) + px * 0.04)
  })
}

/**
 * Text printed in the world, on signs and plaques. Drawn with the 2D canvas into a
 * texture, so it works under both WebGPU and WebGL (no custom shaders) and is
 * hidden correctly when something drives in front of it.
 */
export function SilkLabel({
  text,
  width,
  height,
  size,
  color = colors.silkscreen,
  plate = false,
  plateColor = colors.deepMask,
  plateStroke = colors.silkscreen,
  flat = true,
  position,
}: SilkLabelProps) {
  const texture = useMemo(() => {
    const ppm = Math.min(96, 1024 / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width * ppm)
    canvas.height = Math.ceil(height * ppm)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    const render = () => {
      draw(canvas, { text, color, plate, plateColor, plateStroke }, size * ppm)
      tex.needsUpdate = true
    }
    render()
    // Draw again once the web font is ready (the first pass may use a fallback font).
    document.fonts
      ?.load(`700 32px ${fonts.display}`, text)
      .then(render)
      .catch(() => undefined)
    return tex
  }, [text, width, height, size, color, plate, plateColor, plateStroke])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} renderOrder={2}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
