import type { Metadata } from "next";
import type { Post } from "@/types/post";
import { siteUrl, siteName, siteDescription } from "@/lib/site";
import profile from "@/public/profile.png";

export const rssAlternates = { types: { "application/rss+xml": "/feed.xml" } };
const openGraph = {
  locale: "ja_JP",
  siteName,
  images: [{ url: profile.src, alt: "弥終" }],
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  icons: { icon: profile.src },
  alternates: rssAlternates,
  openGraph: { ...openGraph, type: "website" },
};

export function postMetadata(post: Post): Metadata {
  const url = `/posts/${post.id}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { ...rssAlternates, canonical: url },
    openGraph: {
      ...openGraph,
      type: "article", title: post.title, description: post.description, url,
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
    },
    twitter: { card: "summary", title: post.title, description: post.description, images: [profile.src] },
  };
}
