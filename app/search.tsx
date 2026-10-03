"use client";

import { useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSearchIndex, searchPosts } from "@/lib/search";
import type { SearchState } from "./search-dialog";

const SearchDialog = dynamic(() => import("./search-dialog"));

export default function Search({ indexUrl }: { indexUrl: string }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    const id = ++requestId.current;
    setState({ status: "loading", query: value });
    try {
      const entries = await loadSearchIndex(indexUrl);
      if (id === requestId.current) {
        setState({ status: "success", query: value, results: searchPosts(entries, value) });
      }
    } catch {
      if (id === requestId.current) setState({ status: "error", query: value });
    }
  }

  function close() {
    requestId.current++;
    setState(null);
  }

  return (
    <>
      <form role="search" onSubmit={submit} className="flex min-w-0 max-w-xl flex-1 items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring md:px-4 md:py-2">
        <SearchIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input ref={input} type="search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="過去の記事を検索" aria-label="記事を検索" enterKeyHint="search"
          className="h-8 min-w-0 flex-1 border-none bg-transparent px-0 shadow-none focus-visible:ring-0" />
        <Button type="submit" size="sm" className="hidden rounded-full px-4 md:inline-flex">検索</Button>
      </form>
      {state && <SearchDialog state={state} onClose={close} onRestoreFocus={() => input.current?.focus()} />}
    </>
  );
}
