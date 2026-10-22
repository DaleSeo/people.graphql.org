import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import directoryDev from "./scripts/directory-dev.mjs";
export default defineConfig({
  site: "https://people.graphql.org",
  vite: { plugins: [directoryDev()] },
  integrations: [react()],
  redirects: {
    "/profiles/zeljko-kozina/": "/profiles/zkozina/",
    "/stories/designing-graphql-for-the-people/":
      "/stories/raising-my-hand-for-graphql/",
  },
});
