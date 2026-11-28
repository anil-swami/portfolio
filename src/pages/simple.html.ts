import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Old 3D-site address (trybrix.site/simple.html): same redirect as /simple/, served as a plain file.
export const GET: APIRoute = () =>
  new Response(
    `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="utf-8" />
    <title>${site.name}</title>
    <meta http-equiv="refresh" content="0; url=/" />
    <meta name="robots" content="noindex,follow" />
    <link rel="canonical" href="${site.url}/">
    <script>location.replace('/');</script>
  </head>
  <body>
    <p>This page has moved. <a href="/">Go to the home page</a>.</p>
  </body>
</html>
`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
