import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generatePosts, parsePost } from "../scripts/lib/content.mjs";

const source = (body = "本文です。", metadata = {}) => {
  const fields = { id: "example", title: "記事", publishedAt: "2026-01-01T10:00:00+09:00", ...metadata };
  return "---\n" + Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n") + "\n---\n\n" + body;
};
function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-test-"));
  fs.mkdirSync(path.join(root, "content/posts"), { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test("preserves every intro paragraph and does not repeat the first paragraph", () => {
  const result = parsePost(source("冒頭の一段落。\n\n二段落目。\n\n## 見出し\n\n本文。"), "example.md");
  assert.equal(result.text, "冒頭の一段落。 二段落目。 見出し 本文。");
  assert.equal(result.html.match(/冒頭の一段落。/g).length, 1);
  const plain = parsePost(source("冒頭。\n\n続き。"), "example.md");
  assert.equal(plain.html, "<p>冒頭。</p>\n<p>続き。</p>\n");
});

test("renders Markdown links, lists and fenced code without misreading code as headings", () => {
  const result = parsePost(source("## 見出し\n\n**強調**と[リンク](https://example.com)。\n\n- 一\n- 二\n\n\`\`\`md\n## コード内\n\`\`\`"), "example.md");
  assert.match(result.html, /<strong>強調<\/strong>/);
  assert.match(result.html, /<a href="https:\/\/example.com">リンク<\/a>/);
  assert.match(result.html, /<ul>/);
  assert.match(result.html, /<pre tabindex="0"[^>]*><code class="language-md">## コード内/);
  assert.equal(result.html.match(/<h2>/g).length, 1);
});

test("rejects executable or unterminated frontmatter before parsing it", () => {
  const input = '---js\n({id:"a",title:(globalThis.blogParserExecuted=true,"x"),publishedAt:"2026-01-01T00:00:00Z"})\n---\nbody';
  assert.throws(() => parsePost(input, "executable.md"), /frontmatter must be YAML/);
  assert.equal(globalThis.blogParserExecuted, undefined);
  assert.throws(() => parsePost('---\nid: "a"', "unfinished.md"), /frontmatter must be YAML/);
  assert.throws(() => parsePost('---\n- item\n---\ntext', "array.md"), /YAML mapping/);
  assert.equal(parsePost("\uFEFF" + source().replaceAll("\n", "\r\n"), "windows.md").id, "example");
});

test("wraps tables in a keyboard-accessible scroll region", () => {
  const post = parsePost(source("| A | B |\n| --- | --- |\n| 1 | 2 |"), "table.md");
  assert.match(post.html, /<div data-table-scroll tabindex="0" role="region"[^>]*><table>/);
  assert.match(post.html, /<\/table><\/div>/);
});

test("keeps uppercase Markdown support and removes old search data when unpublishing", (t) => {
  const root = workspace(t);
  const file = path.join(root, "content/posts/EXAMPLE.MD");
  fs.writeFileSync(file, source("取り下げる本文"));
  const before = generatePosts(root);
  assert.equal(before.posts.length, 1);
  fs.writeFileSync(file, source("取り下げる本文", { draft: true }));
  const after = generatePosts(root);
  assert.equal(after.posts.length, 0);
  assert.equal(fs.existsSync(path.join(root, "public", before.searchUrl)), false);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "public", after.searchUrl), "utf8"), /取り下げる本文/);
});

test("escapes HTML and does not create javascript links", () => {
  const result = parsePost(source('<script>alert(1)</script>\n\n[危険](javascript:alert(1))'), "example.md");
  assert.doesNotMatch(result.html, /<script>|href="javascript:/);
  assert.match(result.html, /&lt;script&gt;/);
});

test("rejects malformed frontmatter, unsafe or numeric IDs and invalid dates", () => {
  for (const metadata of [
    { id: 20260101 }, { id: "../escape" }, { title: "" },
    { publishedAt: "2026-02-30T10:00:00+09:00" },
    { publishedAt: "1900-02-29T00:00:00Z" },
    { publishedAt: "2026-01-01" }, { publishedAt: "invalid" },
    { publishedAt: "2026-01-01T24:00:00+09:00" },
    { updatedAt: "2025-01-01T10:00:00+09:00" },
    { draft: "true" }, { lead: "以前の本文" }, { description: "あ".repeat(201) },
  ]) assert.throws(() => parsePost(source("本文", metadata), "bad.md"), /bad.md:/);
  assert.throws(() => parsePost(source(""), "empty.md"), /must have a body/);
  for (const publishedAt of ["0000-02-29T00:00:00Z", "2000-02-29T00:00:00Z"]) {
    assert.equal(parsePost(source("本文", { publishedAt }), "leap.md").publishedAt, publishedAt);
  }
});

test("excludes drafts and future posts from every generated output; sorts by publication date", (t) => {
  const root = workspace(t);
  const input = path.join(root, "content/posts");
  const entries = [
    ["old", { publishedAt: "2025-01-01T10:00:00+09:00", updatedAt: "2026-05-01T10:00:00+09:00" }],
    ["new", { publishedAt: "2026-01-01T10:00:00+09:00" }],
    ["draft", { draft: true }],
    ["future", { publishedAt: "2030-01-01T10:00:00+09:00" }],
  ];
  for (const [id, metadata] of entries) fs.writeFileSync(path.join(input, id + ".md"), source(id + "の本文", { id, ...metadata }));
  const data = generatePosts(root, new Date("2026-06-01"));
  assert.deepEqual(data.posts.map(p => p.id), ["new", "old"]);
  const search = JSON.parse(fs.readFileSync(path.join(root, "public", data.searchUrl)));
  assert.deepEqual(search.map(p => p.id), ["new", "old"]);
  assert.doesNotMatch(fs.readFileSync(path.join(root, ".generated/posts.json"), "utf8"), /draftの本文|futureの本文/);
});

test("duplicate IDs fail before replacing valid generated files", (t) => {
  const root = workspace(t);
  const input = path.join(root, "content/posts");
  fs.writeFileSync(path.join(input, "a.md"), source());
  generatePosts(root);
  const before = fs.readFileSync(path.join(root, ".generated/posts.json"), "utf8");
  fs.writeFileSync(path.join(input, "b.md"), source("別の文章"));
  assert.throws(() => generatePosts(root), /duplicate id/);
  assert.equal(fs.readFileSync(path.join(root, ".generated/posts.json"), "utf8"), before);
});

test("full text is indexed beyond 1200 characters and filenames change only with search content", (t) => {
  const root = workspace(t);
  const file = path.join(root, "content/posts/example.md");
  fs.writeFileSync(file, source("長".repeat(1500) + "末尾の検索語"));
  const first = generatePosts(root);
  const again = generatePosts(root);
  assert.equal(first.searchUrl, again.searchUrl);
  const search = JSON.parse(fs.readFileSync(path.join(root, "public", first.searchUrl)));
  assert.match(search[0].text, /末尾の検索語$/);
  fs.writeFileSync(file, source("別の本文"));
  assert.notEqual(generatePosts(root).searchUrl, first.searchUrl);
});
