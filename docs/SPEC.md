# Anil Swami — 3D Portfolio: Build Plan for Claude Code

Put this file in your project as `docs/SPEC.md`. Claude Code reads it at the start of every phase.

How to use it:

1. Create an empty folder, open it in VS Code, and start Claude Code.
2. Copy section 1 into `CLAUDE.md` at the project root.
3. Paste the **Kickoff prompt** (section 2) into Claude Code.
4. Then paste one **Phase prompt** (section 12) at a time. Test each phase in the browser before moving on.

---

## 1. CLAUDE.md (copy into the project root)

```markdown
# Project: Anil Swami 3D portfolio

Full spec: docs/SPEC.md. Read it before starting any phase.

## Working rules
- Build one phase at a time. Stop at the end of each phase and wait for me.
- After every phase run `npm run typecheck` and `npm run build`. Fix all errors before reporting.
- Never hardcode portfolio text in components. All text comes from content/portfolio.json.
- Ask before adding any dependency that is not listed in the spec.
- The site is fully static: no server, no API calls, no secrets.
- 3D models are optional. Every model slot must have a code-built fallback, so the site works with zero .glb files.
- Prefer small, focused files (one component per file).
- When you finish a phase, tell me: what was built, how to test it, and anything I must do by hand.
```

---

## 2. Kickoff prompt (paste into Claude Code first)

```
Read docs/SPEC.md and CLAUDE.md fully.
We are building a 3D driving-game portfolio in phases (section 12 of the spec).
Before writing code, reply with:
1. A short summary of what you will build, in your own words.
2. Any part of the spec that is unclear or that you think is a mistake.
3. The exact package versions you will install (check npm for the latest stable versions).
Do not start Phase 1 until I say "go".
```

---

## 3. What we are building

A portfolio website where the visitor drives a small car around a 3D world, in the style of bruno-simon.com, but with its own identity and these extras:

- A fast first load and smooth play on mid-range phones.
- A "Simple view": a plain HTML page with the same content, for recruiters and Google.
- A fully static build that can be hosted on any shared hosting, with no server to run.

**Concept: a circuit board you can drive on.** Anil trained as an electrical engineer, so the world is a giant printed circuit board (PCB):

- Solder-mask green ground, copper traces as roads, chips as the content zones.
- Small capacitors, resistors and SMD parts as props.
- Silkscreen-style white labels printed on the board.
- When the visitor presses Start, the board "powers on": LEDs light up one by one. This is the one signature animation; keep other motion minimal.

---

## 4. Tech stack

Install the latest stable version of each package at build time. These were current on 17 Nov 2026:

| Layer | Package | Version seen |
|---|---|---|
| Build | vite, @vitejs/plugin-react | 8.3.x, 6.3.x |
| Language | typescript | latest stable |
| UI | react, react-dom | 19.3.x |
| 3D | three | 0.187.x |
| 3D in React | @react-three/fiber | 9.8.x (stable; do not use the v10 alpha) |
| Helpers | @react-three/drei | 10.7.x |
| Physics | @react-three/rapier | 2.2.x |
| State | zustand | 5.x |
| Fonts | @fontsource/saira-semi-condensed, @fontsource/atkinson-hyperlegible | 5.x |
| Types | @types/react, @types/react-dom, @types/three | latest |

### Renderer: WebGPU with WebGL fallback

- Use `WebGPURenderer` from `three/webgpu`, created through the async `gl` prop of the R3F `<Canvas>`:

```tsx
<Canvas
  shadows
  gl={async (props) => {
    const renderer = new WebGPURenderer({ ...props, antialias: true, forceWebGL: compatMode })
    await renderer.init()
    return renderer
  }}
>
```

- WebGPURenderer falls back to WebGL 2 automatically when WebGPU is missing.
- Settings has a "Compatibility mode" switch that sets `forceWebGL: true`. Remount the Canvas with a `key` when it changes.
- **Watch for drei components that use custom GLSL shaders** (for example `Text`, `MeshReflectorMaterial`, and the postprocessing package). They may not work under WebGPURenderer. Use drei `Html` for all text in the world. Test any other drei component under WebGPU before relying on it.
- Use the standard three.js materials (`meshStandardMaterial`, etc.). WebGPURenderer renders them directly.

---

## 5. Design tokens

### Colours

| Name | Hex | Use |
|---|---|---|
| Solder mask | `#1E5B3A` | Board surface |
| Deep mask | `#143D28` | UI panels, panel backgrounds |
| Copper | `#C9874B` | Traces, panel accent rules, focus outlines |
| Silkscreen | `#EEF0E8` | Labels on the board, UI text |
| Chip | `#1A1C1E` | Chip bodies, crates |
| LED amber | `#FFB627` | LEDs, interact prompt, the car body |
| Workbench | `#23272A` | Area beyond the board edge, scene background |

### Typography

- **Saira Semi Condensed** (600, 700): name, panel headings, board labels. Feels like PCB silkscreen lettering.
- **Atkinson Hyperlegible** (400, 700): body text and buttons.
- Sentence case everywhere. No all-caps labels, no `→` arrows on buttons.
- Type scale: 14 / 16 / 20 / 28 / 44 px. Body line-height 1.55. Max line length 70 characters in panels.

### UI style

- Panels are deep-mask green with a 2 px copper rule along the top edge, silkscreen-white text, 6 px corner radius.
- Buttons: silkscreen outline on green; primary button filled amber with chip-black text.
- Visible copper focus ring on every interactive element.
- Respect `prefers-reduced-motion`: skip the power-on sequence and camera easing.

---

## 6. Content

All text lives in `content/portfolio.json`. The 3D site and the simple view both read this one file. Create it with exactly this content:

```json
{
  "meta": {
    "title": "Anil Swami — Web Developer, Digital Marketer and Designer",
    "description": "Anil Swami builds websites, dashboards and digital content, and uses AI to ship them faster. Drive around the portfolio or open the simple view."
  },
  "start": {
    "name": "Anil Swami",
    "roles": ["Web Developer", "Digital Marketer", "Designer"],
    "intro": "I build websites, dashboards and digital content, and use AI to ship them faster.",
    "button": "Start exploring",
    "simpleViewButton": "Skip to simple view"
  },
  "about": {
    "title": "About",
    "paragraphs": [
      "Hi, I'm Anil. I'm an electrical engineer turned web developer and digital marketer, with about five years of hands-on work.",
      "I build websites and web apps, handle SEO and social media, and design everything from posts to brochures. Whenever a task repeats, I try to turn it into a simple tool."
    ]
  },
  "skills": {
    "title": "Skills",
    "zones": [
      { "name": "Web Development", "line": "Websites, web apps and dashboards, from layout to deployment." },
      { "name": "Automation and AI", "line": "AI-assisted coding, content and workflows that cut out manual work." },
      { "name": "Data and Dashboards", "line": "Spreadsheets and APIs turned into clear, interactive dashboards." },
      { "name": "SEO and Analytics", "line": "Keyword research, on-page SEO and performance tracking." },
      { "name": "Digital Marketing", "line": "Social media, content planning, copywriting and ad campaigns." },
      { "name": "Graphic Design", "line": "Posters, social posts, ads, thumbnails, brochures, resumes and print layouts." },
      { "name": "Video", "line": "Reels, short videos and simple animations." }
    ],
    "stack": [
      { "group": "Frontend", "items": ["HTML", "CSS", "JavaScript", "Bootstrap", "React"] },
      { "group": "Backend", "items": ["Node.js", "Express"] },
      { "group": "Databases", "items": ["MongoDB", "PostgreSQL", "SQL"] },
      { "group": "Tools", "items": ["Git", "GitHub", "VS Code", "cPanel"] },
      { "group": "Analytics and ads", "items": ["Search Console", "GA4", "Tag Manager", "Google Ads", "Meta Ads"] },
      { "group": "AI", "items": ["Claude", "Claude Code", "ChatGPT"] },
      { "group": "Design", "items": ["Canva", "AI image tools"] },
      { "group": "Learning now", "items": ["Python", ".NET"] }
    ]
  },
  "projects": {
    "title": "Projects",
    "items": [
      { "name": "Business websites", "line": "Responsive multi-page websites with a blog, deployed through GitHub.", "tags": ["Node.js", "Git", "cPanel"] },
      { "name": "SEO analytics dashboard", "line": "Live search and traffic data from Google APIs on one screen.", "tags": ["Node.js", "Google APIs", "Chart.js"] },
      { "name": "Keyword tracking dashboard", "line": "Hundreds of keywords tracked month by month, with filters and trends.", "tags": ["JavaScript", "Chart.js", "Python"] },
      { "name": "Data reporting app", "line": "Excel uploads saved to a database and turned into charts.", "tags": ["Node.js", "Express", "SQL"] },
      { "name": "Interactive org chart", "line": "A searchable, zoomable chart for a large organisation.", "tags": ["JavaScript", "SVG"] },
      { "name": "Work hub", "line": "One dashboard for tasks, content, inventory and reports. In progress.", "tags": ["Node.js", "PostgreSQL"] },
      { "name": "Design work", "line": "Social posts, posters, ads, brochures and covers.", "tags": ["Canva", "AI image tools"] }
    ]
  },
  "experience": {
    "title": "Experience and education",
    "roles": [
      { "title": "Digital Marketing and Web Developer", "where": "In-house", "period": "About 5 years, present", "line": "Websites, web apps, SEO, social media and design for a growing company." }
    ],
    "education": [
      { "name": "B.Tech, Electrical Engineering", "year": "2019" },
      { "name": "Front-end Web Development", "year": "2020" },
      { "name": "Industrial Automation (PLC, SCADA, HMI)", "year": "2018" }
    ]
  },
  "contact": {
    "title": "Contact",
    "line": "Let's build something.",
    "email": "Anilswami5388@gmail.com",
    "linkedin": "",
    "github": "",
    "resumePdf": ""
  },
  "world": {
    "loadingLines": ["Loading the world…", "Warming up the engine…", "Almost there…"],
    "controlsHint": "WASD or arrow keys to drive. Shift to boost. E to interact.",
    "interactPrompt": "Press E to open",
    "secret": "You found a secret. Thanks for exploring!",
    "credits": "Designed and built by Anil Swami. Made with Three.js, React Three Fiber and Rapier."
  }
}
```

Empty strings (LinkedIn, GitHub, resume) mean "hide this item". Anil fills them in later.

---

## 7. World layout

Units are metres. The board is 120 × 120, centred on the origin. The car spawns at the origin facing −Z (north).

| Item | Position (x, z) | Notes |
|---|---|---|
| Spawn pad | (0, 0) | Round copper pad, 8 m wide, "Anil Swami" silkscreen label in front of it |
| About chip (U1) | (0, −30) | |
| Skills chip (U2) | (32, −8) | 7 capacitors in an arc behind it, one per skill, each with a small label |
| Projects chip (U3) | (26, 26) | 7 standing boards (like SD cards) in a row, one per project, title label on each |
| Experience chip (U4) | (−26, 26) | |
| Contact chip (U5) | (−32, −8) | |
| Crate tower | (−8, −12) | 10 small black SMD chips stacked as a pyramid; dynamic bodies the car can knock over |
| Secret LED | (−52, −52) | Hidden behind a large capacitor near the corner |

- **Chips** are 8 × 8 m black boxes, 1.6 m tall, with pins along the sides, a silkscreen label ("U1 About"), and one amber LED on top. Solid colliders.
- **Copper traces** run from the spawn pad to each chip: flat copper strips, 4 m wide, 4 cm high, with a 45° bend where needed. Visual only (the ground collider is flat).
- **Decoration:** vias (small copper rings), resistor rows, mounting holes in the corners, board edge in a slightly darker green.
- **Board edge:** invisible walls at ±60 so the car cannot fall off. Beyond the edge, a workbench surface in `#23272A`.

---

## 8. Car and camera

### Car controller (arcade style, Rapier)

- One dynamic `RigidBody` with a cuboid collider about 1.8 × 1.0 × 2.8 m. Lock X and Z rotations so it never flips.
- Forward is local +Z.
- Every frame:
  - Throttle: apply an impulse along the car's forward vector. Max speed 16 m/s, 24 m/s with boost.
  - Grip: remove most of the sideways velocity (keep about 10%) so it drifts slightly.
  - Steering: set angular velocity around Y, scaled by current speed, reversed when driving backwards.
  - Brake (Space): strong damping.
- `linearDamping` about 0.6, `angularDamping` about 4.
- Respawn at the spawn pad on R, or automatically if the car's Y position drops below −5.
- Wheels spin with speed; front wheels turn with steering.

### Controls

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

- Keep input in a plain module-level object (not React state), so key presses don't cause re-renders.
- Disable driving input while a panel is open.

### Camera

- Chase camera, like a racing game: about 10 m behind and 4.5 m above the car, turning with the car's heading and looking at a point about 6 m ahead of it, so the player sees the road in front.
- Smooth follow with frame-rate-independent easing: `1 - exp(-6 * delta)` for position and a slower `1 - exp(-3.5 * delta)` for the heading, so turns read clearly without snapping. Pulls back slightly with forward speed.
- Mouse wheel / pinch zooms between 0.6× and 1.6× of the chase distance.
- The sun's shadow area is centred ahead of the car, where the camera looks.

### Lighting

- Hemisphere light plus one directional light with shadows.
- Move the directional light and its shadow camera with the car, so the shadow map only covers the area around the player.

---

## 9. Interaction and UI

### Zones

- Each chip has a sensor collider of about 14 × 14 m around it.
- When the car enters, show the interact prompt at the bottom centre: "Press E to open About" (amber pill).
- E opens that zone's panel.

### Screens and overlays

1. **Loading screen:** board-green background, the loading lines cycling, a thin copper progress bar (drei `useProgress`).
2. **Start screen:** name (large, Saira), the three roles, intro line, "Start exploring" (primary) and "Skip to simple view" (link). The 3D board is visible, dimmed, behind it.
3. **Power-on:** on Start, the LEDs on each chip turn on one after another (about 250 ms apart), then the HUD appears. Skip it if reduced motion is on.
4. **HUD:**
   - Top left: "Anil Swami" small.
   - Top right: icon buttons for sound, settings and simple view.
   - Bottom left: controls hint. Fade it out after the car has moved for 5 seconds.
   - Bottom centre: interact prompt.
5. **Content panels:** slide in from the right on desktop, from the bottom on mobile. One panel per zone (About, Skills, Projects, Experience and education, Contact). Close with Esc, the close button, or by clicking outside. Focus moves into the panel when it opens and returns when it closes.
6. **Settings panel:** Quality (High: shadows on, DPR up to 2. Low: shadows off, DPR 1), Compatibility mode, Sound on/off, Reset car, Credits text.
7. **Touch controls:** shown only on touch devices (`pointer: coarse`). Left and right steer buttons on the left, gas and brake on the right, an E button above them. They write to the same input object as the keyboard.
8. **Toasts:** small messages at the top centre, for example the secret.

### Sound

- No audio files needed at first. Use the Web Audio API:
  - Engine hum: sawtooth oscillator through a low-pass filter. Pitch and volume follow speed.
  - A short "blip" when a panel opens.
- Start audio only after the Start click (browser autoplay rules). M and the HUD button mute it.

### Performance

- Use drei `PerformanceMonitor` to drop DPR when the frame rate falls.
- Targets: 60 fps on a mid-range laptop, 30+ fps on a mid-range Android phone.
- First load under about 2 MB before models. Load the 3D models after the start screen appears.
- Instanced meshes for repeated props (vias, pins, resistors).

---

## 10. Simple view and SEO

- `simple.html` is a real HTML page, generated from `portfolio.json` at build time by a small Vite plugin (`transformIndexHtml`), so Google and recruiters see real text without running JavaScript.
- Configure Vite as a multi-page build so `dist/` contains both `index.html` and `simple.html`.
- Same fonts and colours as the 3D site, a single readable column, and a link "Open the 3D world".
- `index.html` has the meta title and description from the JSON, Open Graph tags, and a `<noscript>` link to the simple view.
- Add `robots.txt` and `sitemap.xml` (two URLs: `/` and `/simple`).
- Add an `.htaccess` in `public/` that:
  - Rewrites `/simple` to `/simple.html`.
  - Sets long cache headers for the hashed files in `/assets/`, and no-cache for the HTML files.
  - Turns on gzip compression (mod_deflate) for JS, CSS, HTML and JSON.
  - Adds the MIME type `model/gltf-binary` for `.glb`.

---

## 11. Blender models

The site must run with no models. Each slot below falls back to a model built in code. When a `.glb` file with the slot's exact name exists in `src/assets/models/`, it replaces the fallback automatically.

- Detect files with `import.meta.glob('../assets/models/*.glb', { eager: true, query: '?url', import: 'default' })`.
- Load with drei `useGLTF(url, false, true)` (meshopt on).
- Physics colliders always stay the simple boxes from code. Models are visual only.

| File | What | Size and origin |
|---|---|---|
| `car.glb` | The car | Fits 1.8 × 1.0 × 2.8 m. Origin at the centre of that box. Wheel objects named `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`, each with its origin at the wheel centre |
| `zone-about.glb`, `zone-skills.glb`, `zone-projects.glb`, `zone-experience.glb`, `zone-contact.glb` | Chip buildings | Footprint up to 8 × 8 m, origin at the base centre |
| `crate.glb` | One stackable SMD chip | 1 × 1 × 1 m, origin at the centre |
| `decor.glb` | Extra board decoration | Placed at the world origin, visual only, no collisions |

### Blender rules

- Units: metres, scale 1. Apply all transforms before export.
- Orientation: model the car so its front faces Blender's front view (−Y). After glTF export (+Y up), the front points to +Z in three.js, which is the car's forward direction.
- Budget: car under 15k triangles, each zone under 30k.
- Materials: Principled BSDF only (base colour, roughness, metallic, emission). Prefer one small palette texture or plain colours from section 5.
- Export: File → Export → glTF 2.0, format glTF Binary (.glb), "+Y Up" on, "Apply Modifiers" on.
- Put raw exports in `models-src/`. The script `npm run models` compresses them into `src/assets/models/` with `npx @gltf-transform/cli optimize <in> <out> --compress meshopt --texture-compress webp`.

### Prompts for Claude in Blender

- "Create a low-poly toy car about 2.8 m long, 1.8 m wide, 1 m tall, in amber #FFB627 with dark grey wheels. Front facing −Y. Name the wheels wheel_fl, wheel_fr, wheel_rl, wheel_rr, with origins at each wheel centre. Under 15k triangles. Apply transforms."
- "Create a large IC chip building, 8 × 8 m footprint and 1.6 m tall, matte black #1A1C1E, with silver pins along all four sides and a small amber LED dome on top. Origin at the base centre."
- "Create a small SMD chip, 1 × 1 × 1 m, matte black with silver pins on two sides. Origin at the centre."
- "Export the selected object as glTF Binary to models-src/car.glb with +Y up and modifiers applied."

---

## 12. Phase prompts (paste one at a time)

### Phase 1: Project setup and empty board

```
Phase 1. Set up the project from docs/SPEC.md:
- Vite + React + TypeScript project with the packages in section 4. Scripts: dev, build, preview, typecheck.
- content/portfolio.json with the exact content in section 6.
- Fonts and the colour tokens from section 5 as CSS variables.
- The R3F Canvas with WebGPURenderer and the compatibility-mode fallback from section 4.
- The board ground, the workbench beyond it, the board edge walls, lights, and a fixed camera looking at the origin.
Done when `npm run dev` shows a green board under a camera, `npm run typecheck` and `npm run build` pass, and the console shows whether WebGPU or WebGL is in use.
```

### Phase 2: Car, physics and camera

```
Phase 2. Build the car and controls from section 8:
- Rapier physics world, the arcade car controller, keyboard input object, respawn on R and on falling.
- A code-built placeholder car (amber body, four dark wheels that spin and steer).
- The follow camera with smooth easing and wheel/pinch zoom.
- Shadows that follow the car.
Done when I can drive smoothly around the whole board, can't leave it, and R resets the car.
```

### Phase 3: Zones, chips and content panels

```
Phase 3. Build the world layout and zones from sections 7 and 9:
- Spawn pad with the name label, the five chips with labels and LEDs, copper traces to each chip, vias, resistors and mounting holes (use instancing for repeated props).
- The 7 skill capacitors and the 7 project boards with Html labels.
- Sensor zones, the interact prompt, and E to open the matching panel.
- The five content panels, all reading from content/portfolio.json, with keyboard focus handling and Esc to close.
Done when I can drive to each chip, see the prompt, press E, read the right content, and close it.
```

### Phase 4: Screens, HUD, sound and touch

```
Phase 4. Build the rest of the interface from section 9:
- Loading screen, start screen, power-on LED sequence, HUD, settings panel (quality, compatibility mode, sound, reset car, credits), toasts.
- The crate tower and the secret LED with its toast.
- Web Audio engine hum and blip, starting after the Start click, with mute on M.
- Touch controls on touch devices.
- Reduced-motion support.
Done when the full flow works: load, start, power-on, drive, open panels, change settings, find the secret, and play on a phone (test with Chrome device mode).
```

### Phase 5: Simple view and SEO

```
Phase 5. Build section 10:
- Multi-page Vite build with index.html and simple.html.
- The Vite plugin that renders simple.html from portfolio.json at build time.
- Meta tags, Open Graph tags, noscript link, robots.txt, sitemap.xml and the .htaccess file.
Done when `npm run build && npm run preview` serves both pages, and viewing the source of simple.html shows all the real text.
```

### Phase 6: Blender model slots

```
Phase 6. Build section 11:
- Auto-detection of .glb files in src/assets/models with fallbacks for every slot.
- Wheel animation for car.glb using the wheel_* node names.
- `npm run models` script that compresses everything in models-src/ into src/assets/models/.
- BLENDER.md with the rules and prompts from section 11.
Test with any free sample .glb renamed to car.glb, then remove it.
Done when adding or removing a .glb swaps between the model and the fallback with no code changes.
```

### Phase 7: Performance and testing

```
Phase 7. Performance and quality pass:
- PerformanceMonitor for DPR, instancing checked, models loaded after the start screen, bundle size report.
- Check: keyboard-only use of all panels, focus rings, reduced motion, colour contrast, mobile layout at 375 px width.
- Test in Chrome, Firefox and Safari if available, with compatibility mode on and off.
- Write README.md: setup, scripts, how to edit content, how to add models, how to deploy.
Report the bundle sizes and anything that is still slow.
```

### Phase 8: Deploy to GoDaddy (static hosting)

```
Phase 8. Prepare deployment as a static site on GoDaddy cPanel (no Node app needed):
- Make sure `npm run build` outputs everything the site needs into dist/, including .htaccess, robots.txt and sitemap.xml.
- Add a .cpanel.yml that copies the contents of dist/ into the domain's document root, for use with cPanel "Git Version Control" deployment. Keep dist/ committed (not in .gitignore), because the site is built locally.
- Write DEPLOY.md with two options:
  1. Git: build locally, commit and push to GitHub, then in cPanel Git Version Control pull the latest changes and click "Deploy HEAD Commit".
  2. Manual: build locally, zip the contents of dist/, upload with cPanel File Manager to the document root, and extract.
- Include how to point a domain or subdomain at the folder, and how to test the live site (both pages, a .glb load, and the .htaccess rewrite for /simple).
```

---

## 13. Final checklist

- [ ] Site works with no .glb files at all.
- [ ] Runs on WebGPU and in compatibility mode (WebGL).
- [ ] Drivable at 30+ fps on a mid-range phone.
- [ ] Every panel opens, reads from portfolio.json, and closes with Esc.
- [ ] /simple shows all content as real HTML.
- [ ] LinkedIn, GitHub and resume links added to portfolio.json.
- [ ] Deployed and tested on the live domain.
