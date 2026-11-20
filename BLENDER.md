# Blender models

The site runs with no models at all. Every model slot has a version built in code. When a `.glb` file with a slot's exact name is in `src/assets/models/`, it replaces the code-built version automatically. Delete the file and the code-built version comes back. No code changes either way.

## Model slots

| File | What | Size and origin |
|---|---|---|
| `car.glb` | The car | Fits 1.8 × 1.0 × 2.8 m. Origin at the centre of that box. Wheel objects named `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`, each with its origin at the wheel centre |
| `zone-about.glb`, `zone-skills.glb`, `zone-projects.glb`, `zone-experience.glb`, `zone-contact.glb` | Chip buildings | Footprint up to 8 × 8 m, origin at the base centre |
| `crate.glb` | One stackable SMD chip | 1 × 1 × 1 m, origin at the centre |
| `decor.glb` | Extra board decoration | Placed at the world origin, visual only, no collisions |

Things to know:

- **Collisions never change.** Physics always uses the simple boxes from code. Models are visual only, so keep them inside the sizes above.
- **Car wheels.** The site spins the four `wheel_*` objects around their local X axis and steers the two front ones around Y. If a name is missing, that wheel simply does not move.
- **Chip LEDs.** If a zone model contains a mesh whose name starts with `led` (for example `led_dome`), the site lights that mesh during the power-on sequence. If there is no such mesh, the code-built amber LED is shown on top of the model.

## Blender rules

- Units: metres, scale 1. Apply all transforms before export (Ctrl+A, All Transforms).
- Orientation: model the car so its front faces Blender's front view (−Y). After glTF export (+Y up), the front points to +Z in three.js, which is the car's forward direction.
- Budget: car under 15k triangles, each zone under 30k.
- Materials: Principled BSDF only (base colour, roughness, metallic, emission). Prefer one small palette texture or plain colours from the palette below.
- Export: File → Export → glTF 2.0, format glTF Binary (.glb), "+Y Up" on, "Apply Modifiers" on.

Palette:

| Name | Hex |
|---|---|
| Solder mask | `#1E5B3A` |
| Deep mask | `#143D28` |
| Copper | `#C9874B` |
| Silkscreen | `#EEF0E8` |
| Chip | `#1A1C1E` |
| LED amber | `#FFB627` |
| Workbench | `#23272A` |

## From Blender to the site

1. Export the raw `.glb` into `models-src/` using the exact slot name, for example `models-src/car.glb`.
2. Run `npm run models`. It compresses everything in `models-src/` into `src/assets/models/` (meshopt geometry, WebP textures). The first run downloads the glTF Transform tool, so it needs an internet connection.
3. Run `npm run dev` and check the model in the browser. If the dev server was already running, refresh the page.
4. Run `npm run build` before deploying.

To go back to the code-built version, delete the file from `src/assets/models/`.

## Prompts for Claude in Blender

- "Create a low-poly toy car about 2.8 m long, 1.8 m wide, 1 m tall, in amber #FFB627 with dark grey wheels. Front facing −Y. Name the wheels wheel_fl, wheel_fr, wheel_rl, wheel_rr, with origins at each wheel centre. Under 15k triangles. Apply transforms."
- "Create a large IC chip building, 8 × 8 m footprint and 1.6 m tall, matte black #1A1C1E, with silver pins along all four sides and a small amber LED dome on top. Origin at the base centre."
- "Create a small SMD chip, 1 × 1 × 1 m, matte black with silver pins on two sides. Origin at the centre."
- "Export the selected object as glTF Binary to models-src/car.glb with +Y up and modifiers applied."
