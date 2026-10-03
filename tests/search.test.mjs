import test from "node:test";
import assert from "node:assert/strict";
import { loadSearchIndex, searchPosts } from "../lib/search.ts";

const entry = { id: "test", title: "ＪＩＴ", publishedAt: "2026-01-01", text: "先頭".repeat(1000) + "後半の言葉" };

test("searches full article text, normalizes width/case, and supports multiple terms", () => {
  assert.deepEqual(searchPosts([entry], "jit 後半の言葉"), [entry]);
  assert.deepEqual(searchPosts([entry], "存在しない"), []);
  assert.deepEqual(searchPosts([entry], " "), []);
});

test("shares in-flight requests, validates responses, and retries failures", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return Response.json([entry]);
  });
  const [a, b] = await Promise.all([loadSearchIndex("/ok"), loadSearchIndex("/ok")]);
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
  await loadSearchIndex("/ok");
  assert.equal(calls, 1);
  globalThis.fetch.mock.mockImplementation(async () => new Response("unavailable", { status: 503 }));
  await assert.rejects(loadSearchIndex("/retry"));
  globalThis.fetch.mock.mockImplementation(async () => Response.json([entry]));
  assert.deepEqual(await loadSearchIndex("/retry"), [entry]);
  globalThis.fetch.mock.mockImplementation(async () => Response.json([{ id: 1 }]));
  await assert.rejects(loadSearchIndex("/invalid"), /Invalid search index/);
});
