// Content.tsx
import React, { useEffect, useRef } from "react";
import styles from "./page.module.css";
import { Post } from "@/types/post";
import { formatUpdatedAt } from "@/lib/date";

type ContentProps = {
  post: Post | null;
  isLoading?: boolean;
};

const Content: React.FC<ContentProps> = ({ post, isLoading = false }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    const el = scrollRef.current;
    el.scrollLeft = el.scrollWidth;
  }, [post?.id]);

  const renderParagraphs = (text: string, keyPrefix: string) =>
    text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph, index) => (
        <p
          key={`${keyPrefix}-${index}`}
          className={`${styles.verticalText} ${styles.paragraph}`}
        >
          {paragraph}
        </p>
      ));

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>記事を読み込んでいます…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>該当する記事がありません。</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollWrapper} ref={scrollRef}>
        <article className={styles.article}>
          <p className={styles.meta}>{formatUpdatedAt(post.updatedAt)}</p>
          <h1 className={styles.mainTitle}>{post.title}</h1>
          {renderParagraphs(post.lead, "lead")}
          {post.sections.map((section, index) => (
            <section key={`${post.id}-${index}`}>
              <h2 className={styles.subTitle}>{section.heading}</h2>
              {renderParagraphs(section.body, `${post.id}-${section.heading}`)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default Content;
