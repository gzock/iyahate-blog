// Content.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const Content: React.FC = () => {
  const router = useRouter();
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // 日付の変更やナビゲーションの処理など

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <h1 className={styles.mainTitle}>title</h1>
        <p className={styles.verticalText}>hogehoge</p>
        <h2 className={styles.subTitle}>section 1 </h2>
        <p className={styles.verticalText}>foobar</p>
        <h2 className={styles.subTitle}>section 2</h2>
        <p className={styles.verticalText}>　piyopiyo</p>
      </article>
    </div>
  );
};

export default Content;
