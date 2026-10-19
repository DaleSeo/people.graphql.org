import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);

// Rebuild the shared directory when its source data changes during development.
export default function directoryDev() {
  return {
    name: "people-directory-refresh",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      let timer;
      let running = false;
      let pending = false;
      let closed = false;
      async function refresh() {
        if (closed || running) return;
        running = true;
        pending = false;
        try {
          await run(
            process.execPath,
            [path.join(root, "scripts/build-directory.mjs")],
            { cwd: root },
          );
          // Vite observes directory.json changes and updates its importers.
        } catch (error) {
          server.config.logger.error(
            `Directory refresh failed:\n${error.stderr || error.message}`,
          );
        } finally {
          running = false;
          if (pending && !closed) timer = setTimeout(refresh, 100);
        }
      }
      function changed(file) {
        const relative = path.relative(root, file).split(path.sep).join("/");
        if (!(
          relative.startsWith("src/content/") ||
          relative === "src/data/identity-aliases.json" ||
          relative === "src/config/directory-pages.mjs"
        ))
          return;
        pending = true;
        clearTimeout(timer);
        timer = setTimeout(refresh, 100);
      }
      server.watcher
        .on("add", changed)
        .on("change", changed)
        .on("unlink", changed);
      server.watcher.once("close", () => {
        closed = true;
        clearTimeout(timer);
      });
    },
  };
}
