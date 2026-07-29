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
  const file = `frontend/dist/${route}.html`;

  if (!fs.existsSync(file)) {
    errors.push(`Missing Cloudflare static page: ${file}`);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");

  if (!html.includes(titleFragment)) {
    errors.push(`${file}: expected title fragment not found: ${titleFragment}`);
  }

  if (html.includes(`/${route}/`)) {
    errors.push(`${file}: unexpected trailing-slash route remains.`);
  }
}

const contact = fs.readFileSync("frontend/dist/contact.html", "utf8");
if (!contact.includes('src="/contact.js"')) {
  errors.push("contact.html does not load /contact.js.");
}

if (!fs.existsSync("frontend/dist/404.html")) {
  errors.push("Missing top-level 404.html; Cloudflare would enable SPA fallback.");
}

if (fs.existsSync("frontend/dist/_redirects")) {
  errors.push("Unexpected _redirects file remains in the build.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Cloudflare static-page route checks passed.");
