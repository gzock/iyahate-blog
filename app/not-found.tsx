import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-mincho text-3xl">記事が見つかりません</h1>
      <p className="mt-4">URLをご確認いただくか、記事一覧からお探しください。</p>
      <Link href="/archive" prefetch={false} className="mt-6 inline-block underline">記事一覧へ</Link>
    </main>
  );
}
