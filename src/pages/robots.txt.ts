import type { APIRoute } from 'astro';
import { site } from '../data/site';

// The client preview stays out of search results (its pages are also noindex).
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /accountscall/\n\nSitemap: ${site.url}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
