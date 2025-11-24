"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type FooterProps = {
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
};

const Footer: React.FC<FooterProps> = ({
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}) => {
  return (
    <footer className="border-t border-border bg-white/80 text-foreground backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onPrevious}
          disabled={!canPrevious}
          className="group rounded-full border border-transparent px-6 text-sm font-medium tracking-[0.4em] text-muted-foreground transition hover:border-border hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
          前へ
        </Button>
        <p className="hidden text-xs uppercase tracking-[0.6em] text-muted-foreground sm:block">
          archive
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onNext}
          disabled={!canNext}
          className="group rounded-full border-border px-6 text-sm font-medium tracking-[0.4em]"
        >
          次へ
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
