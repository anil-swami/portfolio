// Prints scripts/cv.html to public/anil-swami-cv.pdf (A4) with the installed Chrome. Run: npm run cv
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const html = new URL('./cv.html', import.meta.url).href;
const out = fileURLToPath(new URL('../public/anil-swami-cv.pdf', import.meta.url));
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const fits = await page.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight <= p.clientHeight + 1; });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await page.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/review/cv.png', import.meta.url)), fullPage: true });
await browser.close();
console.log(`saved public/anil-swami-cv.pdf (${fits ? "fits on one A4 page" : "CONTENT IS CUT OFF: shorten the text"})`);
if (!fits) process.exitCode = 1;
