import type { Post } from "@/types/post";
import { formatDate } from "@/lib/date";
import styles from "./page.module.css";

export default function Content({ post }: { post: Post }) {
  return (
    <div className={styles.container}>
      <div className={styles.scrollWrapper} dir="rtl" tabIndex={0} role="region" aria-label="記事本文（横方向にスクロールできます）">
        <article className={styles.article} dir="ltr">
          <div className={styles.meta}>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.updatedAt !== post.publishedAt && (
              <span> ／ 更新：<time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></span>
            )}
          </div>
          <h1 className={styles.mainTitle}>{post.title}</h1>
          <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </div>
    </div>
  );
}
