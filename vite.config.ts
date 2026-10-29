import { defineConfig } from "vite";
import path from "path";

// Link-preview tags (og:image, og:url) need an absolute URL; override with SITE_URL
// if the domain changes.
const SITE_URL = (process.env.SITE_URL ?? "https://ethanstark.vercel.app").replace(/\/$/, "");

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", SITE_URL),
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
});
