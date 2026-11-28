import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const file = (p) => new URL(`../${p}`, import.meta.url);
const html = readFileSync(file('dist/index.html'), 'utf8');
const count = (re) => (html.match(re) || []).length;
// Counts elements carrying this exact class token (not BEM children like name__icon).
const countClass = (name) => count(new RegExp(`class="(?:[^"]*\\s)?${name}(?:\\s[^"]*)?"`, 'g'));

// ---------- Task 1: skeleton ----------
test('page basics: title, description, one h1, language', () => {
  assert.match(html, /<title>[^<]*Anil Swami[^<]*<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{50,}"/);
  assert.equal(count(/<h1[\s>]/g), 1);
  assert.match(html, /<html lang="en-IN"/);
});

test('email link uses the lower-case Gmail address', () => {
  assert.ok(html.includes('href="mailto:anilswami5388@gmail.com"'));
});

test('no WhatsApp links while no number is set', () => {
  assert.ok(!html.includes('wa.me'));
});

test('phone menu button exposes aria-expanded', () => {
  assert.match(html, /<button[^>]*class="[^"]*menu-toggle[^"]*"[^>]*aria-expanded="false"/);
});

test('client preview and resume survive the rebuild', () => {
  assert.equal(readFileSync(file('dist/accountscall/index.html'), 'utf8'), readFileSync(file('public/accountscall/index.html'), 'utf8'));
  assert.ok(existsSync(file('dist/accountscall/classic/index.html')));
  assert.ok(existsSync(file('dist/accountscall/animated/index.html')));
  assert.ok(existsSync(file('dist/anil-swami-resume.pdf')));
});

test('old 3D build output is gone', () => {
  assert.ok(!existsSync(file('dist/assets')), 'dist/assets from the Vite build should not exist');
  assert.ok(!existsSync(file('dist/simple.html')));
});

// ---------- Task 2: home sections ----------
test('home has every section', () => {
  for (const id of ['work', 'services', 'process', 'why', 'ai', 'about', 'faq', 'contact']) assert.match(html, new RegExp(`<section[^>]*id="${id}"`), id);
});

test('selected work: two case studies with live links', () => {
  assert.equal(countClass('case-card'), 2);
  for (const s of ['/work/salsteel/', '/work/mysaanchi/', 'https://salsteel.co.in', 'https://mysaanchi.com']) assert.ok(html.includes(`href="${s}"`), s);
});

test('4 services, 4 steps, 5 FAQs, 4 counters', () => {
  assert.equal(countClass('service-card'), 4);
  assert.equal(countClass('step'), 4);
  assert.equal(count(/<details[\s>]/g), 5);
  assert.equal(count(/data-count="\d+"/g), 4);
});

test('AI corner links the Technly channel', () => {
  assert.ok(html.includes('href="https://www.youtube.com/@Technly-990/"'));
});

// The current resume PDF is a marketing CV with a personal phone number: not linked until a tech-only CV exists.
// The file itself stays served at /anil-swami-resume.pdf so old links keep working.
test('resume PDF is not linked from the home page', () => {
  assert.ok(!html.includes('anil-swami-resume.pdf'));
});

test('tech work only, and no Accounts Call', () => {
  for (const w of [/digital marketing/i, /graphic design/i, /\bcanva\b/i, /accountscall/i, /accounts call/i]) assert.ok(!w.test(html), String(w));
});

// ---------- Task 3: SEO ----------
test('structured data: Person with profiles, and the web service', () => {
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])['@graph'] || JSON.parse(m[1])));
  const person = ld.find((d) => d['@type'] === 'Person');
  assert.ok(person, 'Person');
  for (const u of ['https://www.linkedin.com/in/anil-swami-5044bb176/', 'https://github.com/anil-swami', 'https://www.youtube.com/@Technly-990/']) assert.ok(person.sameAs.includes(u), u);
  assert.ok(ld.find((d) => d['@type'] === 'ProfessionalService'), 'ProfessionalService');
});

test('canonical points at trybrix.site', () => {
  assert.ok(html.includes('<link rel="canonical" href="https://trybrix.site/">'));
});

// Every heading and intro comes from src/data/site.ts (CLAUDE.md rule: no text in components).
import { site } from "../src/data/site.ts";
test("section headings and intros come from the content file", () => {
  assert.ok(site.sections, "site.sections exists");
  for (const [key, sec] of Object.entries(site.sections)) {
    for (const field of ["eyebrow", "title", "highlight"]) {
      const v = sec[field];
      // Astro writes apostrophes as &#39; in HTML.
      if (v) assert.ok(html.includes(v) || html.includes(v.replaceAll("'", "&#39;")), key + "." + field + ": " + v);
    }
  }
});
