import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

// Escape raw HTML; markdown-it also rejects unsafe link protocols.
const markdown = new MarkdownIt({ html: false });
markdown.renderer.rules.table_open = () => '<div data-table-scroll tabindex="0" role="region" aria-label="表（縦横にスクロールできます）"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';
for (const type of ["fence", "code_block"]) {
  const render = markdown.renderer.rules[type];
  markdown.renderer.rules[type] = (...args) => render(...args).replace("<pre>", '<pre tabindex="0" role="region" aria-label="コード（縦横にスクロールできます）">');
}
const fields = new Set(["id", "title", "publishedAt", "updatedAt", "description", "draft"]);

function fail(file, message) {
  throw new Error(`${file}: ${message}`);
}

function date(value, field, file) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    fail(file, `${field} must be a quoted ISO date with a timezone`);
  }
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const calendar = new Date(0);
  calendar.setUTCFullYear(year, month, 0);
  const days = calendar.getUTCDate();
  if (!Number.isFinite(Date.parse(value)) || month < 1 || month > 12 || day < 1 || day > days || Number(value.slice(11, 13)) > 23) {
    fail(file, `${field} is not a valid date`);
  }
  return value;
}

function plainText(tokens) {
  return tokens.map((token) => {
    if (token.children) return plainText(token.children);
    if (["text", "code_inline", "code_block", "fence"].includes(token.type)) return token.content;
    if (["softbreak", "hardbreak"].includes(token.type) || token.block) return " ";
    return "";
  }).join("");
}

export function parsePost(source, file) {
  source = source.replace(/^\uFEFF/, "");
  // Reject language selectors before gray-matter can dispatch to its JS engine.
  if (!/^---\r?\n/.test(source) || !/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(source)) {
    fail(file, "frontmatter must be YAML enclosed by --- lines");
  }
  let parsed;
  try {
    parsed = matter(source);
  } catch (error) {
    fail(file, `invalid frontmatter: ${error.message}`);
  }
  const { data, content } = parsed;
  if (!data || typeof data !== "object" || Array.isArray(data)) fail(file, "frontmatter must be a YAML mapping");
  for (const field of Object.keys(data)) {
    if (!fields.has(field)) fail(file, `unknown field "${field}"; write the article below the frontmatter`);
  }
  if (typeof data.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.id)) {
    fail(file, "id must be a quoted string containing lowercase letters, digits or hyphens");
  }
  if (typeof data.title !== "string" || !data.title.trim() || /[\r\n]/.test(data.title)) {
    fail(file, "title must be a non-empty single line");
  }
  if (data.draft !== undefined && typeof data.draft !== "boolean") fail(file, "draft must be true or false");
  const publishedAt = date(data.publishedAt, "publishedAt", file);
  const updatedAt = date(data.updatedAt ?? data.publishedAt, "updatedAt", file);
  if (Date.parse(updatedAt) < Date.parse(publishedAt)) fail(file, "updatedAt must not precede publishedAt");
  if (!content.trim() && !data.draft) fail(file, "published articles must have a body");
  if (data.description !== undefined && (typeof data.description !== "string" || !data.description.trim() || [...data.description].length > 200)) {
    fail(file, "description must contain 1–200 characters");
  }
  const tokens = markdown.parse(content, {});
  // The page supplies h1; retain body headings as h2.
  for (const token of tokens) {
    if (token.tag === "h1") token.tag = "h2";
  }
  const text = plainText(tokens).replace(/\s+/g, " ").trim();
  return {
    id: data.id,
    title: data.title.trim(),
    publishedAt,
    updatedAt,
    description: data.description?.trim() ?? [...text].slice(0, 120).join(""),
    html: markdown.renderer.render(tokens, markdown.options, {}),
    text,
    draft: data.draft ?? false,
  };
}

export function readPosts(inputDir, now = new Date()) {
  const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith(".md")).sort();
  const ids = new Set();
  const posts = files.map((file) => {
    const post = parsePost(fs.readFileSync(path.join(inputDir, file), "utf8"), file);
    if (ids.has(post.id)) fail(file, `duplicate id "${post.id}"`);
    ids.add(post.id);
    return post;
  });
  return posts.filter((post) => !post.draft && Date.parse(post.publishedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id, "en"));
}

function writeChanged(file, value) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === value) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, value);
  fs.renameSync(temporary, file);
}

export function generatePosts(root, now = new Date()) {
  // Validate every source before replacing any previously generated output.
  const parsed = readPosts(path.join(root, "content/posts"), now);
  const search = JSON.stringify(parsed.map(({ id, title, publishedAt, text }) => ({ id, title, publishedAt, text })));
  const version = createHash("sha256").update(search).digest("hex").slice(0, 16);
  const searchUrl = `/search/index-${version}.json`;
  const posts = parsed.map(({ id, title, publishedAt, updatedAt, description, html }) => ({ id, title, publishedAt, updatedAt, description, html }));
  writeChanged(path.join(root, "public", searchUrl), search);
  const data = { posts, searchUrl };
  writeChanged(path.join(root, ".generated/posts.json"), JSON.stringify(data));
  // Remove only obsolete generated indexes, never user-authored files.
  const searchDir = path.join(root, "public/search");
  for (const file of fs.readdirSync(searchDir)) {
    if (/^index-[a-f0-9]{16}\.json$/.test(file) && file !== path.basename(searchUrl)) fs.unlinkSync(path.join(searchDir, file));
  }
  return data;
}
