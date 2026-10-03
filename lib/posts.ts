import "server-only";
import data from "@/.generated/posts.json";
import type { Post, PostSummary } from "@/types/post";

export const posts: Post[] = data.posts;
export const searchUrl: string = data.searchUrl;
export const summaries: PostSummary[] = posts.map(({ id, title, publishedAt, updatedAt }) => ({ id, title, publishedAt, updatedAt }));

export function getPost(id: string) {
  return posts.find((post) => post.id === id);
}
