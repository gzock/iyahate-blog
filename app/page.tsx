"use client";

import { useMemo, useState } from "react";
import Header from "./header";
import Footer from "./footer";
import Content from "./content";
import Sidebar from "./sidebar";
import { Post } from "@/types/post";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const allPosts = useMemo(() => getAllPosts(), []);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>(allPosts);
  const [activePost, setActivePost] = useState<Post | null>(
    allPosts[0] ?? null
  );
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const activeIndex = useMemo(() => {
    if (!activePost) {
      return -1;
    }
    return visiblePosts.findIndex((post) => post.id === activePost.id);
  }, [activePost, visiblePosts]);

  const handleSearch = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setVisiblePosts(allPosts);
      setActivePost(allPosts[0] ?? null);
      return;
    }

    const filtered = allPosts.filter((post) => {
      const searchableText = [
        post.title,
        post.lead,
        ...post.sections.map((section) => `${section.heading} ${section.body}`),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(normalized);
    });

    setVisiblePosts(filtered);
    setActivePost(filtered[0] ?? null);
  };

  const handleSelectPost = (postId: string) => {
    const target = allPosts.find((post) => post.id === postId);
    if (target) {
      setActivePost(target);
    }
    setIsRecentOpen(false);
  };

  const handleRelativePost = (direction: 1 | -1) => {
    if (activeIndex === -1) {
      return;
    }
    const target = visiblePosts[activeIndex + direction];
    if (target) {
      setActivePost(target);
    }
  };

  const handlePreviousPost = () => handleRelativePost(-1);
  const handleNextPost = () => handleRelativePost(1);

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex !== -1 && activeIndex < visiblePosts.length - 1;

  return (
    <div>
      <Header
        onSearch={handleSearch}
        onToggleRecent={() => setIsRecentOpen((prev) => !prev)}
      />
      <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <main className="w-full px-5 py-10">
        <Content post={activePost} />
      </main>
      <hr className="h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <Footer
        onPrevious={handlePreviousPost}
        onNext={handleNextPost}
        canPrevious={canGoPrevious}
        canNext={canGoNext}
      />
      <Sidebar
        posts={visiblePosts}
        activePostId={activePost?.id ?? null}
        onSelect={handleSelectPost}
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
      />
    </div>
  );
}
