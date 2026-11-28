# Publishing

Two GitHub repositories, one domain each (GitHub Pages allows one custom domain per repository):

| Address | Repository | What |
|---|---|---|
| https://trybrix.site | `anil-swami/trybrix-site` (`main`) | This Astro site, plus the client preview at `/accountscall/` |
| https://3d.trybrix.site | `anil-swami/portfolio` (`main`) | The 3D portfolio, kept as it is |

DNS (Hostinger): the trybrix.site apex records point to GitHub Pages; `3d` is a CNAME to `anil-swami.github.io`.

## Publish this site
This folder (`C:\Ani\portfolio`, branch `rebuild/no-3d`) has a second remote called `site` for the new repository.

1. `npm test` and `npm run test:e2e` (the build writes `dist/`).
2. Commit, including `dist/`.
3. `git push site rebuild/no-3d:main` publishes trybrix.site (about a minute; see the trybrix-site repo's Actions tab).
   `git push origin rebuild/no-3d` keeps a backup of the branch in the old repository.

Pushing `main` of `origin` publishes the **3D** site, not this one.
