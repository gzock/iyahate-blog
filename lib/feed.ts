import type { Post } from "@/types/post";

function xml(value: string) {
  // XML 1.0 excludes control characters even when JSON/Markdown accepts them.
  return value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "").replace(/[<>&"']/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
  })[character]!);
}

export function buildFeed(posts: Post[], origin: string, title: string, description: string) {
  const modified = posts.map((post) => Date.parse(post.updatedAt));
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${xml(title)}</title><link>${xml(origin)}</link><description>${xml(description)}</description>
<language>ja</language>
<atom:link href="${xml(origin)}/feed.xml" rel="self" type="application/rss+xml"/>
${modified.length ? `<lastBuildDate>${new Date(Math.max(...modified)).toUTCString()}</lastBuildDate>` : ""}
${posts.map((post) => {
    const url = xml(`${origin}/posts/${post.id}`);
    return `<item><title>${xml(post.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate></item>`;
  }).join("\n")}
</channel></rss>`;
}
