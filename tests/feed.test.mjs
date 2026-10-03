import test from "node:test";
import assert from "node:assert/strict";
import { buildFeed } from "../lib/feed.ts";

test("RSS escapes XML and preserves publication dates independently of edits", () => {
  const result = buildFeed([{
    id: "article", title: 'A & B <C>', description: '"引用" & 説明\u0001😀',
    publishedAt: "2026-01-01T00:00:00+09:00", updatedAt: "2026-02-01T00:00:00+09:00", html: "",
  }], "https://blog.example", "ブログ", "説明");
  assert.match(result, /A &amp; B &lt;C&gt;/);
  assert.match(result, /&quot;引用&quot; &amp; 説明/);
  assert.match(result, /<pubDate>Wed, 31 Dec 2025 15:00:00 GMT<\/pubDate>/);
  assert.match(result, /<lastBuildDate>Sat, 31 Jan 2026 15:00:00 GMT<\/lastBuildDate>/);
  assert.match(result, /https:\/\/blog.example\/posts\/article/);
  assert.ok(!result.includes("\u0001"));
  assert.ok(result.includes("😀"));
});
