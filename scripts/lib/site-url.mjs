import { publicSiteUrl } from "../../site.config.mjs";

export function resolveSiteUrl(value) {
  let url;
  try {
    url = new URL(value || publicSiteUrl);
  } catch {
    throw new Error("SITE_URL must be a valid HTTP(S) origin.");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an HTTP(S) origin without credentials, a path, query or fragment.");
  }
  return url.origin;
}
