# Blender models

The site runs with no models at all. Every model slot has a version built in code. When a `.glb` file with a slot's exact name is in `src/assets/models/`, it replaces the code-built version automatically. Delete the file and the code-built version comes back. No code changes either way.

## Model slots

| File | What | Size and origin |
|---|---|---|
| `car.glb` | The car | Fits 1.8 × 1.0 × 2.8 m. Origin at the centre of that box. Wheel objects named `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`, each with its origin at the wheel centre |
| `zone-about.glb`, `zone-skills.glb`, `zone-projects.glb`, `zone-experience.glb`, `zone-contact.glb` | Forest cabins, one per zone | Footprint up to 8 × 8 m, up to 6 m tall, origin at the base centre, door facing Blender's front view (−Y) |
| `crate.glb` | One stackable wooden crate | 1 × 1 × 1 m, origin at the centre |
| `decor.glb` | Extra world decoration | Placed at the world origin, visual only, no collisions |

Things to know:

- **Collisions never change.** Physics always uses the simple boxes from code. Models are visual only, so keep them inside the sizes above.
- **Car wheels.** The site spins the four `wheel_*` objects around their local X axis and steers the two front ones around Y. If a name is missing, that wheel simply does not move.
- **Cabin lights.** If a zone model contains a mesh whose name starts with `led` (for example `led_lantern`), the site lights that mesh during the power-on sequence. If there is no such mesh, the code-built lantern stands beside the door.
- **Cabins turn to face their road.** Each cabin is rotated so its door faces the arriving road, so model the door on the front (−Y) side.
- **Trees, plants, rocks, water and animals** are always built in code; they have no model slots.

## Blender rules

- Units: metres, scale 1. Apply all transforms before export (Ctrl+A, All Transforms).
- Orientation: model the car so its front faces Blender's front view (−Y). After glTF export (+Y up), the front points to +Z in three.js, which is the car's forward direction.
- Budget: car under 15k triangles, each zone under 30k.
- Materials: Principled BSDF only (base colour, roughness, metallic, emission). Prefer one small palette texture or plain colours from the palette below.
- Export: File → Export → glTF 2.0, format glTF Binary (.glb), "+Y Up" on, "Apply Modifiers" on.

Palette:

| Name | Hex |
|---|---|
| Grass | `#5E9440` |
| Wood | `#8A5A34` |
| Wood dark | `#5C3A22` |
| Wood light | `#B9844F` |
| Log | `#7A4E2D` |
| Roof | `#6E3B2C` |
| Stone | `#8E918A` |
| Window glow | `#FFC861` |
| Lantern amber | `#FFB627` |

## From Blender to the site

1. Export the raw `.glb` into `models-src/` using the exact slot name, for example `models-src/car.glb`.
2. Run `npm run models`. It compresses everything in `models-src/` into `src/assets/models/` (meshopt geometry, WebP textures). The first run downloads the glTF Transform tool, so it needs an internet connection.
3. Run `npm run dev` and check the model in the browser. If the dev server was already running, refresh the page.
4. Run `npm run build` before deploying.

To go back to the code-built version, delete the file from `src/assets/models/`.

## Prompts for Claude in Blender

- "Create a low-poly toy car about 2.8 m long, 1.8 m wide, 1 m tall, in amber #FFB627 with dark grey wheels. Front facing −Y. Name the wheels wheel_fl, wheel_fr, wheel_rl, wheel_rr, with origins at each wheel centre. Under 15k triangles. Apply transforms."
- "Create a low-poly log cabin with an 8 × 8 m footprint and a gable roof, about 6 m tall: log walls #7A4E2D, roof #6E3B2C, stone foundation #8E918A, a door and two windows on the front (−Y) side, and a lantern by the door named led_lantern. Origin at the base centre. Under 30k triangles."
- "Create a wooden crate, 1 × 1 × 1 m, light planks #B9844F with a dark frame #5C3A22 and a diagonal brace. Origin at the centre."
- "Export the selected object as glTF Binary to models-src/car.glb with +Y up and modifiers applied."
