import { defineConfig } from "vite";

export default defineConfig({
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
