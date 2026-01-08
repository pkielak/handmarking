import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  esbuild: {
    loader: "ts",
    include: /\.ts?$/,
  },
  base: process.env.VITE_BASE_PATH || "/handmarking/",
  build: {
    rollupOptions: {
      input: "index.html",
    },
  },
});
