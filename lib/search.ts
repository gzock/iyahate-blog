import type { SearchEntry } from "@/types/post";

const requests = new Map<string, Promise<SearchEntry[]>>();

export function loadSearchIndex(url: string): Promise<SearchEntry[]> {
  const cached = requests.get(url);
  if (cached) return cached;
  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Search index: ${response.status}`);
      const entries: unknown = await response.json();
      if (!Array.isArray(entries) || !entries.every((entry) =>
        entry && typeof entry.id === "string" && typeof entry.title === "string" &&
        typeof entry.text === "string" && typeof entry.publishedAt === "string"
      )) throw new Error("Invalid search index");
      return entries as SearchEntry[];
    })
    .catch((error) => {
      requests.delete(url);
      throw error;
    });
  requests.set(url, request);
  return request;
}

export function searchPosts(entries: SearchEntry[], query: string) {
  const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("ja-JP");
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entries.filter((entry) => {
    const text = normalize(`${entry.title} ${entry.text}`);
    return terms.every((term) => text.includes(term));
  });
}
