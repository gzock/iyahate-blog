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

Convert the Markdown files into `data/posts.json` anytime with:

```bash
npm run posts:generate
```

The app keeps using `data/posts.json`, so rerun the command whenever you add or edit Markdown content.
