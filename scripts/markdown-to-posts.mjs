#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const cwd = process.cwd();
const inputDir = path.resolve(cwd, process.argv[2] ?? "content/posts");
const outputDir = path.resolve(cwd, process.argv[3] ?? "public/posts");

if (!fs.existsSync(inputDir)) {
  console.error(`Input directory not found: ${inputDir}`);
  process.exit(1);
}

const markdownFiles = fs
  .readdirSync(inputDir)
  .filter((file) => file.toLowerCase().endsWith(".md"));

if (markdownFiles.length === 0) {
  console.error(`No markdown files found in ${inputDir}`);
  process.exit(1);
}

const posts = markdownFiles.map((fileName) => {
  const fullPath = path.join(inputDir, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const { sections, introText } = extractSections(content);
  const lead = deriveLead(introText, data.lead, sections);

  return {
    id: data.id ?? path.parse(fileName).name,
    title: data.title ?? path.parse(fileName).name,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    lead,
    sections,
  };
});

posts.sort(
  (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const manifest = posts.map((post) => ({
  id: post.id,
  title: post.title,
  updatedAt: post.updatedAt,
  lead: post.lead,
  sectionHeadings: post.sections.map((section) => section.heading),
  searchIndex: buildSearchIndex(post),
}));

fs.writeFileSync(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

posts.forEach((post) => {
  fs.writeFileSync(
    path.join(outputDir, `${post.id}.json`),
    JSON.stringify(post, null, 2) + "\n",
    "utf8"
  );
});

console.log(
  `Generated ${posts.length} posts → ${path.relative(cwd, outputDir)}`
);

function extractSections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let currentHeading = null;
  let buffer = [];

  const pushSection = () => {
    if (!currentHeading) {
      return;
    }
    const body = buffer.join("\n").trim();
    if (body.length === 0) {
      return;
    }
    sections.push({ heading: currentHeading, body });
  };

  let introBuffer = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("# ")) {
      // Skip top-level titles; rely on frontmatter instead.
      continue;
    }

    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      pushSection();
      currentHeading = headingMatch[1].trim();
      buffer = [];
      continue;
    }

    if (currentHeading) {
      buffer.push(line);
    } else {
      introBuffer.push(line);
    }
  }

  pushSection();

  if (sections.length === 0) {
    const fallbackBody = lines.join("\n").trim();
    if (fallbackBody.length) {
      sections.push({ heading: "本文", body: fallbackBody });
    }
  }

  return { sections, introText: introBuffer.join("\n").trim() };
}

function deriveLead(introText, explicitLead, sections) {
  if (explicitLead) {
    return explicitLead;
  }

  if (introText.length) {
    const paragraph = introText
      .split(/\n{2,}/)
      .map((block) => block.replace(/\n+/g, " ").trim())
      .find((block) => block.length);
    if (paragraph) {
      return paragraph;
    }
  }

  const firstSectionBody = sections[0]?.body;
  if (firstSectionBody) {
    return firstSectionBody.split(/\n{2,}/)[0].replace(/\n+/g, " ").trim();
  }

  return "";
}

function buildSearchIndex(post, maxLength = 1200) {
  const text = [
    post.title,
    post.lead,
    ...post.sections.map((section) => `${section.heading} ${section.body}`),
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, maxLength);
}
