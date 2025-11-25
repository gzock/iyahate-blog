import { Post, PostSummary } from "@/types/post";

const manifestCache: { data: PostSummary[] | null } = { data: null };
const postCache = new Map<string, Post>();
const isDev = process.env.NODE_ENV === "development";

const manifestUrl = "/posts/manifest.json";
const postUrl = (id: string) => `/posts/${id}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const cacheMode: RequestCache = isDev ? "no-store" : "force-cache";
  const response = await fetch(url, { cache: cacheMode });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function fetchPostManifest(): Promise<PostSummary[]> {
  if (!isDev && manifestCache.data) {
    return manifestCache.data;
  }

  const data = await fetchJson<PostSummary[]>(manifestUrl);
  if (!isDev) {
    manifestCache.data = data;
  }
  return data;
}

export async function fetchPostById(id: string): Promise<Post | null> {
  if (!isDev && postCache.has(id)) {
    return postCache.get(id)!;
  }

  try {
    const post = await fetchJson<Post>(postUrl(id));
    if (!isDev && post) {
      postCache.set(id, post);
    }
    return post;
  } catch (error) {
    return null;
  }
}
