import type { Metadata } from "next";
import Link from "next/link";
import { summaries } from "@/lib/posts";
import { formatDate } from "@/lib/date";
import { rssAlternates } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "弥終ブログのすべての記事を公開日の新しい順に掲載しています。",
  alternates: { ...rssAlternates, canonical: "/archive" },
};

export default function Archive() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-10 md:py-16">
      <h1 className="font-mincho text-3xl">記事一覧</h1>
      <p className="mt-3 text-sm text-muted-foreground">全{summaries.length}記事・公開日の新しい順</p>
      <ol className="mt-8 divide-y">
        {summaries.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`} prefetch={false} className="block rounded-lg px-3 py-5 transition hover:bg-muted focus-visible:outline-2">
              <h2 className="font-mincho text-xl">{post.title}</h2>
              <time dateTime={post.publishedAt} className="mt-2 block text-sm text-muted-foreground">{formatDate(post.publishedAt)}</time>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/feed.xml" prefetch={false} className="mt-8 inline-block text-sm underline underline-offset-4">RSSを購読する</Link>
    </main>
  );
}
