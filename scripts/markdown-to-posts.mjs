#!/usr/bin/env node
import { generatePosts } from "./lib/content.mjs";

try {
  const data = generatePosts(process.cwd());
  console.log(`Generated ${data.posts.length} published posts`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
