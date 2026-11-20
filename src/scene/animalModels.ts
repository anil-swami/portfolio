import { BoxGeometry, BufferAttribute, type BufferGeometry, Color, ConeGeometry, SphereGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Species } from '../world/animals'

/**
 * Code-built low-poly animals. Each body is merged into one geometry with vertex colours, so a
 * whole species draws as one instanced mesh. Legs (and bird wings) are separate so they can move.
 * Every model faces +Z and stands on y = 0.
 */

type V3 = [number, number, number]

interface Part {
  geo: BufferGeometry
  at: V3
  color: string
  /** Optional tilt around X (radians), applied before moving into place. */
  tilt?: number
}

const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d)
const ball = (rx: number, ry: number, rz: number) => new SphereGeometry(1, 8, 6).scale(rx, ry, rz)
const cone = (r: number, h: number) => new ConeGeometry(r, h, 6)

function merge(parts: Part[]): BufferGeometry {
  const pieces = parts.map(({ geo, at, color, tilt }) => {
    const g = geo.clone()
    if (tilt) g.rotateX(tilt)
    g.translate(...at)
    const c = new Color(color)
    const rgb = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < rgb.length; i += 3) rgb.set([c.r, c.g, c.b], i)
    g.setAttribute('color', new BufferAttribute(rgb, 3))
    return g
  })
  const merged = mergeGeometries(pieces)
  pieces.forEach((p) => p.dispose())
  return merged
}

const DEER = '#9C6B40'
const DEER_LIGHT = '#E8D9BF'
const FOX = '#D9772B'
const DARK = '#2E241C'
const WHITE = '#F4EFE6'

export interface AnimalModel {
  body: BufferGeometry
  /** A single leg or wing; its top (or inner edge) is at the origin so it swings from there. */
  limb?: BufferGeometry
  limbColor?: string
  /** Where each limb attaches, in model space. */
  limbs?: V3[]
}

export function makeModels(): Record<Species, AnimalModel> {
  const deer: AnimalModel = {
    body: merge([
      { geo: box(0.5, 0.55, 1.25), at: [0, 1.05, 0], color: DEER },
      { geo: box(0.4, 0.12, 1.0), at: [0, 0.78, 0], color: DEER_LIGHT },
      { geo: box(0.22, 0.62, 0.26), at: [0, 1.45, 0.52], color: DEER, tilt: 0.45 },
      { geo: box(0.27, 0.28, 0.46), at: [0, 1.78, 0.74], color: DEER },
      { geo: box(0.14, 0.12, 0.1), at: [0, 1.72, 0.99], color: DARK },
      { geo: box(0.06, 0.2, 0.12), at: [0.15, 1.97, 0.62], color: DEER },
      { geo: box(0.06, 0.2, 0.12), at: [-0.15, 1.97, 0.62], color: DEER },
      { geo: box(0.04, 0.42, 0.04), at: [0.09, 2.1, 0.66], color: DEER_LIGHT, tilt: -0.3 },
      { geo: box(0.04, 0.42, 0.04), at: [-0.09, 2.1, 0.66], color: DEER_LIGHT, tilt: -0.3 },
      { geo: box(0.14, 0.16, 0.08), at: [0, 1.18, -0.66], color: WHITE },
    ]),
    limb: box(0.1, 0.8, 0.1).translate(0, -0.4, 0),
    limbColor: DEER,
    limbs: [
      [0.17, 0.8, 0.46],
      [-0.17, 0.8, 0.46],
      [0.17, 0.8, -0.46],
      [-0.17, 0.8, -0.46],
    ],
  }

  const rabbit: AnimalModel = {
    body: merge([
      { geo: ball(0.2, 0.18, 0.28), at: [0, 0.2, 0], color: '#A28B71' },
      { geo: ball(0.12, 0.12, 0.13), at: [0, 0.36, 0.22], color: '#A28B71' },
      { geo: box(0.05, 0.24, 0.04), at: [0.05, 0.56, 0.18], color: '#A28B71', tilt: -0.2 },
      { geo: box(0.05, 0.24, 0.04), at: [-0.05, 0.56, 0.18], color: '#A28B71', tilt: -0.2 },
      { geo: ball(0.06, 0.06, 0.06), at: [0, 0.26, -0.28], color: WHITE },
      { geo: ball(0.025, 0.025, 0.025), at: [0, 0.35, 0.35], color: DARK },
    ]),
  }

  const fox: AnimalModel = {
    body: merge([
      { geo: box(0.28, 0.28, 0.7), at: [0, 0.46, 0], color: FOX },
      { geo: box(0.2, 0.1, 0.5), at: [0, 0.33, 0.02], color: WHITE },
      { geo: box(0.24, 0.22, 0.26), at: [0, 0.6, 0.44], color: FOX },
      { geo: box(0.12, 0.1, 0.16), at: [0, 0.55, 0.62], color: WHITE },
      { geo: box(0.05, 0.05, 0.04), at: [0, 0.57, 0.71], color: DARK },
      { geo: cone(0.06, 0.14), at: [0.08, 0.78, 0.42], color: FOX },
      { geo: cone(0.06, 0.14), at: [-0.08, 0.78, 0.42], color: FOX },
      { geo: cone(0.1, 0.55), at: [0, 0.48, -0.6], color: FOX, tilt: -1.9 },
      { geo: cone(0.05, 0.14), at: [0, 0.38, -0.86], color: WHITE, tilt: -1.9 },
    ]),
    limb: box(0.07, 0.34, 0.07).translate(0, -0.17, 0),
    limbColor: DARK,
    limbs: [
      [0.1, 0.34, 0.26],
      [-0.1, 0.34, 0.26],
      [0.1, 0.34, -0.26],
      [-0.1, 0.34, -0.26],
    ],
  }

  const duck: AnimalModel = {
    body: merge([
      { geo: ball(0.2, 0.13, 0.3), at: [0, 0.12, 0], color: '#8A6B4E' },
      { geo: ball(0.15, 0.08, 0.2), at: [0, 0.2, -0.04], color: '#6E5640' },
      { geo: ball(0.1, 0.1, 0.1), at: [0, 0.34, 0.2], color: '#2F6B3A' },
      { geo: box(0.08, 0.04, 0.1), at: [0, 0.32, 0.32], color: '#E8A033' },
      { geo: box(0.2, 0.03, 0.05), at: [0, 0.27, 0.17], color: WHITE },
    ]),
  }

  const bird: AnimalModel = {
    body: merge([
      { geo: ball(0.07, 0.07, 0.18), at: [0, 0, 0], color: '#3C3A44' },
      { geo: ball(0.05, 0.05, 0.05), at: [0, 0.03, 0.17], color: '#3C3A44' },
      { geo: cone(0.02, 0.06), at: [0, 0.03, 0.24], color: '#E8A033', tilt: Math.PI / 2 },
      { geo: box(0.1, 0.01, 0.1), at: [0, 0, -0.2], color: '#3C3A44' },
    ]),
    // A wing reaches out along +X from the body's side; the left one is mirrored.
    limb: box(0.36, 0.015, 0.13).translate(0.18, 0, 0),
    limbColor: '#4A4855',
    limbs: [
      [0.05, 0.02, 0],
      [-0.05, 0.02, 0],
    ],
  }

  return { deer, rabbit, fox, duck, bird }
}
