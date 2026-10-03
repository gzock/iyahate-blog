import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const base = process.argv[2];
if (!base) throw new Error("Usage: npm run test:smoke -- http://127.0.0.1:<preview-port> [worker-log]");
const { posts, searchUrl } = JSON.parse(await fs.readFile(".generated/posts.json", "utf8"));
const { config } = JSON.parse(await fs.readFile(".next/required-server-files.json", "utf8"));
const origin = config.env.SITE_URL;
const xml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]+)>`, "g"))]
  .map((match) => Object.fromEntries([...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])));
async function request(path, init, expected = 200) {
  const response = await fetch(new URL(path, base), { ...init, signal: AbortSignal.timeout(10_000) });
  assert.equal(response.status, expected, `${path}: HTTP status`);
  return { response, text: await response.text() };
}

// Give Wrangler a bounded startup window. All subsequent failures are immediate.
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(new URL("/", base), { signal: AbortSignal.timeout(1000) });
    await response.body?.cancel();
    ready = true;
    break;
  } catch { await delay(500); }
}
assert.ok(ready, "Worker did not start");

let image;
for (const path of ["/", "/archive", ...posts.map((post) => `/posts/${post.id}`)]) {
  const { response, text } = await request(path);
  assert.equal(response.headers.get("x-opennext-cache"), "HIT", `${path}: static cache`);
  assert.ok(text.includes('lang="ja"'));
  const links = tags(text, "link");
  assert.ok(links.some((tag) => tag.rel === "alternate" && tag.type === "application/rss+xml" && tag.href === `${origin}/feed.xml`), `${path}: RSS discovery`);
  const canonical = path === "/" && posts[0] ? `/posts/${posts[0].id}` : path;
  if (path !== "/" || posts.length) assert.ok(links.some((tag) => tag.rel === "canonical" && tag.href === origin + canonical), `${path}: canonical`);
  const post = path === "/" ? posts[0] : posts.find((post) => path === `/posts/${post.id}`);
  if (post) assert.ok(text.match(/<article\b[\s\S]*?<\/article>/)?.[0].includes(post.html), `${path}: full body in initial HTML`);
  image = tags(text, "img").find((tag) => tag.alt === "弥終")?.src;
  assert.ok(image && links.some((tag) => tag.rel === "icon" && tag.href === image), `${path}: shared logo/favicon URL`);
  const meta = tags(text, "meta");
  assert.ok(meta.some((tag) => tag.property === "og:image" && tag.content === origin + image), `${path}: absolute OGP image URL`);
  if (post) assert.ok(meta.some((tag) => tag.property === "og:url" && tag.content === `${origin}/posts/${post.id}`), `${path}: OGP article URL`);
  if (path === "/") {
    for (const script of tags(text, "script").filter((tag) => tag.src)) {
      const { text: code } = await request(script.src);
      assert.ok(!code.includes("検索データを読み込めませんでした"), "Search dialog must be lazy-loaded");
    }
  }
}
const { response: imageResponse } = await request(image);
assert.match(imageResponse.headers.get("cache-control"), /immutable/);
const { response: favicon } = await request("/favicon.ico", { redirect: "manual" }, 307);
assert.equal(favicon.headers.get("location"), image);
const { text: archive } = await request("/archive");
const { text: feed } = await request("/feed.xml");
const { text: sitemap } = await request("/sitemap.xml");
const { text: robots } = await request("/robots.txt");
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "robots.txt: sitemap URL");
for (const post of posts) {
  assert.ok(archive.includes(`href="/posts/${post.id}"`));
  assert.ok(feed.includes(`<link>${xml(origin)}/posts/${post.id}</link>`));
  assert.ok(sitemap.includes(`<loc>${xml(origin)}/posts/${post.id}</loc>`));
}
const { response: indexResponse, text: index } = await request(searchUrl);
assert.match(indexResponse.headers.get("cache-control"), /immutable/);
assert.deepEqual(JSON.parse(index).map((post) => post.id), posts.map((post) => post.id));
for (const path of ["/posts/nonexistent-smoke-check", "/posts/manifest.json", "/missing-smoke-check"]) {
  const { text } = await request(path, undefined, 404);
  assert.ok(text.includes("記事が見つかりません"));
}
if (posts[0]) {
  const path = `/posts/${posts[0].id}`;
  const { response } = await request(path, { headers: { RSC: "1" } });
  assert.match(response.headers.get("content-type"), /text\/x-component/);
  assert.match(response.headers.get("vary"), /RSC/i);
  const html = await request(path);
  assert.match(html.response.headers.get("content-type"), /text\/html/);
}
if (process.argv[3]) {
  const log = await fs.readFile(process.argv[3], "utf8");
  assert.doesNotMatch(log, /Failed to set|env.IMAGES binding is not defined|\bERROR\b/, "Worker runtime log");
}
console.log(`Verified ${posts.length} articles, metadata, RSS, sitemap, search, assets, 404s, and HTML/RSC cache separation.`);
