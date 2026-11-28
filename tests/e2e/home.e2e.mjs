// Browser checks in the installed Chrome. Run after `npm run build`: npm run test:e2e
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const PORT = 4341;
const SITE = `http://localhost:${PORT}/`;
let preview, browser;

before(async () => {
  preview = spawn(`npx astro preview --force --port ${PORT}`, { shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(SITE)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  browser = await chromium.launch({ channel: 'chrome' });
});

after(async () => {
  await browser?.close();
  preview?.kill();
  spawn('npx astro preview stop', { shell: true, stdio: 'ignore' });
});

test('particles run without blocking the hero buttons, and no page errors', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const btn = document.querySelector('.hero__ctas .btn');
    const b = btn.getBoundingClientRect();
    return {
      on: document.documentElement.classList.contains('particles-on'),
      pe: getComputedStyle(document.querySelector('[data-particles]')).pointerEvents,
      clickable: btn.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)),
    };
  });
  assert.equal(r.on, true);
  assert.equal(r.pe, 'none');
  assert.equal(r.clickable, true);
  assert.deepEqual(errors, []);
  await page.close();
});

test('reduced motion shows the static monogram instead of particles', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(SITE, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => ({
    on: document.documentElement.classList.contains('particles-on'),
    mono: getComputedStyle(document.querySelector('.mono')).display,
  }));
  assert.equal(r.on, false);
  assert.notEqual(r.mono, 'none');
  await page.close();
});

test('phone: menu fills the screen below the header, no sideways scroll', async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  await page.goto(SITE, { waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const nav = document.querySelector('#site-nav').getBoundingClientRect();
    const hb = document.querySelector('[data-header]').getBoundingClientRect().bottom;
    return { top: nav.top, height: nav.height, hb, expected: innerHeight - hb, onTop: document.querySelector('#site-nav').contains(document.elementFromPoint(innerWidth / 2, hb + 120)) };
  });
  assert.ok(r.top >= r.hb - 1);
  assert.ok(r.height >= r.expected - 2);
  assert.ok(r.onTop);
  await page.close();
});

test('phone: the AS stays formed while it is still in the lower half of the screen', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await page.goto(SITE, { waitUntil: 'networkidle' });
  // Scroll so the monogram box sits in the lower half of the screen.
  await page.evaluate(() => {
    const b = document.querySelector('[data-hero-visual]').getBoundingClientRect();
    scrollTo(0, Math.max(0, b.bottom - innerHeight * 0.55));
  });
  await page.waitForTimeout(3000);
  const share = await page.evaluate(() => {
    const c = document.querySelector('[data-particles]');
    const k = c.width / innerWidth;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const b = document.querySelector('[data-hero-visual]').getBoundingClientRect();
    let inside = 0, all = 0;
    for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) {
      if (d[(y * c.width + x) * 4 + 3] < 100) continue;
      all++;
      const px = x / k, py = y / k;
      if (px >= b.left - 20 && px <= b.right + 20 && py >= b.top - 20 && py <= b.bottom + 20) inside++;
    }
    return all ? inside / all : 0;
  });
  assert.ok(share > 0.7, `only ${Math.round(share * 100)}% of grains are in the monogram box`);
  await page.close();
});
