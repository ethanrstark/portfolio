import { defineConfig } from "vite";
import path from "path";

// Link-preview tags (og:image, og:url) need an absolute URL. Use SITE_URL if set,
// otherwise the production domain Vercel exposes at build time.
function siteUrl(): string {
  const url = process.env.SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "";
  if (!url) return "";
  return (/^https?:\/\//.test(url) ? url : `https://${url}`).replace(/\/$/, "");
}

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl()),
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
