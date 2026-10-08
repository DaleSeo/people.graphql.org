import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workingGroups = [
  "graphql-wg",
  "graphiql",
  "graphql-over-http",
  "ai-wg",
  "composite-schemas-wg",
  "community-wg",
  "otel-wg",
  "golden-path-wg",
  "graphql-js-wg",
  "nullability-wg",
  "defer-stream-wg",
];

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const reposDirectory = join(repoRoot, "repos");
const outputDirectory = join(repoRoot, "src", "content", "wgs");
const wgutils = join(repoRoot, "node_modules", "wgutils", "dist", "cli.js");
const summarizer = join(repoRoot, "scripts", "wg-summarize.mts");

async function run(
  command: string,
  args: string[],
  cwd?: string,
  input?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "inherit"],
    });
    let stdout = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
    });
    child.stdin.end(input);
  });
}

async function syncWorkingGroup(workingGroup: string): Promise<void> {
  const repository = join(reposDirectory, workingGroup);

  try {
    await run("git", ["rev-parse", "--is-inside-work-tree"], repository);
    await run("git", ["pull", "--rebase"], repository);
  } catch (error) {
    // Only clone when the repository is absent. A broken existing checkout
    // should be fixed deliberately rather than overwritten.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await run("git", [
      "clone",
      `https://github.com/graphql/${workingGroup}.git`,
      repository,
    ]);
  }

  const details = await run(
    process.execPath,
    [wgutils, "agenda", "details", "--json"],
    repository,
  );
  const summary = await run(process.execPath, [summarizer], undefined, details);
  await writeFile(join(outputDirectory, `${workingGroup}.json`), summary);
}

await mkdir(reposDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

for (const workingGroup of workingGroups) {
  console.log(`Syncing ${workingGroup}`);
  await syncWorkingGroup(workingGroup);
}
