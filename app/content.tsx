// Content.tsx
import React from "react";
import styles from "./page.module.css";
import { Post } from "@/types/post";
import { formatUpdatedAt } from "@/lib/date";

type ContentProps = {
  post: Post | null;
  isLoading?: boolean;
};

const Content: React.FC<ContentProps> = ({ post, isLoading = false }) => {
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
  );
};

export default Content;
