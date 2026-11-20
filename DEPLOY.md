# Deploying to GoDaddy cPanel

The site is fully static. There is no Node app to run on the server: you build on your own computer and upload the `dist/` folder.

## Before the first deploy

1. Open `site.config.json` and replace `https://example.com` with your real address, for example `https://anilswami.com` (no slash at the end). This address goes into `sitemap.xml`, `robots.txt` and the link-preview tags.
2. Open `.cpanel.yml` and replace `CPANEL_USERNAME` with your cPanel username. Only needed for option 1 below.
3. Run `npm run build`. Everything the site needs is now in `dist/`, including `.htaccess`, `robots.txt` and `sitemap.xml`.

## Option 1: Git (recommended once set up)

One-time setup:

1. Create an empty repository on GitHub and push this project to it. `dist/` is committed on purpose, because the site is built locally.
2. In cPanel, open **Git Version Control** and click **Create**.
3. Turn on **Clone a Repository**, paste the GitHub clone URL, and choose a repository path outside the web root, for example `/home/CPANEL_USERNAME/repositories/portfolio`. For a private repository, add an SSH key to cPanel and GitHub first (cPanel → **SSH Access**).

Every time you want to publish:

1. `npm run build`
2. Commit and push, including the `dist/` folder.
3. In cPanel → **Git Version Control** → **Manage** → **Pull or Deploy** tab, click **Update from Remote**, then **Deploy HEAD Commit**.

cPanel then runs `.cpanel.yml`, which copies the contents of `dist/` into the document root.

## Option 2: Manual upload

1. `npm run build`
2. Zip the **contents** of `dist/` (open the folder, select everything inside, then zip), not the folder itself. Make sure hidden files are included: `.htaccess` must be in the zip.
3. In cPanel, open **File Manager** and go to the document root (`public_html` for the main domain).
4. Click **Settings** (top right) and turn on **Show Hidden Files (dotfiles)**.
5. Upload the zip, select it, click **Extract**, then delete the zip.

When you redeploy, old files in `assets/` are not removed automatically. They are harmless, but you can delete the `assets` folder before extracting to keep things tidy.

## Pointing a domain or subdomain at the folder

- **Main domain:** it already points to `public_html`. Deploy there.
- **Subdomain** (for example `portfolio.yourdomain.com`): cPanel → **Domains** → **Create A New Domain**, enter the subdomain, untick "Share document root", and note the document root it creates (for example `/home/CPANEL_USERNAME/portfolio.yourdomain.com`). Deploy into that folder, and use that path in `.cpanel.yml`.
- **Addon domain:** the same steps as a subdomain, with the full domain name.
- **A subfolder** (for example `yourdomain.com/portfolio`) also works, because the build uses relative paths. Set `siteUrl` to the full address including the folder.

Turn on the free SSL certificate for the domain (cPanel → **SSL/TLS Status**) so the site loads over `https`. WebGPU only works on secure pages; without it the site falls back to WebGL.

## Testing the live site

Open each of these and check the result:

| Check | Expected |
|---|---|
| `https://your-domain/` | Loading screen, then the start screen. Start, drive, open a panel |
| `https://your-domain/simple` | The simple view (this proves the `.htaccess` rewrite works) |
| `https://your-domain/simple.html` | The same page |
| View source of `/simple` | All the portfolio text is in the HTML |
| `https://your-domain/robots.txt` and `/sitemap.xml` | Both show your real domain, not example.com |
| Browser dev tools → Network, reload | Files in `assets/` are served with `cache-control: max-age=31536000` and `content-encoding: gzip` |
| Browser dev tools → Console | A line like `[portfolio] Renderer in use: WebGPU` |
| If you added models: Network tab, filter by `glb` | Each `.glb` loads with status 200 and type `model/gltf-binary` |
| Settings → Compatibility mode | The world reloads and the console says `WebGL 2` |
| A phone | Touch buttons appear and the car drives |

If `/simple` shows a 404, the `.htaccess` file did not upload (hidden files) or the host has `mod_rewrite` off; `/simple.html` still works in that case.

After the first deploy, add the site to Google Search Console and submit `https://your-domain/sitemap.xml`.
