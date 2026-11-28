// Full-page screenshots of the home page for client approval.
// Uses the installed Google Chrome (no browser download). Run: npm run shots
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const PORT = 4342;
const SITE = `http://localhost:${PORT}/`;
const OUT = new URL('../docs/screenshots/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const REVIEW = process.argv.includes('--review');
if (REVIEW) mkdirSync(new URL('review/', OUT), { recursive: true });

const preview = spawn(`npx astro preview --force --port ${PORT}`, { shell: true, stdio: 'ignore' });

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { if ((await fetch(SITE)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
}

const sizes = [
  { name: 'home-desktop', width: 1440, height: 900 },
  // Full mobile page at 1x: very tall pages break Chrome's capture at 2x.
  { name: 'home-mobile', width: 390, height: 844, mobile: true, scale: 1 },
];

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const s of sizes) {
    const page = await browser.newPage({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: s.scale ?? 1,
      isMobile: !!s.mobile,
      hasTouch: !!s.mobile,
    });
    await page.goto(SITE, { waitUntil: 'networkidle' });
    // Scroll through the page so every reveal animation and counter runs, then return to the top.
    await page.evaluate(async () => {
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y <= max; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 1000));
      window.scrollTo(0, 0);
    });
    // Show the first hero slide (autoplay may have moved on while scrolling).
    await page.evaluate(() => document.querySelector('[data-hero]')?.swiper?.slideToLoop?.(0, 0));
    await page.waitForTimeout(2000);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`${s.name}: page is ${overflow}px wider than the screen`);
    const shot = (file, opts) => page.screenshot({ path: fileURLToPath(new URL(file, OUT)), ...opts });
    await shot(`${s.name}.png`, { fullPage: true });
    console.log(`saved docs/screenshots/${s.name}.png`);
    if (REVIEW) {
      // Viewport-sized slices for close review (not for the client).
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0, i = 1; y < h; y += s.height * 2, i++) {
        await shot(`review/${s.name}-${String(i).padStart(2, '0')}.png`, { clip: { x: 0, y, width: s.width, height: Math.min(s.height * 2, h - y) }, fullPage: true });
      }
    }
    await page.close();
  }
  await browser.close();
} finally {
  preview.kill();
  // The preview server outlives its shell on Windows; ask Astro to stop it.
  // Wait for the stop to finish: a stop still running later can kill the next run's fresh server.
  await new Promise((r) => spawn('npx astro preview stop', { shell: true, stdio: 'ignore' }).on('exit', r));
}
