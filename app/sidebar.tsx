"use client";

import React from "react";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Post } from "@/types/post";
import { formatUpdatedAt } from "@/lib/date";

export type SidebarProps = {
  posts: Post[];
  activePostId: string | null;
  onSelect: (postId: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  posts,
  activePostId,
  onSelect,
  isOpen,
  onClose,
}) => {
  const latestEntries = posts.slice(0, 10);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-full max-w-2xl rounded-[2rem] border border-border bg-popover/95 p-0 shadow-2xl backdrop-blur">
        <DialogHeader className="space-y-2 border-b border-border px-6 pb-5 pt-6 text-left">
          <DialogTitle className="text-2xl font-semibold">
            最近の記事一覧
          </DialogTitle>
          <DialogDescription>
            直近10件の記事を新しい順に表示しています。記事を選択すると、その記事に移動します。
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
          {latestEntries.length ? (
            <ul className="space-y-3">
              {latestEntries.map((post) => {
                const isActive = post.id === activePostId;
                return (
                  <li key={post.id}>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "flex w-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left",
                        isActive
                          ? "border-transparent shadow-lg"
                          : "border-border bg-background/80 text-foreground hover:bg-muted"
                      )}
                      onClick={() => {
                        onSelect(post.id);
                        onClose();
                      }}
                    >
                      <span className="text-sm font-semibold tracking-wide">
                        {post.title}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatUpdatedAt(post.updatedAt)}
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">記事が見つかりません。</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Sidebar;
