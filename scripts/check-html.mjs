import fs from "node:fs";
import path from "node:path";

const files = [
  "frontend/index.html",
  ...fs.readdirSync("frontend/public")
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join("frontend/public", name)),
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
