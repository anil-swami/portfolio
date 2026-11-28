# Publishing trybrix.site

GitHub Pages publishes the committed `dist/` folder every time `main` is pushed (`.github/workflows/pages.yml`).
The custom domain trybrix.site points at GitHub Pages.

1. `npm run build` (Astro writes the whole site into `dist/`, including `public/accountscall/` and the resume).
2. `npm test` and `npm run test:e2e`.
3. Commit, including `dist/`, and push `main`. The site updates in about a minute (repository → Actions).

The previous 3D site is in git history on `main` (and the older portfolio on `master`).
