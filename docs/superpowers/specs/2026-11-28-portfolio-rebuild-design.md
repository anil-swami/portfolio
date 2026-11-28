# trybrix.site rebuild (no 3D): design

Date: 28 Nov 2026 · Status: answers added, awaiting approval · Owner: Anil Swami (Ani) · Branch: `rebuild/no-3d` in `C:\Ani\portfolio`

## 1. Intent and why

Replace the 3D driving-game portfolio with a fast, attractive, normal website under Ani's own name. It is about his
**tech work only** (web development, AI-assisted building, data tools); digital marketing, graphic design and video
are left out.

Who it's for, in Ani's order:
1. **Businesses that want a website** (main). They should leave convinced he can build them a good site and
   **send an enquiry** (WhatsApp, email, quote form).
2. **People who follow his AI content** (Technly YouTube). They should see what he builds with AI and **follow /
   watch** the channel.

It is also the shop window for his website service: the Accounts Call job is his first paying client, and the
dashboard ranks "Websites for local businesses" as the fastest money.

## 2. Goals, non-goals, anti-goals

**Goals**
- The first screen tells a business owner what he does for them and how to contact him, in under 5 seconds.
- Real, checkable proof: live sites with links and screenshots, and what he did on each.
- Same look and feel as the Accounts Call site (Ani loved it), in his brand colours.
- Ranks for local searches (e.g. "website developer Gurugram"): real HTML pages, good titles, structured data.
- Easy for Ani to update: all text and project data in one content file.

**Non-goals**
- No 3D, WebGL scene or game controls.
- No digital-marketing, design or video services or skills.
- No prices on the site (quote on request).
- No blog or CMS in this version (can come later).
- No client logins, payments or bookings.

**Anti-goals (a failure even if it works)**
- Looking like a generic template or a job-seeker CV instead of a service.
- Slow on a phone, or animations that get in the way of reading.
- Broken or "coming soon" links on the live site.
- Breaking the client preview at `trybrix.site/accountscall/` (it must keep working, untouched).
- Publishing anything private: internal company tools, staff data, salaries, or a personal phone number Ani hasn't chosen to show.

## 3. Constraints

- **Hosting:** GitHub Pages from the `main` branch's committed `dist/` folder (`.github/workflows/pages.yml`), custom
  domain trybrix.site. Fully static. Nothing goes live until `rebuild/no-3d` is merged into `main` and pushed (Ani's OK).
- **Keep:** `public/accountscall/` (client preview) and `public/anil-swami-resume.pdf`, served at the same paths.
- **Brand:** Indigo & Coral: deep `#16123f`, primary indigo `#4f46e5`, accent coral `#ff6b4a` (buttons: deep text on
  coral), secondary mint `#2dd4bf`; tints as in the dashboard's "Ani brand" design kit.
- **Pattern:** the Accounts Call design kit (Poppins + Inter, pill buttons, tinted lifting cards, eyebrow labels,
  gradient words, scroll reveal, counters, floating WhatsApp, optional grain particles).
- **Ani's time:** 3–5 hrs/week; built in phases with his OK between them.
- **Content:** written by Claude from Ani's existing notes (`content/portfolio.json`, "Portfolio Website Content.md",
  the Idea HQ dashboard). Ani reviews before it goes live.

## 4. Approaches considered

| | Approach | Trade-off | Decision |
|---|---|---|---|
| 1 | **Astro, reusing the Accounts Call components** | Real HTML per page (best for local SEO), reuses tested parts (hero, particles, reveal, cards, WhatsApp), same framework Ani is learning. Removes the 3D/React code on this branch. | **Chosen by Ani** |
| 2 | Keep Vite + React, restyle | Smaller repo change, but pages render in the browser (weak SEO for a client-winning site), and the Accounts Call parts would be rewritten in React. | Not chosen |
| 3 | Plain HTML/CSS/JS | No build step, but no components: every case study is hand-copied; loses the parts already built. | Not chosen |

## 5. What's decided

### 5.1 Brand and voice
- Site name and logo: **Anil Swami**. Logo: an "AS" monogram (coral gradient tile, like the dashboard's "A") + the name.
- Voice: plain, confident, client-focused ("you get…"), short sentences, Indian-English spelling.
- Location line: based in Gurugram, India; works with clients anywhere, remotely.

### 5.2 Pages
```
/                      Home (everything below)
/work/<slug>/          One case-study page per featured project (2 at launch: salsteel, mysaanchi)
/simple                Old address: a small page that sends visitors to / (GitHub Pages ignores .htaccess)
/accountscall/...      Client preview (static files, untouched)
/anil-swami-resume.pdf Kept, linked quietly from About
/404
```

### 5.3 Home page, top to bottom
1. **Header:** logo, links (Work · Services · AI corner · About · Contact), WhatsApp button. Sticky, frosted (on a
   `::before` layer, see the Accounts Call lesson), phone menu.
2. **Hero:** deep indigo background with coral/mint glows. Headline about the outcome for a business
   (e.g. "Fast, good-looking websites that bring you customers"), one line on who he is, buttons
   "Get a quote" (coral) and "See my work". On the right: **grain particles forming the "AS" monogram**, reacting to
   the pointer, scattering into dust on scroll (the Accounts Call animated option). No slider: one clear message.
3. **Trust strip:** factual counters (e.g. live sites built, years building for the web, typical days to launch).
   Numbers confirmed by Ani.
4. **Selected work:** 2 case-study cards with screenshots: **salsteel.co.in** (Node.js company website) and
   **mysaanchi.com** (CSR site moved off a hacked host, 58 articles), both worded as "built in-house for…".
   Each links to its case-study page and the live site. Below them, small "More I've built" cards for personal
   projects with public links (e.g. the open-source Desktop Pet on GitHub). Accounts Call is **left off** until its
   new site is live and the client agrees.
5. **Services:** 4 tinted cards: New business website · Website redesign · SEO & Google setup (Search Console, GA4,
   Business Profile) · Care plan (updates, backups, monthly report). "Get a quote" on each.
6. **How it works:** 4 steps: Free call → Plan & quote → Build & review → Launch & support.
7. **Why work with me:** fast pages, built to rank, you can edit your blog, secure hosting set-up, AI-assisted so
   delivery is quicker.
8. **AI corner:** Technly (AI explained simply, https://www.youtube.com/@Technly-990/) with a subscribe button and
   3–4 latest Shorts (static thumbnails + links), plus "Things I've built with AI": this portfolio's particle hero
   (live on the page), the Idea HQ dashboard, the hand-drawn explainer video pipeline, VoiceStudio, as **text cards
   without screenshots** (those tools hold company and personal data). *(Claude's call.)*
9. **About:** short, tech-only story (electrical engineer → web developer; turns repeated tasks into tools; builds
   with AI and checks every line). Tech stack chips (front end, back end, databases, tools, AI). Resume link.
10. **FAQ:** 5 questions a business asks (cost, timeline, what I need to provide, can I edit it myself, hosting/domain).
11. **Contact band + footer:** WhatsApp, email, quote form, LinkedIn, GitHub, YouTube. Floating WhatsApp button.

### 5.4 Case-study page (`/work/<slug>/`)
Hero with the site name and a screenshot · the client's problem · what I did (bullets) · tech used (chips) ·
result (facts) · link to the live site · "Want one like this?" contact band.

### 5.5 Content
- All text, projects, services, FAQs and links in **one data file** (`src/data/site.ts` or `content/site.json`), so
  Ani edits text without touching components.
- Screenshots of the live sites taken with the same Playwright script used for Accounts Call.

### 5.6 SEO
- Unique titles and descriptions; canonical `https://trybrix.site/...`; Open Graph image.
- JSON-LD: `Person` (Anil Swami, sameAs LinkedIn/GitHub/YouTube) and `ProfessionalService` (web design and
  development, area served India, based in Gurugram).
- `sitemap.xml`, `robots.txt` (excludes `/accountscall/`).

### 5.7 Contact
- **Email: anilswami5388@gmail.com** (Ani's Gmail for now) for the email link and the quote form (Web3Forms, free,
  no server; Ani creates its access key for that inbox).
- **WhatsApp: number not decided yet.** The site reads it from the content file; while it is empty, every WhatsApp
  button is hidden and "Get a quote" / email are the main actions. No placeholder links. *(Claude's call.)*
- LinkedIn https://www.linkedin.com/in/anil-swami-5044bb176/, GitHub https://github.com/anil-swami,
  YouTube https://www.youtube.com/@Technly-990/.

### 5.8 Answers from Ani (28 Nov 2026)
- Email: his Gmail for now. WhatsApp number: open (to-do; buttons hidden until set).
- salsteel.co.in and mysaanchi.com: yes, show publicly (as in-house work).
- Accounts Call: leave off for now.
- Technly: https://www.youtube.com/@Technly-990/

## 6. Phases (Ani's OK between each)
| Phase | What | Ends with |
|---|---|---|
| 1 | Replace the 3D app with an Astro skeleton on this branch; keep `/accountscall` and the resume working; header, footer, brand tokens | Builds and serves; `/accountscall/` still works |
| 2 | Home page, all sections, particles "AS" hero; screenshots for Ani | Ani approves the look |
| 3 | Case-study pages, SEO, contact form, 404 | All links work; tests pass |
| 4 | Merge to `main`, build, push (Ani's OK), check live | trybrix.site live with the new site |

## 7. Left to the builder
Component structure, how much Accounts Call code is copied vs adapted, file layout, animation timings, the exact
monogram drawing, test details, and Lighthouse tuning.

## 9. Changes from Ani (28 Nov 2026, after the Phase 2 review)
- **No case-study pages.** Work cards link straight to the live sites. (Phase 3 drops the `/work/` pages.)
- **"Let's play" menu link** to the 3D portfolio at `https://3d.trybrix.site/`. The 3D site stays as it is in its own
  repository; this site needs its own repository to serve trybrix.site (GitHub Pages: one custom domain per repository).
- **Tech-only CV** at `/anil-swami-cv.pdf`, generated from `scripts/cv.html` (`npm run cv`), no phone number.
  The old marketing resume stays served at its old address but is not linked.
