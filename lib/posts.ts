import rawPosts from "../data/posts.json";
import { Post } from "@/types/post";

const posts: Post[] = rawPosts as Post[];

const sortedPosts = [...posts].sort((a, b) => {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
});

export const getAllPosts = () => [...sortedPosts];

export const findPostById = (id: string) =>
  sortedPosts.find((post) => post.id === id);
