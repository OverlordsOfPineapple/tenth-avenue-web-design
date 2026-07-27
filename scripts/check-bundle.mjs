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
const js = assets.filter((file) => file.endsWith(".js"));
const css = assets.filter((file) => file.endsWith(".css"));

function gzipTotal(files) {
  return files.reduce((total, file) => {
    return total + zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length;
  }, 0);
}

const jsGzip = gzipTotal(js);
const cssGzip = gzipTotal(css);
const jsLimit = 12 * 1024;
const cssLimit = 15 * 1024;

console.log(`JavaScript gzip: ${(jsGzip / 1024).toFixed(2)} kB`);
console.log(`CSS gzip: ${(cssGzip / 1024).toFixed(2)} kB`);

if (jsGzip > jsLimit) {
  throw new Error(`JavaScript exceeds ${(jsLimit / 1024).toFixed(0)} kB gzip budget.`);
}
if (cssGzip > cssLimit) {
  throw new Error(`CSS exceeds ${(cssLimit / 1024).toFixed(0)} kB gzip budget.`);
}

for (const image of [
  "frontend/dist/tenth-avenue-home-1536.avif",
  "frontend/dist/tenth-avenue-home-1536.webp",
  "frontend/dist/tenth-avenue-home-768.avif",
  "frontend/dist/tenth-avenue-home-768.webp",
]) {
  if (!fs.existsSync(image) || fs.statSync(image).size === 0) {
    throw new Error(`Missing optimised hero asset: ${image}`);
  }
}

console.log("Bundle and responsive-image checks passed.");
