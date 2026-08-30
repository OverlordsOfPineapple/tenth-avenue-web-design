import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(location) : [location];
  });
}

const assets = walk("frontend/dist/assets");
const js = [
  ...assets.filter((file) => file.endsWith(".js")),
  "frontend/dist/contact.js",
].filter(fs.existsSync);
const css = [
  ...assets.filter((file) => file.endsWith(".css")),
  "frontend/dist/seo-pages.css",
].filter(fs.existsSync);

function gzipTotal(files) {
  return files.reduce((total, file) => {
    return total + zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length;
  }, 0);
}

const jsGzip = gzipTotal(js);
const cssGzip = gzipTotal(css);
const jsLimit = 6 * 1024;
const cssLimit = 10 * 1024;

console.log(`JavaScript gzip: ${(jsGzip / 1024).toFixed(2)} kB`);
console.log(`CSS gzip: ${(cssGzip / 1024).toFixed(2)} kB`);

if (jsGzip > jsLimit) {
  throw new Error(`JavaScript exceeds ${(jsLimit / 1024).toFixed(0)} kB gzip budget.`);
}
if (cssGzip > cssLimit) {
  throw new Error(`CSS exceeds ${(cssLimit / 1024).toFixed(0)} kB gzip budget.`);
}

const imageBudgets = new Map([
  ["frontend/dist/tenth-avenue-home-1536.avif", 100 * 1024],
  ["frontend/dist/tenth-avenue-home-1536.webp", 140 * 1024],
  ["frontend/dist/tenth-avenue-home-768.avif", 50 * 1024],
  ["frontend/dist/tenth-avenue-home-768.webp", 70 * 1024],
]);

for (const [image, limit] of imageBudgets) {
  if (!fs.existsSync(image)) throw new Error(`Missing image: ${image}`);
  const size = fs.statSync(image).size;
  if (size > limit) {
    throw new Error(`${image} exceeds ${(limit / 1024).toFixed(0)} kB budget.`);
  }
}

const homeHtml = fs.readFileSync("frontend/index.html", "utf8");
if (homeHtml.includes('<img src="/tenth-avenue-home.png"')) {
  throw new Error("Homepage must not use the 1.7 MB PNG as its browser fallback.");
}

for (const image of [
  "frontend/dist/tenth-avenue-home-1536.avif",
  "frontend/dist/tenth-avenue-home-1536.webp",
  "frontend/dist/tenth-avenue-home-768.avif",
  "frontend/dist/tenth-avenue-home-768.webp",
  "frontend/dist/visuals/services-responsive.svg",
  "frontend/dist/visuals/about-workspace.svg",
  "frontend/dist/visuals/process-flow.svg",
]) {
  if (!fs.existsSync(image) || fs.statSync(image).size === 0) {
    throw new Error(`Missing optimised hero asset: ${image}`);
  }
}

console.log("Bundle and responsive-image checks passed.");
