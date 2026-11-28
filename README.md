# trybrix.site: Anil Swami

Business-website portfolio built with Astro. Design: `docs/superpowers/specs/2026-11-28-portfolio-rebuild-design.md`.

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # build + page checks
npm run test:e2e   # browser checks in your installed Chrome (build first)
npm run shots      # desktop + phone screenshots into docs/screenshots/
```

- Change any text or link: `src/data/site.ts`.
- Add your WhatsApp number: set `whatsapp.number` in `src/data/site.ts` (digits with country code, e.g. 919812345678). Every WhatsApp button appears automatically.
- Colours and fonts: `src/styles/global.css` (tokens at the top).
- Client previews live in `public/accountscall/` and are copied to the site unchanged.

Publishing: see DEPLOY.md.
