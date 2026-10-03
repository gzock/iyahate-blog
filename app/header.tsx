import React from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Search from "./search";
import { searchUrl } from "@/lib/posts";
import profile from "@/public/profile.png";

type IconProps = React.SVGProps<SVGSVGElement>;

const GitHubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.95c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.12 10.12 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.9 2.25h3.07l-6.7 7.66L23.15 21.75h-6.17l-4.83-6.32-5.53 6.32H3.55l7.17-8.2L3.16 2.25h6.33l4.37 5.78 5.04-5.78Zm-1.08 17.41h1.7L8.56 4.23H6.73l11.09 15.43Z" />
  </svg>
);

const Header = () => {
  return (
    <header className="border-b border-border bg-white/80 text-foreground backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex items-center gap-2 px-3 py-2 md:gap-6 md:px-5 md:py-4">
        <Link
          className="flex items-center gap-3 text-gray-900"
          href="/"
          prefetch={false}
          aria-label="トップへ戻る"
        >
          <Image
            src={profile}
            unoptimized
            alt="弥終"
            width={40}
            height={40}
            priority
          />
          <span className="text-xl font-mincho tracking-[0.3em]">弥終</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-4">
          <Search indexUrl={searchUrl} />
          <div className="flex shrink-0 items-center gap-2">
            <nav className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/gzock"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com/gzock"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <XIcon className="h-4 w-4" />
                </a>
              </Button>
            </nav>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border bg-white/90 px-2 text-sm font-medium shadow-sm hover:bg-white md:px-4"
              asChild
            >
              <Link href="/archive" prefetch={false} aria-label="すべての記事を見る">
                <Menu aria-hidden="true" className="h-4 w-4" />
                <span className="hidden md:inline">記事一覧</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
