import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostSummary } from "@/types/post";
import { Button } from "@/components/ui/button";

export default function Footer({ newer, older }: { newer?: PostSummary; older?: PostSummary }) {
  return (
    <footer className="border-t border-border bg-white/80 text-foreground">
      <nav aria-label="記事の移動" className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-4 md:px-5">
        {newer ? (
          <Button variant="ghost" className="px-2 sm:px-4" asChild>
            <Link href={`/posts/${newer.id}`} prefetch={false} aria-label={`新しい記事：${newer.title}`}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />新しい記事
            </Link>
          </Button>
        ) : <Button variant="ghost" className="px-2 sm:px-4" disabled><ArrowLeft aria-hidden="true" className="h-4 w-4" />新しい記事</Button>}
        <Link href="/archive" prefetch={false} className="shrink-0 whitespace-nowrap text-sm text-muted-foreground underline underline-offset-4">記事一覧</Link>
        {older ? (
          <Button variant="outline" className="px-2 sm:px-4" asChild>
            <Link href={`/posts/${older.id}`} prefetch={false} aria-label={`古い記事：${older.title}`}>
              古い記事<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        ) : <Button variant="outline" className="px-2 sm:px-4" disabled>古い記事<ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>}
      </nav>
    </footer>
  );
}
