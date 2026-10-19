import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  mkdtemp,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const aliases = await read("src/data/identity-aliases.json");
const people = new Map();
const identities = new Map();
for (const file of await readdir(path.join(root, "src/content/people"))) {
  if (!file.endsWith(".json")) continue;
  const person = await read(`src/content/people/${file}`);
  const slug = file.slice(0, -5);
  people.set(slug, person);
  for (const source of person.sourceIds) identities.set(source, slug);
}
const attendees = new Map();
for (const file of await readdir(path.join(root, "src/content/wgs"))) {
  if (!file.endsWith(".json")) continue;
  for (const attendee of (await read(`src/content/wgs/${file}`)).attendees) {
    const source = `github:${attendee.github.trim().replace(/^@/, "").toLowerCase()}`;
    const slug = aliases[source] ?? identities.get(source);
    const person = people.get(slug);
    if (
      !person?.githubUsername ||
      !/^[a-zA-Z0-9-]+$/.test(person.githubUsername)
    ) {
      throw new Error(
        `Unresolved GitHub identity: ${source}. Run directory:build and resolve aliases first.`,
      );
    }
    attendees.set(slug, person.githubUsername.toLowerCase());
  }
}
const staging = await mkdtemp(path.join(tmpdir(), "wg-avatars-"));
const usernames = [...new Set(attendees.values())].sort();
const downloaded = new Set();
const failures = [];
async function download(username) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://github.com/${username}.png?size=240`,
        {
          headers: { "User-Agent": "People-of-GraphQL-avatar-refresh" },
          signal: AbortSignal.timeout(30000),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await sharp(Buffer.from(await response.arrayBuffer()))
        .rotate()
        .resize(240, 240, { fit: "cover" })
        .png()
        .toFile(path.join(staging, `${username}.png`));
      downloaded.add(username);
      return;
    } catch (error) {
      if (attempt === 3 || /HTTP (404|410)/.test(error.message)) {
        failures.push({ username, error: error.message });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
}
try {
  for (let i = 0; i < usernames.length; i += 4) {
    await Promise.all(usernames.slice(i, i + 4).map(download));
    console.log(
      `Checked ${Math.min(i + 4, usernames.length)}/${usernames.length} GitHub avatars`,
    );
  }
  await mkdir(path.join(root, "public/avatars"), { recursive: true });
  for (const username of downloaded) {
    await copyFile(
      path.join(staging, `${username}.png`),
      path.join(root, `public/avatars/${username}.png`),
    );
  }
  for (const [slug, username] of attendees) {
    if (!downloaded.has(username)) continue;
    // Preserve any other profile edits made while the downloads were running.
    const person = await read(`src/content/people/${slug}.json`);
    person.avatarUrl = `/avatars/${username}.png`;
    await writeFile(
      path.join(root, `src/content/people/${slug}.json`),
      JSON.stringify(person, null, 2) + "\n",
    );
  }
  await writeFile(
    path.join(root, "public/avatars/wg-manifest.json"),
    JSON.stringify(
      {
        refreshedAt: new Date().toISOString(),
        source: "https://github.com/<username>.png?size=240",
        size: 240,
        usernames: [...downloaded].sort(),
        failures,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Updated ${downloaded.size} portraits and matching person records. ${failures.length} failures.`,
  );
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  await rm(staging, { recursive: true, force: true });
}
