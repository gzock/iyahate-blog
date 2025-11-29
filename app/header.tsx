"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Github, Menu, Search, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HeaderProps = {
  onSearch: (query: string) => void;
  onToggleRecent: () => void;
};

const Header: React.FC<HeaderProps> = ({ onSearch, onToggleRecent }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (!value.trim()) {
      onSearch("");
    }
  };

  return (
    <header className="border-b border-border bg-white/80 text-foreground backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex items-center gap-2 px-3 py-2 md:gap-6 md:px-5 md:py-4">
        <a
          className="flex items-center gap-3 text-gray-900"
          href="/"
          aria-label="トップへ戻る"
        >
          <img src="/profile.png" alt="logo" width="40" height="40" />
          <span className="text-xl font-mincho tracking-[0.3em]">弥終</span>
        </a>
        <div className="flex flex-1 items-center justify-end gap-4">
          <form
            className="flex max-w-xl flex-1 items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring md:gap-3 md:px-4 md:py-2"
            onSubmit={handleSubmit}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={handleInputChange}
              className="h-8 flex-1 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              placeholder="過去の記事を検索"
              aria-label="Search posts"
            />
            <Button size="sm" className="hidden rounded-full px-4 md:inline-flex">
              検索
            </Button>
          </form>
          <div className="flex shrink-0 items-center gap-2">
            <nav className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/gzock"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/gzock"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            </nav>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border bg-white/90 px-2 text-sm font-medium shadow-sm hover:bg-white md:px-4"
              onClick={onToggleRecent}
            >
              <Menu className="h-4 w-4" />
              <span className="hidden md:inline">最近の記事</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
