import { Post, PostSummary } from "@/types/post";

const manifestCache: { data: PostSummary[] | null } = { data: null };
const postCache = new Map<string, Post>();

const manifestUrl = "/posts/manifest.json";
const postUrl = (id: string) => `/posts/${id}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function fetchPostManifest(): Promise<PostSummary[]> {
  if (manifestCache.data) {
    return manifestCache.data;
  }

  const data = await fetchJson<PostSummary[]>(manifestUrl);
  manifestCache.data = data;
  return data;
}

export async function fetchPostById(id: string): Promise<Post | null> {
  if (postCache.has(id)) {
    return postCache.get(id)!;
  }

  try {
    const post = await fetchJson<Post>(postUrl(id));
    postCache.set(id, post);
    return post;
  } catch (error) {
    return null;
  }
}
