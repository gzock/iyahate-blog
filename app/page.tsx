"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";
import Sidebar from "./sidebar";
import { Post, PostSummary } from "@/types/post";
import { fetchPostManifest, fetchPostById } from "@/lib/posts";

export default function Home() {
  const [allSummaries, setAllSummaries] = useState<PostSummary[]>([]);
  const [visibleSummaries, setVisibleSummaries] = useState<PostSummary[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeSummary, setActiveSummary] = useState<PostSummary | null>(null);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPostManifest()
      .then((summaries) => {
        if (!mounted) {
          return;
        }
        setAllSummaries(summaries);
        setVisibleSummaries(summaries);
        if (summaries[0]) {
          selectPostById(summaries[0].id, summaries[0]);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("記事の読み込みに失敗しました。");
        }
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const activeIndex = useMemo(() => {
    if (!activeSummary) {
      return -1;
    }
    return visibleSummaries.findIndex(
      (post) => post.id === activeSummary.id
    );
  }, [activeSummary, visibleSummaries]);

  const handleSearch = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setVisibleSummaries(allSummaries);
      if (allSummaries[0]) {
        selectPostById(allSummaries[0].id, allSummaries[0]);
      }
      return;
    }

    const filtered = allSummaries.filter((post) =>
      post.searchIndex.toLowerCase().includes(normalized)
    );

    setVisibleSummaries(filtered);
    if (filtered[0]) {
      selectPostById(filtered[0].id, filtered[0]);
    } else {
      setActivePost(null);
      setActiveSummary(null);
    }
  };

  const selectPostById = async (
    postId: string,
    summaryFallback?: PostSummary
  ) => {
    setIsLoadingPost(true);
    setError(null);
    const summary =
      summaryFallback ??
      allSummaries.find((candidate) => candidate.id === postId) ??
      null;
    try {
      const post = await fetchPostById(postId);
      setActivePost(post);
      setActiveSummary(summary ?? null);
      if (!post) {
        setError("記事の読み込みに失敗しました。");
      }
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleSelectPost = (postId: string) => {
    selectPostById(postId);
    setIsRecentOpen(false);
  };

  const handleRelativePost = (direction: 1 | -1) => {
    if (activeIndex === -1) {
      return;
    }
    const target = visibleSummaries[activeIndex + direction];
    if (target) {
      selectPostById(target.id, target);
    }
  };

  const handlePreviousPost = () => handleRelativePost(-1);
  const handleNextPost = () => handleRelativePost(1);

  const canGoPrevious = activeIndex > 0;
  const canGoNext =
    activeIndex !== -1 && activeIndex < visibleSummaries.length - 1;

  return (
    <div>
      <Header
        onSearch={handleSearch}
        onToggleRecent={() => setIsRecentOpen((prev) => !prev)}
      />
      <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <main className="w-full px-5 py-10">
        {error ? (
          <div className="text-center text-sm text-red-500">{error}</div>
        ) : (
          <Content post={activePost} isLoading={isLoadingPost} />
        )}
      </main>
      <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <Footer
        onPrevious={handlePreviousPost}
        onNext={handleNextPost}
        canPrevious={canGoPrevious}
        canNext={canGoNext}
      />
      <Sidebar
        posts={visibleSummaries}
        activePostId={activeSummary?.id ?? null}
        onSelect={handleSelectPost}
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
      />
    </div>
  );
}
