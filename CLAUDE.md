# Project: Anil Swami portfolio (trybrix.site)

Design: docs/superpowers/specs/2026-11-28-portfolio-rebuild-design.md. Read it before starting a phase.

## Working rules
- Astro static site. No server, no API calls, no secrets. Built into `dist/`, which is committed (GitHub Pages publishes it from `main`).
- Never hardcode text in components. All words and links live in `src/data/site.ts`.
- Tech work only: no digital-marketing, design or video services.
- Brand: deep #16123f, indigo #4f46e5, coral #ff6b4a (buttons, deep text), mint #2dd4bf. Pattern: the Accounts Call design kit.
- Keep `public/accountscall/` (client preview) and `public/anil-swami-resume.pdf` untouched.
- Build one phase at a time and stop for Ani's OK. Run `npm test` (and `npm run test:e2e`) before reporting.
- Never push or merge to `main` without Ani's OK: pushing `main` publishes the live site.
