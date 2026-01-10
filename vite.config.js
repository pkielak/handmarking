import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    open: true,
  },
  esbuild: {
    loader: "ts",
    include: /\.ts?$/,
  },
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    rollupOptions: {
      input: "index.html",
    },
  },
});
