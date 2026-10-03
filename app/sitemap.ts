import type { MetadataRoute } from "next";
import { summaries } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/archive` },
    ...summaries.map((post) => ({
      url: `${siteUrl}/posts/${post.id}`,
      lastModified: post.updatedAt,
    })),
  ];
}
