import type { CacheEntryType, IncrementalCache } from "@opennextjs/aws/types/overrides.js";

// Next 16.3 requests its built-in 404 with a namespaced route key, while
// OpenNext 1.20 emits that prerendered entry as _not-found.cache.
export function withNotFoundCache(cache: IncrementalCache): IncrementalCache {
  const adapter: IncrementalCache = Object.create(cache);
  adapter.get = async function <T extends CacheEntryType = "cache">(key: string, type?: T) {
    const entry = await cache.get(key, type);
    if (entry || (type !== undefined && type !== "cache")) return entry;
    if (/^\/route-cache\/APP_PAGE\/[a-f0-9]{64}\/\$\/_not-found$/.test(key)) {
      return cache.get("_not-found", type);
    }
    return null;
  };
  return adapter;
}
