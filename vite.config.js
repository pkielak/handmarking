import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  esbuild: {
    loader: "ts",
    include: /\.ts?$/,
  },
  build: {
    rollupOptions: {
      input: "index.html",
    },
  },
});
