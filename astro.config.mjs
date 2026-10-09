import { defineConfig } from "astro/config";
import react from "@astrojs/react";
export default defineConfig({
  integrations: [react()],
  redirects: { "/profiles/zeljko-kozina/": "/profiles/zkozina/" },
});
