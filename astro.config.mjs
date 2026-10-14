import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import directoryDev from "./scripts/directory-dev.mjs";
export default defineConfig({
  vite: { plugins: [directoryDev()] },
  integrations: [react()],
  redirects: { "/profiles/zeljko-kozina/": "/profiles/zkozina/" },
});
