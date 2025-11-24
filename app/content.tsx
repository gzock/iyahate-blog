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
        <p className={styles.verticalText}>{post.lead}</p>
        {post.sections.map((section, index) => (
          <section key={`${post.id}-${index}`}>
            <h2 className={styles.subTitle}>{section.heading}</h2>
            <p className={styles.verticalText}>{section.body}</p>
          </section>
        ))}
      </article>
    </div>
  );
};

export default Content;
