import fs from "node:fs";
import { spawn } from "node:child_process";
import { generatePosts } from "./lib/content.mjs";

generatePosts(process.cwd());
let timer;
const watcher = fs.watch("content/posts", (_event, file) => {
  if (file && !file.toLowerCase().endsWith(".md")) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      const data = generatePosts(process.cwd());
      console.log(`Updated ${data.posts.length} published posts`);
    } catch (error) {
      console.error(`Article update failed; keeping the last valid preview.\n${error.message}`);
    }
  }, 150);
});
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", ...process.argv.slice(2)], { stdio: "inherit" });
function stop(signal) {
  watcher.close();
  clearTimeout(timer);
  next.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
next.on("exit", (code) => {
  watcher.close();
  clearTimeout(timer);
  process.exitCode = code ?? 0;
});
