import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ESLint } from "eslint";
import nextPlugin from "@next/eslint-plugin-next";

test("Next link linting still resolves directory globs with the safe glob dependency", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-eslint-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const name of ["one", "two"]) {
    const pages = path.join(root, name, "pages");
    fs.mkdirSync(pages, { recursive: true });
    fs.writeFileSync(path.join(pages, `${name}.js`), "export default function Page() { return null; }");
  }
  for (const rootDir of [`${root}/{one,two}`, [`${root}/one`, `${root}/two`]]) {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [{
        files: ["**/*.jsx"],
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "@next/next": nextPlugin },
        settings: { next: { rootDir } },
        rules: { "@next/next/no-html-link-for-pages": "error" },
      }],
    });
    const [result] = await eslint.lintText('const links = <><a href="/one">One</a><a href="/two">Two</a><a href="https://example.com">External</a></>;', { filePath: "fixture.jsx" });
    assert.equal(result.errorCount, 2, JSON.stringify(result.messages));
    assert.ok(result.messages.every((message) => message.ruleId === "@next/next/no-html-link-for-pages"));
  }
});

test("lint file selection and ignores work with the patched minimatch major", async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      { ignores: ["**/generated/**"] },
      { files: ["src/**/*.{js,jsx}"], rules: { "no-undef": "error" } },
    ],
  });
  for (const filePath of ["src/nested/example.js", "src/nested/example.jsx"]) {
    const [result] = await eslint.lintText("unknownGlobal();", { filePath });
    assert.equal(result.errorCount, 1);
    assert.equal(result.messages[0].ruleId, "no-undef");
  }
  const [ignored] = await eslint.lintText("unknownGlobal();", { filePath: "src/generated/example.js" });
  assert.equal(ignored.errorCount, 0);
  assert.match(ignored.messages[0].message, /ignored/i);
});
