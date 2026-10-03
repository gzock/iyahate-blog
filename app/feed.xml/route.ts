import { posts } from "@/lib/posts";
import { buildFeed } from "@/lib/feed";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeed(posts, siteUrl, siteName, siteDescription), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
