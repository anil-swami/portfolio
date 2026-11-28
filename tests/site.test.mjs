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
