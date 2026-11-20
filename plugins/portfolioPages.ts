import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import { renderSimpleView, escapeHtml, type Portfolio } from './renderSimpleView.ts'

/**
 * Fills index.html and simple.html from content/portfolio.json at build time:
 * - {{title}}, {{description}}, {{siteUrl}}, {{name}}, {{jsonLd}} tokens in both pages
 * - <!--portfolio:content--> in simple.html becomes the full portfolio as real HTML
 * It also writes robots.txt and sitemap.xml, and serves /simple in dev and preview.
 */
export function portfolioPages(): Plugin {
  const root = process.cwd()
  const contentPath = path.resolve(root, 'content/portfolio.json')
  const sitePath = path.resolve(root, 'site.config.json')

  const readContent = (): Portfolio => JSON.parse(fs.readFileSync(contentPath, 'utf8'))
  const readSiteUrl = (): string =>
    String(JSON.parse(fs.readFileSync(sitePath, 'utf8')).siteUrl).replace(/\/+$/, '')

  const simpleRewrite: Connect.NextHandleFunction = (req, _res, next) => {
    if (req.url === '/simple' || req.url?.startsWith('/simple?')) {
      req.url = req.url.replace('/simple', '/simple.html')
    }
    next()
  }

  return {
    name: 'portfolio-pages',

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const data = readContent()
        const siteUrl = readSiteUrl()
        const links = [data.contact.linkedin, data.contact.github].filter(Boolean)
        const jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.start.name,
          jobTitle: data.start.roles.join(', '),
          description: data.start.intro,
          url: `${siteUrl}/`,
          email: `mailto:${data.contact.email}`,
          ...(links.length ? { sameAs: links } : {}),
        }).replace(/</g, '\\u003c')

        return html
          .replaceAll('{{title}}', escapeHtml(data.meta.title))
          .replaceAll('{{description}}', escapeHtml(data.meta.description))
          .replaceAll('{{name}}', escapeHtml(data.start.name))
          .replaceAll('{{siteUrl}}', escapeHtml(siteUrl))
          .replaceAll('{{jsonLd}}', jsonLd)
          .replace('<!--portfolio:content-->', () => renderSimpleView(data))
      },
    },

    configureServer(server) {
      server.middlewares.use(simpleRewrite)
      server.watcher.add([contentPath, sitePath])
      server.watcher.on('change', (file) => {
        if (path.resolve(file) === contentPath || path.resolve(file) === sitePath) {
          server.hot.send({ type: 'full-reload' })
        }
      })
    },

    configurePreviewServer(server) {
      server.middlewares.use(simpleRewrite)
    },

    generateBundle() {
      const siteUrl = readSiteUrl()
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n` +
          `  <url><loc>${siteUrl}/simple</loc><lastmod>${today}</lastmod></url>\n` +
          `</urlset>\n`,
      })
    },
  }
}
