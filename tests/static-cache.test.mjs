import test from "node:test";
import assert from "node:assert/strict";
import { withNotFoundCache } from "../lib/static-cache.ts";

test("serves Next's namespaced 404 from the prerendered OpenNext cache", async () => {
  const calls = [];
  const value = { value: { type: "app", meta: { status: 404 }, html: "not found" }, lastModified: 1 };
  const cache = {
    name: "cf-static-assets-incremental-cache",
    get: async (key) => { calls.push(key); return key === "_not-found" ? value : null; },
    set: async () => { throw new Error("must never write to static cache"); },
    delete: async () => {},
  };
  const adapter = withNotFoundCache(cache);
  const key = `/route-cache/APP_PAGE/${"a".repeat(64)}/$/_not-found`;
  assert.equal(adapter.name, cache.name);
  assert.equal(await adapter.get(key, "cache"), value);
  assert.deepEqual(calls, [key, "_not-found"]);
  calls.length = 0;
  assert.equal(await adapter.get(key, "fetch"), null);
  assert.equal(await adapter.get("/posts/missing", "cache"), null);
  assert.deepEqual(calls, [key, "/posts/missing"]);
});

test("prefers native cache entries when OpenNext supports the new key", async () => {
  const entry = { value: { html: "cached" }, lastModified: 1 };
  let calls = 0;
  const adapter = withNotFoundCache({ name: "test", get: async () => { calls++; return entry; } });
  assert.equal(await adapter.get(`/route-cache/APP_PAGE/${"b".repeat(64)}/$/_not-found`), entry);
  assert.equal(calls, 1);
});
