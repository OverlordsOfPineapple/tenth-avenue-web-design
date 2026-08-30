import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const configDirectory = dirname(fileURLToPath(import.meta.url));
const pageNames = [
  "services",
  "about",
  "process",
  "contact",
  "privacy",
  "terms",
];

function resolvePageTarget(pageName) {
  const flatPage = join(configDirectory, "public", `${pageName}.html`);

  if (existsSync(flatPage)) {
    return `/${pageName}.html`;
  }

  return `/${pageName}/index.html`;
}

const pageRoutes = new Map();

for (const pageName of pageNames) {
  const target = resolvePageTarget(pageName);
  pageRoutes.set(`/${pageName}`, target);
  pageRoutes.set(`/${pageName}/`, target);
}

function rewriteCleanPageRequest(request, _response, next) {
  if (!request.url) {
    next();
    return;
  }

  const url = new URL(request.url, "http://vite.local");
  const target = pageRoutes.get(url.pathname);

  if (target) {
    request.url = `${target}${url.search}`;
  }

  next();
}

function cleanPageRoutesPlugin() {
  return {
    name: "tenth-avenue-clean-page-routes",

    configureServer(server) {
      server.middlewares.use(rewriteCleanPageRequest);
    },

    configurePreviewServer(server) {
      server.middlewares.use(rewriteCleanPageRequest);
    },
  };
}

export default defineConfig({
  plugins: [cleanPageRoutesPlugin()],

  server: {
    port: 5175,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 5175,
    host: "0.0.0.0",
  },
});
