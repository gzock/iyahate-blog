import { cpSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR } from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Direct Wrangler uploads do not run OpenNext's cache population step.
// Stage the prerendered cache before Wrangler collects the assets to upload.
if (process.env.WRANGLER_COMMAND !== "types") {
  cpSync(".open-next/cache", join(".open-next/assets", CACHE_DIR), { recursive: true });
  console.log("Prepared prerendered pages for Workers Static Assets.");
}
