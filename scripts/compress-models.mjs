// Compresses every .glb in models-src/ into src/assets/models/ (meshopt geometry, WebP textures).
// Usage: npm run models
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'models-src'
const OUT = join('src', 'assets', 'models')
const SLOTS = [
  'car',
  'crate',
  'decor',
  'zone-about',
  'zone-skills',
  'zone-projects',
  'zone-experience',
  'zone-contact',
]

if (!existsSync(SRC)) {
  console.error(`No ${SRC}/ folder found. Put your Blender .glb exports there.`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const files = readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.glb'))
if (files.length === 0) {
  console.log(`No .glb files in ${SRC}/. Nothing to do.`)
  process.exit(0)
}

const kb = (path) => `${(statSync(path).size / 1024).toFixed(0)} KB`
let failed = 0

for (const file of files) {
  const name = file.replace(/\.glb$/i, '')
  if (!SLOTS.includes(name)) {
    console.warn(`! ${file}: not a known slot name, so the site will ignore it. Slots: ${SLOTS.join(', ')}`)
  }
  const input = join(SRC, file)
  const output = join(OUT, `${name}.glb`)
  console.log(`Compressing ${file}...`)
  const result = spawnSync(
    'npx',
    ['--yes', '@gltf-transform/cli', 'optimize', input, output, '--compress', 'meshopt', '--texture-compress', 'webp'],
    { stdio: 'inherit', shell: true },
  )
  if (result.status !== 0) {
    console.error(`x ${file} failed`)
    failed++
  } else {
    console.log(`  ${kb(input)} -> ${kb(output)}`)
  }
}

process.exit(failed ? 1 : 0)
