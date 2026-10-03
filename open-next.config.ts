import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
import { withNotFoundCache } from "./lib/static-cache";

export default defineCloudflareConfig({
  incrementalCache: withNotFoundCache(staticAssetsIncrementalCache),
  enableCacheInterception: true,
});
