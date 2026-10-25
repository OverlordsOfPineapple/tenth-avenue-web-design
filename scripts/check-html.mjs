import fs from "node:fs";
import path from "node:path";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(location) : [location];
  });
}

const files = [
  "frontend/index.html",
  ...walk("frontend/public").filter((name) => name.endsWith(".html")),
];

const errors = [];

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (!/^\s*<!doctype html>/i.test(html)) errors.push(`${file}: missing doctype`);
  if (!/<html[^>]+lang=["']en-AU["']/i.test(html)) errors.push(`${file}: missing lang="en-AU"`);
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) errors.push(`${file}: missing viewport meta`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${file}: missing title`);
  if (duplicates.length) errors.push(`${file}: duplicate ids: ${[...new Set(duplicates)].join(", ")}`);
  if (/<style(?:\s|>)/i.test(html)) errors.push(`${file}: inline style block found`);

  // Enquiries must never fall back to placing personal information in a URL.
  for (const [, attributes, contents] of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    if (!/\bmethod=["']post["']/i.test(attributes)) errors.push(`${file}: form must explicitly use POST`);
    if (!/\baction=["']\/api\/(contact|quote)["']/i.test(attributes)) errors.push(`${file}: missing enquiry endpoint`);
    if (!/<button[^>]*type=["']submit["'][^>]*\bdisabled\b/i.test(contents)) errors.push(`${file}: submit must remain disabled until JavaScript binds`);
    if (!/href=["']\/privacy["']/.test(contents)) errors.push(`${file}: missing form privacy link`);
  }

  const inlineExecutable = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => !/\bsrc=/i.test(match[1]))
    .filter((match) => !/type=["']application\/ld\+json["']/i.test(match[1]));
  if (inlineExecutable.length) errors.push(`${file}: inline executable script found`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`HTML checks passed for ${files.length} pages.`);
