#!/usr/bin/env node

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(repositoryRoot, "frontend");
const publicRoot = path.join(frontendRoot, "public");
const checkOnly = process.argv.includes("--check");
const siteUrl = (process.env.SITE_URL || "https://tenthavenuewebdesign.com").replace(/\/+$/, "");

if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(siteUrl)) {
  throw new Error(`SITE_URL must be an HTTPS origin without a path: ${siteUrl}`);
}

const replaceableOrigins = [
  "https://tenth-avenue-web-design.pages.dev",
  "http://tenth-avenue-web-design.pages.dev",
  "https://www.tenthavenuewebdesign.com",
  "http://www.tenthavenuewebdesign.com",
  "http://tenthavenuewebdesign.com",
  "https://tenthavenuewebdesign.com.au",
  "https://www.tenthavenuewebdesign.com.au",
];

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }

  return files;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const publicFiles = await walk(publicRoot);
const candidates = [path.join(frontendRoot, "index.html"), ...publicFiles]
  .filter((file) => /\.(?:html?|xml|txt|json|webmanifest)$/i.test(file));

const changed = [];
const errors = [];

for (const file of candidates) {
  const original = await readFile(file, "utf8");
  let updated = original;

  for (const origin of replaceableOrigins) {
    updated = updated.replace(new RegExp(escapeRegExp(origin), "g"), siteUrl);
  }

  if (updated.includes("tenth-avenue-web-design.pages.dev")) {
    errors.push(`${path.relative(repositoryRoot, file)} still contains the preview origin.`);
  }

  if (/\.html?$/i.test(file) && /<link\s+rel=["']canonical["']/i.test(updated)) {
    const canonical = updated.match(
      /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
    )?.[1];

    if (!canonical?.startsWith(`${siteUrl}/`)) {
      errors.push(
        `${path.relative(repositoryRoot, file)} has an invalid canonical URL: ${canonical || "missing"}`,
      );
    }
  }

  if (updated !== original) {
    changed.push(path.relative(repositoryRoot, file));
    if (!checkOnly) await writeFile(file, updated);
  }
}

const sitemapPath = path.join(publicRoot, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
if (!sitemap.includes(`${siteUrl}/`)) {
  errors.push("frontend/public/sitemap.xml does not contain the production origin.");
}

const robotsPath = path.join(publicRoot, "robots.txt");
const robots = await readFile(robotsPath, "utf8");
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  errors.push("frontend/public/robots.txt does not advertise the production sitemap.");
}

if (checkOnly && changed.length) {
  errors.push(`Run "npm run site:url" to normalise: ${changed.join(", ")}`);
}

if (errors.length) {
  console.error(errors.map((message) => `- ${message}`).join("\n"));
  process.exit(1);
}

if (changed.length) {
  console.log(`${checkOnly ? "Would update" : "Updated"} ${changed.length} production URL file(s):`);
  for (const file of changed) console.log(`  ${file}`);
} else {
  console.log(`Production URLs are normalised to ${siteUrl}.`);
}
