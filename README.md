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

## Cloudflare Pages (GitOps)

1. Ensure dependencies are installed (already in `package.json`): `@cloudflare/next-on-pages`, `wrangler`, `cross-env`.
2. Build the Cloudflare Pages bundle locally:

	```bash
	npm run pages:build
	```

	This command runs `npx @cloudflare/next-on-pages` and outputs the finalized assets to `.vercel/output/`.
3. (Optional) Preview locally with Wrangler:

	```bash
	npx wrangler pages dev .vercel/output/static --functions .vercel/output/functions --compatibility-date=2024-11-24
	```

4. Configure Cloudflare Pages (GitOps):
	- Connect this GitHub repo to a Pages project.
	- **Build command:** `npm run pages:build`
	- **Build output directory:** `.vercel/output/static`
	- **Node version:** match local env (e.g., 18+).
	- **Environment variable:** `NPM_CONFIG_LEGACY_PEER_DEPS=1` (required until Cloudflare officially supports Next.js 16 with their adapter). Add the same variable for both Preview and Production deployments.
	 - `wrangler.toml` now includes the `[pages]` block with `build_command`/`build_output_dir`, so you can deploy manually with a single command after building:

		 ```bash
		 npm run pages:build
		 npx wrangler deploy
		 ```

		 (Wrangler will run the build itself if `.vercel/output/static` is missing.)

> Cloudflare currently recommends [OpenNext](https://opennext.js.org/cloudflare) for the newest Next.js versions. The above setup keeps using `@cloudflare/next-on-pages` with the legacy peer-deps flag; switch adapters once official Next 16 support lands for a smoother CI experience.

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
