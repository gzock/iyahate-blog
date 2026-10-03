# 弥終ブログ

日本語の縦書きブログです。Next.jsで記事ごとのHTMLを事前生成し、Cloudflare Workers（OpenNext）で配信します。

## セットアップ

Node.js 22.18以降（推奨: Node.js 22の最新パッチ）を使用してください。

```bash
npm ci
npm run dev
```

開発サーバーが原稿の追加・編集・削除を監視し、保存時にプレビューを更新します。原稿の検証に失敗した場合はターミナルにファイル名と理由を表示し、最後に成功したプレビューを保持します。

## 記事を書く

編集する文章は `content/posts/*.md` のみです。本文はfrontmatterの下に書きます。

```md
---
id: "example-post"
title: "記事のタイトル"
publishedAt: "2026-10-01T10:00:00+09:00"
updatedAt: "2026-10-01T10:00:00+09:00"
draft: false
---

冒頭の段落です。

次の段落です。

## 見出し

**強調**、[リンク](https://example.com)、箇条書き、引用、コードブロックなどを使えます。
```

- `id`、`title`、`publishedAt` は必須です。IDは半角英小文字・数字・ハイフンで指定し、数字だけでも引用符で囲みます。
- 公開後はIDを維持してください。記事URLは `/posts/<id>` です。
- `updatedAt` は任意で、省略時は公開日時を使います。更新しても一覧の公開順は変わりません。
- 日時にはタイムゾーンを含め、引用符で囲みます。表示は日本時間に統一しています。
- `description` は任意の説明文（200文字以内）です。省略時は本文から自動抽出します。説明文はメタデータ用で、本文に重ねて表示しません。
- `draft: true` の記事と、ビルド時点より未来の公開日時の記事は、記事ページ・検索・一覧・RSS・サイトマップのすべてから除外します。開発時も同じ公開条件です。
- 予約日時になっただけでは公開されません。その時点以降に再ビルド・デプロイが必要です。
- 生HTMLは実行せず文字として表示します。本文に書いた見出し・段落は省略しません。
- frontmatterは `---` で囲んだYAMLのみを受け付け、JavaScriptなどの言語指定は拒否します。
- 長い表・コードブロックは、その枠内を縦横にスクロールして読めます。キーボードでもフォーカスできます。
- ID重複、不正な日付、公開記事の空本文、未知のfrontmatter項目は生成エラーになります。旧形式の `lead` は使いません。

公開前にローカルで確認する場合は、公開可能な日時・`draft: false` にしたうえで `npm run dev` の表示を確認してください。

## 生成物と配信

`npm run gen` で原稿を検証・変換します（`npm run posts:gen` も同じ処理です）。

- `.generated/posts.json`: ビルド専用のデータ。サーバー側のコードだけが参照します。
- `public/search/index-<hash>.json`: 全文検索用データ。検索を実行するまで取得しません。
- 上記とNext.js/OpenNextのビルド出力はGit管理しません。記事を更新する際にJSONを編集・コミットする必要はありません。
- 記事本文は最初のHTMLに含まれます。記事別JSONや全記事本文の一覧JSONは配信しません。
- Cloudflareでも事前生成したページをStatic Assetsの読み取り専用キャッシュから配信します。R2やデータベースの追加は不要です。
- Next.js 16.3とOpenNext 1.20の404キャッシュキーの差は `lib/static-cache.ts` で吸収しています。OpenNext更新後も、存在しないURLが404を返し、キャッシュへの書き込みエラーが出ないことを確認してください。
- プロフィール画像はファイル名にハッシュを付けた静的アセットとして配信します。Cloudflare Imagesの契約・Bindingは不要です。
- トップページには最新記事、`/archive` には全記事を表示します。記事リンクの先読みを無効にし、未閲覧の記事本文の一括取得を避けています。
- 検索は全文を対象にし、大文字・小文字と全角・半角を正規化します。スペース区切りの複数語はAND検索です。
- 検索用データは内容のハッシュをURLに含めてキャッシュします。新しい記事を反映したデプロイではURLが変わります。古いタブで検索が失敗する場合は再読み込みしてください。
- 検索結果のダイアログも、最初に検索する際に読み込みます。閉じると検索入力欄へフォーカスが戻ります。
- RSSは `/feed.xml`、サイトマップは `/sitemap.xml` です。

## 検証

```bash
npm test
npm run lint
npm run typecheck
npm audit
```

テストではMarkdownの重複・欠落、本文後半の検索、下書き・未来の記事の除外、日付・ID検証、失敗時の生成物保全、検索の再試行、RSSのエスケープなどを確認します。型チェックには本番URLの設定は不要です。

Cloudflareプレビューを起動した状態では、別のターミナルで次を実行できます（ポートはプレビューの表示に合わせます）。

```bash
npm run test:smoke -- http://127.0.0.1:8787
```

全記事の初期HTML・キャッシュ、正規URL・RSS自動検出、全文検索データ、画像、404、HTMLとRSCの応答の区別を確認します。GitHub Actionsでもテスト・lint・ビルド・Worker実行検証・auditを実行します。CIでは `SITE_URL` を設定せず、自動デプロイと同じ共通設定でビルドできることを確認します。

## 本番URLとビルド

ブログの公開オリジンは `site.config.mjs` の `publicSiteUrl` で管理します。記事の正規URL、OGP、RSS、サイトマップに共通で使います。通常のビルド・自動デプロイでは環境変数の追加設定は不要です。公開ドメインを変更する場合は、この設定を更新して再ビルドします。

```bash
npm run build
npm run start
```

別の公開先向けにビルドする場合のみ、`SITE_URL=https://preview.example npm run build` のように上書きできます。値には末尾のパス、クエリ、認証情報を含めません。URLはビルドに埋め込まれ、ビルド済みサーバーの起動時に再設定する必要はありません。開発時のみ、未設定なら `http://localhost:3000` を使います。`next/font/google` の外部取得には依存せず、端末のフォントを利用します。

本番・開発ビルドにはNext.js標準のWebpackを使用します。

開発サーバーはNext.jsとして動作し、Cloudflareの実行環境は `npm run preview` で確認します。`esbuild` はアプリから直接使いませんが、OpenNext 1.20のCLIが必要とするためdevDependenciesに残しています。AutoprefixerはTailwind 4と重複するため使用しません。

`@next/eslint-plugin-next@16.3.8` の `fast-glob` 依存は、互換の `globSync` を持つ `tinyglobby@0.2.17` に限定して置き換えています。修正版のない `braces` の [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) を依存経路ごと除くためです。ルートディレクトリのglob指定とNext.jsのリンク検査をテストしています。プラグイン更新時には上流の依存を確認し、このoverrideを見直してください。

## Cloudflare Workers

通常は環境変数を追加せず、以下を実行します。

```bash
npm run build:cloudflare  # Next.jsビルド＋Worker変換
npm run preview          # ビルドしてCloudflareランタイムで確認
npm run deploy           # ビルドして公開
npm run upload           # ビルドしてバージョンのみアップロード
```

Workers BuildsのGit連携では、以下の設定を使います。

- `SITE_URL` の追加設定は不要です。既存の「PRをマージすると自動デプロイする」運用を継続できます。
- Build command: `npm run build:cloudflare`
- Deploy command: `npx opennextjs-cloudflare deploy`（または `upload`）
- devDependenciesもインストールしてください。Markdownの変換はビルド時に行います。

OpenNextが `npm run build` を呼び出すため、原稿の生成も必ず実行されます。`npm run cf:typegen` でCloudflareのBindings型を再生成できます。
