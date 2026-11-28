import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Pages for search engines. The client preview (/accountscall/) and redirect pages are left out on purpose.
const pages = ['/'];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map((p) => `  <url><loc>${new URL(p, site.url).href}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
