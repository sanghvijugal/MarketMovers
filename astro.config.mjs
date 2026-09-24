// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://marketmovers.co.in",
  // Emit dutron.html (not dutron/index.html) so the URLs Google already
  // knows keep working.
  build: { format: "file" },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
