export type PostSummary = {
  id: string;
  title: string;
  publishedAt: string;
  updatedAt: string;
};

export type Post = PostSummary & {
  description: string;
  html: string;
};

export type SearchEntry = Pick<PostSummary, "id" | "title" | "publishedAt"> & {
  text: string;
};
