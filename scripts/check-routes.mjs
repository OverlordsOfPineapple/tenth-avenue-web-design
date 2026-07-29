import fs from "node:fs";

const routes = {
  services: "Web Design Services Central Coast NSW",
  portfolio: "Web Design Portfolio Central Coast",
  about: "About Tenth Avenue Web Design",
  process: "Web Design Process",
  contact: "Contact Tenth Avenue Web Design",
  privacy: "Privacy Policy",
  terms: "Website Terms",
};

const errors = [];

for (const [route, titleFragment] of Object.entries(routes)) {
  const file = `frontend/dist/${route}/index.html`;

  if (!fs.existsSync(file)) {
    errors.push(`Missing physical route file: ${file}`);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  if (!html.includes(titleFragment)) {
    errors.push(`${file}: expected title fragment not found: ${titleFragment}`);
  }
}

if (!fs.existsSync("frontend/dist/404.html")) {
  errors.push("Missing top-level frontend/dist/404.html; Cloudflare may enable SPA fallback.");
}

if (!fs.existsSync("frontend/dist/_redirects")) {
  errors.push("Missing frontend/dist/_redirects.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Physical route and Cloudflare fallback checks passed.");
