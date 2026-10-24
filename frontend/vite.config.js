import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { transform } from "lightningcss";

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
      server.middlewares.use((request, response, next) => {
        // The public contact page uses the same URL in development and production.
        if (request.url?.split("?", 1)[0] === "/contact.js") {
          request.url = request.url.replace("/contact.js", "/src/contact.js");
        }
        rewriteCleanPageRequest(request, response, next);
      });
    },

    configurePreviewServer(server) {
      server.middlewares.use(rewriteCleanPageRequest);
    },
  };
}

// Vite copies public styles verbatim; minify the production copies only.
function minifyPublicStylesPlugin() {
  let outputDirectory;
  return {
    name: "tenth-avenue-public-styles",
    apply: "build",
    configResolved(config) {
      outputDirectory = join(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const file of readdirSync(join(configDirectory, "public"))) {
        if (!file.endsWith(".css")) continue;
        const target = join(outputDirectory, file);
        const { code } = transform({ filename: file, code: readFileSync(target), minify: true });
        writeFileSync(target, code);
      }
    },
  };
}

export default defineConfig({
  plugins: [cleanPageRoutesPlugin(), minifyPublicStylesPlugin()],

  build: {
    rollupOptions: {
      input: {
        index: join(configDirectory, "index.html"),
        contact: join(configDirectory, "src/contact.js"),
      },
      output: {
        entryFileNames: (chunk) => chunk.name === "contact" ? "contact.js" : "assets/[name]-[hash].js",
      },
    },
  },

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
