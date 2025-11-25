# 開発ガイド

## 初期セットアップ

```bash
npm ci
npm run posts:gen   # Markdown → JSON 変換（初回必須）
npm run dev         # Next.js 開発サーバー
```

- 記事は`content/posts/*.md`に保存し、`npm run posts:gen`で`public/posts/`以下にマニフェスト＋各記事JSONを生成します。
- 開発サーバー起動中もMarkdownを編集したら`npm run posts:gen`を再実行してください。`NODE_ENV=development`ではHTTPキャッシュとアプリ内キャッシュを無効化しているため、ブラウザを更新すればすぐ反映されます。

## Markdown で記事を書く

1. `content/posts`にMarkdownファイルを作り、以下のようにFrontmatterを記述します。

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

2. 生成コマンドを実行します。

	```bash
	npm run posts:gen
	```

3. `public/posts/manifest.json` と `public/posts/<id>.json` が更新され、アプリ全体が最新記事を読むようになります。

## Cloudflare Workers / Pages (OpenNext)

Cloudflare推奨の[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)でデプロイします。`next dev`で開発し、出荷前にOpenNextでWorker形式へ変換します。

1. 依存関係（`@opennextjs/cloudflare`, `wrangler@^4.49.1`など）は`package.json`に含まれています。`.dev.vars`は`NEXTJS_ENV=development`を設定済みで、Next.jsの`.env.development`も読み込みます。
2. Cloudflare Runtimeでの動作確認：

	```bash
	npm run preview
	```

	`next build` → `.open-next/` 変換 → `wrangler dev` の順に実行されます。

3. 手元から即時デプロイ：

	```bash
	npm run deploy
	```

	段階的リリースをしたい場合は`npm run upload`でバージョンのみアップロードし、Cloudflareダッシュボードで切り替えます。

4. `npm run cf:typegen`で`cloudflare-env.d.ts`を再生成すると、BindingsをTypeScriptから安全に参照できます。

5. Git 連携（Workers Builds）を使う場合：
	- **Build command**: `npx opennextjs-cloudflare build`
	- **Deploy command**: `npx opennextjs-cloudflare deploy`（または `upload`）
	- devDependencies もインストールされるよう Workers Builds（旧 Pages builds）を使ってください。
	- `wrangler.toml` は `main = ".open-next/worker.js"`、`assets = .open-next/assets`、`compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]` を設定済みです。

6. 静的アセットは `public/_headers` で `/_next/static/*` に `Cache-Control: public,max-age=31536000,immutable` を付与しています。`.open-next/` は Git から除外しています。

## キャッシュに関して

- 開発時: `fetch` の `cache` を `no-store` にし、アプリ内のメモリキャッシュも無効化しています。`npm run posts:gen` 後にブラウザを更新すれば即座に反映されます。
- 本番時: `force-cache` とアプリ内キャッシュが有効になり、Cloudflare エッジと合わせて高速配信します。必要ならビルドのバージョンをクエリに付与してキャッシュをバイパスできます。
