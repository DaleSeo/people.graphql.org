import {
  readFile,
  readdir,
  writeFile,
  mkdtemp,
  copyFile,
  rm,
  access,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
const root = fileURLToPath(new URL("../", import.meta.url));
const year = Number(process.argv[2] ?? 2026);
if (!Number.isInteger(year) || year < 2023 || year > 2100)
  throw new Error("Provide a conference year.");
const read = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const exists = async (file) => {
  try {
    await access(path.join(root, file));
    return true;
  } catch {
    return false;
  }
};
const data = await read("src/data/directory.json");
const source = await read("src/content/talks/graphqlconf/speakers.json");
const overrides = await read("src/data/identity-aliases.json");
const identities = new Map();
const people = new Map();
for (const file of await readdir(path.join(root, "src/content/people"))) {
  if (!file.endsWith(".json")) continue;
  const p = await read(`src/content/people/${file}`);
  const slug = file.slice(0, -5);
  people.set(slug, p);
  for (const id of p.sourceIds) identities.set(id, slug);
}
const speakerAliases = new Map(
  source.equal.flatMap((group) => group.map((id) => [id, group[0]])),
);
const targets = new Set(
  data.memberships
    .filter((m) => m.page === `speakers/graphqlconf-${year}`)
    .map((m) => m.person),
);
const photos = new Map();
for (const s of source.speakers) {
  if (!s._years?.includes(year) || !s.avatar) continue;
  const id = `speaker:${speakerAliases.get(s.username) ?? s.username}`;
  const slug = overrides[id] ?? identities.get(id);
  if (!targets.has(slug)) continue;
  const url = new URL(s.avatar, `https://graphqlconf${year}.sched.com/`);
  if (
    url.protocol !== "https:" ||
    !["avatars.sched.co", `graphqlconf${year}.sched.com`].includes(url.hostname)
  )
    throw new Error(`Unexpected avatar URL: ${url}`);
  photos.set(slug, url.href);
}
const needed = [];
for (const slug of targets) {
  const p = people.get(slug);
  if (slug === "jemgillam") continue;
  if (
    p.avatarUrl !== "/avatars/jemgillam.png" &&
    (!p.avatarUrl.startsWith("/") || (await exists(`public${p.avatarUrl}`)))
  )
    continue;
  needed.push(slug);
}
const staging = await mkdtemp(path.join(tmpdir(), "sched-avatars-"));
const completed = [];
const failures = [];
async function download(slug) {
  const sourceUrl = photos.get(slug);
  if (!sourceUrl) {
    failures.push({ slug, error: "No photo URL in this event’s speaker data" });
    return;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(sourceUrl, {
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await sharp(Buffer.from(await response.arrayBuffer()))
        .rotate()
        .resize(240, 240, { fit: "cover" })
        .png()
        .toFile(path.join(staging, `${slug}.png`));
      completed.push({ slug, sourceUrl });
      return;
    } catch (error) {
      if (attempt === 3) {
        failures.push({ slug, error: error.message });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}
try {
  for (let i = 0; i < needed.length; i += 4) {
    await Promise.all(needed.slice(i, i + 4).map(download));
    console.log(
      `Checked ${Math.min(i + 4, needed.length)}/${needed.length} missing portraits`,
    );
  }
  for (const { slug } of completed) {
    await copyFile(
      path.join(staging, `${slug}.png`),
      path.join(root, `public/avatars/${slug}.png`),
    );
    const person = await read(`src/content/people/${slug}.json`);
    person.avatarUrl = `/avatars/${slug}.png`;
    await writeFile(
      path.join(root, `src/content/people/${slug}.json`),
      JSON.stringify(person, null, 2) + "\n",
    );
  }
  if (needed.length)
    await writeFile(
      path.join(root, `public/avatars/speakers-${year}-manifest.json`),
      JSON.stringify(
        {
          downloadedAt: new Date().toISOString(),
          event: `graphqlconf-${year}`,
          size: 240,
          portraits: completed.sort((a, b) => a.slug.localeCompare(b.slug)),
          failures,
        },
        null,
        2,
      ) + "\n",
    );
  console.log(
    `Saved ${completed.length} speaker portraits; ${failures.length} failures.`,
  );
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  await rm(staging, { recursive: true, force: true });
}
