import type portfolio from '../content/portfolio.json'
import { strings } from '../src/ui/strings.ts'

export type Portfolio = typeof portfolio

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const e = escapeHtml

/** Renders the whole portfolio as plain, script-free HTML for simple.html. */
export function renderSimpleView(d: Portfolio): string {
  const tags = (items: string[]) =>
    `<ul class="tags">${items.map((t) => `<li>${e(t)}</li>`).join('')}</ul>`

  const contactLinks = [
    `<li><span>${e(strings.email)}</span> <a href="mailto:${e(d.contact.email)}">${e(d.contact.email)}</a></li>`,
    d.contact.linkedin &&
      `<li><span>${e(strings.linkedin)}</span> <a href="${e(d.contact.linkedin)}" rel="me noopener">${e(d.contact.linkedin)}</a></li>`,
    d.contact.github &&
      `<li><span>${e(strings.github)}</span> <a href="${e(d.contact.github)}" rel="me noopener">${e(d.contact.github)}</a></li>`,
    d.contact.resumePdf &&
      `<li><span>${e(strings.resume)}</span> <a href="${e(d.contact.resumePdf)}">${e(strings.downloadResume)}</a></li>`,
  ].filter(Boolean)

  return `
    <header class="hero">
      <h1>${e(d.start.name)}</h1>
      <p class="roles">${d.start.roles.map(e).join(', ')}</p>
      <p class="intro">${e(d.start.intro)}</p>
      <p><a class="button" href="./">${e(strings.open3d)}</a></p>
    </header>
    <main>
      <section aria-labelledby="about">
        <h2 id="about">${e(d.about.title)}</h2>
        ${d.about.paragraphs.map((p) => `<p>${e(p)}</p>`).join('\n        ')}
      </section>

      <section aria-labelledby="skills">
        <h2 id="skills">${e(d.skills.title)}</h2>
        <dl class="pairs">
          ${d.skills.zones.map((z) => `<div><dt>${e(z.name)}</dt><dd>${e(z.line)}</dd></div>`).join('\n          ')}
        </dl>
        <h3>${e(strings.stack)}</h3>
        <dl class="stack">
          ${d.skills.stack.map((g) => `<div><dt>${e(g.group)}</dt><dd>${tags(g.items)}</dd></div>`).join('\n          ')}
        </dl>
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects">${e(d.projects.title)}</h2>
        ${d.projects.items
          .map((p) => `<article><h3>${e(p.name)}</h3><p>${e(p.line)}</p>${tags(p.tags)}</article>`)
          .join('\n        ')}
      </section>

      <section aria-labelledby="experience">
        <h2 id="experience">${e(d.experience.title)}</h2>
        ${d.experience.roles
          .map(
            (r) =>
              `<article><h3>${e(r.title)}</h3><p class="meta">${e(r.where)}, ${e(r.period)}</p><p>${e(r.line)}</p></article>`,
          )
          .join('\n        ')}
        <h3>${e(strings.education)}</h3>
        <ul class="education">
          ${d.experience.education.map((ed) => `<li>${e(ed.name)} <span>${e(ed.year)}</span></li>`).join('\n          ')}
        </ul>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">${e(d.contact.title)}</h2>
        <p>${e(d.contact.line)}</p>
        <ul class="contact">
          ${contactLinks.join('\n          ')}
        </ul>
      </section>
    </main>
    <footer>
      <p>${e(d.world.credits)}</p>
      <p><a href="./">${e(strings.open3d)}</a></p>
    </footer>`
}
