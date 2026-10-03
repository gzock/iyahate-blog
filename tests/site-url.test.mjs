import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../scripts/lib/site-url.mjs";
import { publicSiteUrl } from "../site.config.mjs";

test("uses the repository's public origin without an environment override", () => {
  assert.match(publicSiteUrl, /^https:\/\//);
  assert.equal(resolveSiteUrl(), publicSiteUrl);
  assert.equal(resolveSiteUrl(""), publicSiteUrl);
});

test("normalizes optional URL overrides and rejects invalid origins", () => {
  assert.equal(resolveSiteUrl("https://blog.example/"), "https://blog.example");
  for (const value of ["invalid", "file:///tmp", "https://user:pass@blog.example", "https://blog.example/path", "https://blog.example/?key=1", "https://blog.example/#fragment"]) {
    assert.throws(() => resolveSiteUrl(value), /SITE_URL/);
  }
});
