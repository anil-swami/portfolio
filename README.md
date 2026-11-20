# Anil Swami: 3D portfolio

A portfolio you drive through. The world is a giant circuit board: copper traces are the roads and the chips are the content zones. A plain HTML "simple view" carries the same content for recruiters and search engines. The build is fully static, so it runs on any shared hosting.

Full specification: [docs/SPEC.md](docs/SPEC.md).

## Setup

Needs Node.js 20.19 or newer (built with Node 24).

```
npm install
npm run dev
```

Then open http://localhost:5173. The simple view is at http://localhost:5173/simple.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to check it before deploying |
| `npm run typecheck` | Check TypeScript types |
| `npm run models` | Compress Blender exports from `models-src/` into `src/assets/models/` |

## Editing content

All portfolio text lives in one file: [content/portfolio.json](content/portfolio.json). The 3D site and the simple view both read it, so one edit updates both.

- Add your **LinkedIn**, **GitHub** and **resume** in the `contact` section. An empty string hides that item. For the resume, put the PDF in `public/` (for example `public/anil-swami-resume.pdf`) and set `"resumePdf": "anil-swami-resume.pdf"`.
- Adding or removing a skill or a project also adds or removes its capacitor or standing board in the 3D world.
- Set your real web address in [site.config.json](site.config.json). It is used for `sitemap.xml`, `robots.txt` and the link-preview tags.
- Button and settings labels (interface text, not portfolio content) are in [src/ui/strings.ts](src/ui/strings.ts).

Run `npm run build` after editing to refresh `dist/`.

## Controls

| Key | Action |
|---|---|
| W / ↑ | Accelerate |
| S / ↓ | Reverse |
| A / ← and D / → | Steer |
| Shift | Boost |
| Space | Brake |
| E | Interact |
| R | Reset car |
| M | Mute |
| Esc | Close panel |

Mouse wheel or pinch zooms the camera. On touch devices, on-screen buttons appear; the Brake button reverses once the car has stopped.

## Adding 3D models

The site works with zero models. To replace a code-built object with a Blender model, drop a `.glb` with the right name into `src/assets/models/`. See [BLENDER.md](BLENDER.md) for names, sizes and export settings.

## Deploying

See [DEPLOY.md](DEPLOY.md) for GoDaddy cPanel, by Git or by manual upload.

## How it is organised

```
content/portfolio.json   All portfolio text
site.config.json         The site's public address
index.html               The 3D site
simple.html              The simple view (filled in from portfolio.json at build time)
plugins/                 Vite plugin that renders simple.html, robots.txt and sitemap.xml
public/                  Files copied as-is: .htaccess, favicon
src/
  scene/                 The 3D world: board, car, chips, props, camera, lights, model slots
  ui/                    Screens, HUD, panels, settings, touch controls, toasts
  game/                  Input, audio and shared car state
  state/store.ts         App state (zustand)
  world/layout.ts        Where everything sits on the board
  styles/                Design tokens and CSS
models-src/              Raw Blender exports (input of `npm run models`)
```

Technical notes:

- **Renderer.** three.js `WebGPURenderer`, which falls back to WebGL 2 by itself when WebGPU is missing. Settings → Compatibility mode forces WebGL. The browser console prints which one is in use.
- **Text in the world** is drawn with the 2D canvas into textures (`src/scene/SilkLabel.tsx`). There are no custom shaders, so it renders the same under WebGPU and WebGL.
- **Car tuning** (top speed, grip, steering) is a block of constants at the top of `src/scene/Car.tsx`.
- **Performance.** Repeated props are instanced, the 3D code loads as a separate chunk after the first paint, models load only after the start screen appears, and the resolution drops automatically when the frame rate falls. Low quality (the default on touch devices) turns shadows off.

## Bundle sizes

Measured from `npm run build` (no models):

| File | Size | Gzipped |
|---|---|---|
| App shell (React, UI, state) | 245 kB | 77 kB |
| 3D chunk (three.js, React Three Fiber, Rapier physics) | 3,884 kB | 1,289 kB |
| CSS | 13 kB | 3 kB |
| Fonts (4 files, woff2) | 70 kB | already compressed |

With gzip on (the included `.htaccess` turns it on), the first load is about 1.4 MB. Most of the 3D chunk is the Rapier physics engine and the two three.js renderer back ends.
