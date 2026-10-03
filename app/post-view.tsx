import Content from "./content";
import Footer from "./footer";
import { summaries } from "@/lib/posts";
import type { Post } from "@/types/post";

export default function PostView({ post }: { post: Post }) {
  const index = summaries.findIndex((entry) => entry.id === post.id);
  return (
    <>
      <main id="main-content" className="w-full px-2 py-4 md:px-5 md:py-10">
        <Content key={post.id} post={post} />
      </main>
      <Footer newer={summaries[index - 1]} older={summaries[index + 1]} />
    </>
  );
}
