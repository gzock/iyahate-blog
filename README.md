# development

```bash
npm ci
npm run dev
```

## deploy on Vercel

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Cloudflare Workers (OpenNext)

1. Dependencies already listed in `package.json`: `@opennextjs/cloudflare`, `wrangler@^3.99.0`. Local dev still uses `next dev`, but `.dev.vars` is required so the adapter knows to load `.env.development`.
2. Build and preview the Worker runtime locally (runs the Next build, converts it to `.open-next/`, then launches Wrangler):

	```bash
	npm run preview
	```

3. Deploy straight from your machine (build + upload + activate the Worker):

	```bash
	npm run deploy
	```

	Use `npm run upload` if you prefer a gradual deployment (creates a new version without routing traffic immediately). `npm run cf:typegen` regenerates `cloudflare-env.d.ts` so your bindings stay typed.
4. Git-based deployments use [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/):
	- Connect the repo to Workers Builds.
	- **Build command:** `npx opennextjs-cloudflare build`
	- **Deploy command:** `npx opennextjs-cloudflare deploy` (or `upload`).
	- Cloudflare’s install step must include devDependencies so the CLI is available (default behavior for Workers Builds).
	- Wrangler config (`wrangler.toml`) already points `main` to `.open-next/worker.js`, binds static assets from `.open-next/assets`, and enables the `nodejs_compat` + `global_fetch_strictly_public` flags required by the adapter.
5. Static asset caching: `public/_headers` sets `Cache-Control: public,max-age=31536000,immutable` for `/_next/static/*` so your JS chunks are treated as immutable on Cloudflare’s edge caches.

The OpenNext adapter writes all build artifacts to `.open-next/` (ignored in git). Keep using the standard `next dev` workflow for iteration; switch to `npm run preview` whenever you need to validate behavior inside the Workers runtime before shipping.

## Writing posts in Markdown

Place `.md` files with frontmatter inside `content/posts`. Example frontmatter:

```md
---
id: example-post
title: "タイトル"
updatedAt: "2025-01-01T00:00:00+09:00"
lead: "リード文"
---

## 見出し
本文...
```

Convert the Markdown files into per-post JSON files (manifest + individual documents under `public/posts/`) anytime with:

```bash
npm run posts:generate
```

The app reads from `public/posts/manifest.json` plus the per-post files, so rerun the command whenever you add or edit Markdown content to refresh those assets.
