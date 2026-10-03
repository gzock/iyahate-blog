"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/date";
import type { SearchEntry } from "@/types/post";

export type SearchState =
  | { status: "loading"; query: string }
  | { status: "error"; query: string }
  | { status: "success"; query: string; results: SearchEntry[] };

export default function SearchDialog({ state, onClose, onRestoreFocus }: {
  state: SearchState;
  onClose: () => void;
  onRestoreFocus: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl"
        onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus(); }}>
        <DialogHeader className="text-left">
          <DialogTitle>記事の検索</DialogTitle>
          <DialogDescription>「{state.query}」の検索結果</DialogDescription>
        </DialogHeader>
        <div role="status" aria-live="polite">
          {state.status === "loading" ? "検索しています…" : state.status === "error" ? (
            <p>検索データを読み込めませんでした。閉じてもう一度検索してください。更新後も失敗する場合はページを再読み込みしてください。</p>
          ) : state.results.length ? `${state.results.length}件の記事が見つかりました。` : "該当する記事がありません。"}
        </div>
        {state.status === "success" && (
          <ul className="space-y-3">
            {state.results.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`} prefetch={false} onClick={onClose}
                  className="block rounded-xl border p-4 transition hover:bg-muted focus-visible:outline-2">
                  <span className="block font-semibold">{post.title}</span>
                  <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/archive" prefetch={false} onClick={onClose} className="text-sm underline underline-offset-4">すべての記事を見る</Link>
      </DialogContent>
    </Dialog>
  );
}
