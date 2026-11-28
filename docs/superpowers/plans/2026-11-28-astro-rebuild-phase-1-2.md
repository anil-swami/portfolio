# trybrix.site rebuild, Phases 1–2 (Astro skeleton + home page) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3D React app on branch `rebuild/no-3d` with an Astro site whose home page sells Ani's website service (tech-only), with a grain-particle "AS" hero, and produce desktop + mobile screenshots for Ani's approval.

**Architecture:** Astro static site built into `dist/` (committed; GitHub Pages publishes it from `main` later). Components and scripts adapted from `C:\Ani\Ani_list\accountscall-website` (global.css tokens, Icon, motion.ts, particles.ts, Header/Footer patterns). All copy and links live in `src/data/site.ts`. Tests: `node:test` on built HTML + `playwright-core` browser tests using installed Chrome.

**Tech Stack:** Astro 7, TypeScript, plain CSS variables, lucide-static, Fontsource Poppins + Inter Variable, playwright-core (dev).

**Spec:** `docs/superpowers/specs/2026-11-28-portfolio-rebuild-design.md`

## Global Constraints
- Brand: deep `#16123f`, primary indigo `#4f46e5`, accent coral `#ff6b4a` (buttons: deep text on coral), secondary mint `#2dd4bf`.
- Name/logo: "Anil Swami" with an "AS" monogram. Tech work only: no Digital Marketing, Graphic Design or Video services, skills or projects.
- Email `anilswami5388@gmail.com` (lower case). WhatsApp number empty for now → no WhatsApp buttons or `wa.me` links rendered.
- Links: LinkedIn `https://www.linkedin.com/in/anil-swami-5044bb176/`, GitHub `https://github.com/anil-swami`, YouTube `https://www.youtube.com/@Technly-990/`.
- Case studies at launch: salsteel.co.in and mysaanchi.com, worded "built in-house for…". Accounts Call not shown.
- `public/accountscall/**` and `public/anil-swami-resume.pdf` are kept byte-for-byte and served at the same paths.
- No prices. All motion off under `prefers-reduced-motion`; content visible without JS.
- Do not push or merge to `main` (Phase 4, Ani's OK).

## Review Focus
- Phone widths 360–414px: no horizontal scroll, menu opens below the header and fills the screen → e2e at 375px (pattern from accountscall: frosted glass on `::before`, never on `.header`).
- Missing WhatsApp number must not produce dead buttons → unit test: no `wa.me` in HTML while `whatsapp` is empty.
- The client preview must survive the rebuild → unit test: `dist/accountscall/index.html` equals `public/accountscall/index.html`, and old 3D build files are gone from `dist/`.
- Reduced motion / no JS: hero shows a static monogram card instead of particles; all `.reveal` content visible → e2e with `reducedMotion: 'reduce'`.
- Tech-only promise → unit test: home HTML has no "Digital Marketing", "Graphic Design", "Canva".

---

### Task 1: Astro skeleton replaces the 3D app

**Files:**
- Delete: `src/` (React/3D), `models-src/`, `plugins/`, `scripts/compress-models.mjs`, `vite.config.ts`, `index.html`, `simple.html`, `content/portfolio.json`, `BLENDER.md`, `docs/SPEC.md`, `tsconfig.json`
- Create: `package.json` (scripts `dev`, `build`, `preview`, `test` = `astro build && node --test "tests/*.test.mjs"`, `test:e2e`, `shots`), `astro.config.mjs` (`site: 'https://trybrix.site'`, `trailingSlash: 'always'`), `tsconfig.json`, `src/data/site.ts`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{Icon,Logo,Header,Footer,WhatsAppButton,Seo}.astro`, `src/pages/index.astro`, `public/favicon.svg` (AS monogram)
- Modify: `CLAUDE.md` (new rules: Astro, content only in `src/data/site.ts`, static, phases), `README.md`, `DEPLOY.md` (build = `npm run build`, still commit `dist/`)
- Test: `tests/site.test.mjs`

**Interfaces:**
- Produces `site` in `src/data/site.ts`: `{ name, title, url, location, email, whatsapp: { number: string, message: string }, links: { linkedin, github, youtube }, resume: '/anil-swami-resume.pdf', nav: {label, href}[], hero, stats, work, more, services, steps, why, ai, about, faqs }` and `whatsappLink(msg?) => string | null` (null when number empty).
- Produces `BaseLayout` props `{ title: string; description: string }`.

- [ ] Step 1: Remove the 3D files, install `astro lucide-static @fontsource/poppins @fontsource-variable/inter` and dev `playwright-core`.
- [ ] Step 2: Write `tests/site.test.mjs`: `dist/index.html` has `<title>` containing "Anil Swami", a meta description ≥ 50 chars, exactly one `<h1>`, `href="mailto:anilswami5388@gmail.com"`, no `wa.me`, `<html lang="en-IN">`, header `menu-toggle` with `aria-expanded="false"`; `dist/accountscall/index.html` equals `public/accountscall/index.html`; `dist/anil-swami-resume.pdf` exists; `dist/assets/` (old Vite output) does not exist.
- [ ] Step 3: Run `npm test` → FAIL.
- [ ] Step 4: Implement the skeleton (tokens = Global Constraints colours; header frosted glass on `::before`; menu top from header bottom). Run `npm test` → PASS.
- [ ] Step 5: Commit `feat: replace the 3D app with an Astro skeleton`.

### Task 2: Home page sections (tech-only, client-focused)

**Files:**
- Create: `src/components/home/{Hero,TrustStrip,Work,Services,Process,Why,AiCorner,About,Faq,ContactBand}.astro`
- Modify: `src/pages/index.astro`, `src/data/site.ts` (copy)
- Test: `tests/site.test.mjs`

**Interfaces:** Consumes `site` (Task 1). Section ids: `work`, `services`, `process`, `why`, `ai`, `about`, `faq`, `contact`.

- [ ] Step 1: Add tests: each section id present; exactly 2 `case-card` elements linking `/work/salsteel/` and `/work/mysaanchi/` plus `https://salsteel.co.in` and `https://mysaanchi.com`; 4 `service-card`; 4 `step`; 5 `<details>`; `https://www.youtube.com/@Technly-990/` present; `/anil-swami-resume.pdf` linked; no "Digital Marketing", "Graphic Design", "Canva", "accountscall" (case-insensitive) in home HTML; 4 `data-count` counters.
- [ ] Step 2: Run → FAIL. Step 3: Build the sections from the spec §5.3 (copy written from Ani's notes; counters 5 years, 2 live business sites, 24 AI videos, 58 articles published; Ani confirms at review). Run → PASS.
- [ ] Step 4: Commit `feat: home page sections`.

### Task 3: Particle "AS" hero, motion and SEO head

**Files:**
- Create: `src/scripts/particles.ts` (from accountscall; one shape: the "AS" monogram drawn with Poppins 700 on the sampling canvas; colours coral, light coral, mint, white, indigo-light), `src/scripts/motion.ts` (copy)
- Modify: `Hero.astro` (fixed canvas `data-particles`, static monogram card fallback), `BaseLayout.astro`, `Seo.astro` (canonical, Open Graph, JSON-LD `Person` + `ProfessionalService`), `global.css` (content above canvas: `main > section > .wrap, .footer > .wrap { z-index: 2 }`)
- Test: `tests/site.test.mjs`, `tests/e2e/home.e2e.mjs`

- [ ] Step 1: Unit tests: JSON-LD has `@type` `Person` with `sameAs` containing the 3 links and `ProfessionalService`; canonical `https://trybrix.site/`. E2E tests: `particles-on` set, canvas `pointer-events: none`, hero "Get a quote" button is the element under its own centre, no page errors; reduced motion → no `particles-on` and the static monogram card visible; at 375px the open menu fills the screen below the header and no horizontal scroll.
- [ ] Step 2: Run → FAIL. Step 3: Implement. Run `npm test` and `npm run test:e2e` → PASS.
- [ ] Step 4: Commit `feat: particle AS hero, motion and SEO`.

### Task 4: Screenshots for Ani

**Files:** Create `scripts/screenshot.mjs` (from accountscall), output `docs/screenshots/home-desktop.png`, `home-mobile.png`

- [ ] Step 1: `npm run shots`; review every slice (no overflow, nothing hidden, particles visible); fix and reshoot as needed.
- [ ] Step 2: Commit `docs: home page screenshots for review`.
