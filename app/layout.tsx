import Header from "./header";
import { siteMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata = siteMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-3">本文へ移動</a>
        <Header />
        <noscript><p className="px-5 py-2 text-sm">検索にはJavaScriptが必要です。記事一覧からもすべての記事をお読みいただけます。</p></noscript>
        {children}
      </body>
    </html>
  );
}
