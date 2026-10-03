import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/posts";
import { postMetadata } from "@/lib/metadata";
import PostView from "./post-view";

export function generateMetadata(): Metadata {
  return posts[0] ? postMetadata(posts[0]) : { title: "弥終ブログ" };
}

export default function Home() {
  return posts[0] ? <PostView post={posts[0]} /> : (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl">弥終ブログ</h1>
      <p className="mt-6">公開された記事はまだありません。</p>
      <Link href="/archive" prefetch={false} className="mt-6 block underline">記事一覧</Link>
    </main>
  );
}
