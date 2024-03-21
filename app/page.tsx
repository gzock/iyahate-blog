"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Header from "./header";
import Footer from "./footer";
import Content from "./content";

export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState(() => {
    // 現在の日付をYYYY-MM-DD形式で取得
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // 日付を変更してナビゲーションを実行
  const navigateTo = (offset: any) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + offset);
    const newDate = currentDate.toISOString().split("T")[0];
    setDate(newDate);
    // ここで実際には記事のデータをフェッチするなどの処理を行う
  };

  useEffect(() => {
    // 日付が変わった時の処理。例えばAPIから新しい日付の記事データを取得するなど。
  }, [date]);

  return (
    <div>
      <Header />
      <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
      <Content />
      <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
      <Footer />
    </div>
  );
}
