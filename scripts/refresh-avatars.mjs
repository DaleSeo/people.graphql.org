import { readdir, readFile, writeFile, mkdir, mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = path.join(root, 'src/content/stars');
const destination = path.join(root, 'public/avatars');
const entries = [];
for (const year of await readdir(content, { withFileTypes: true })) {
  if (!year.isDirectory()) continue;
  for (const name of await readdir(path.join(content, year.name))) {
    if (!name.endsWith('.json')) continue;
    const file = path.join(content, year.name, name);
    const data = JSON.parse(await readFile(file, 'utf8'));
    if (!data.github) continue;
    if (!/^[a-zA-Z0-9-]+$/.test(data.github)) throw new Error(`Invalid GitHub username in ${file}`);
    entries.push({ file, data });
  }
}
const usernames = [...new Set(entries.map(({ data }) => data.github))].sort();
const staging = await mkdtemp(path.join(tmpdir(), 'people-avatars-'));

async function download(username) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`https://github.com/${username}.png?size=240`, {
        headers: { 'User-Agent': 'People-of-GraphQL-avatar-refresh' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      // The .png endpoint may return JPEG or WebP; always encode a real PNG.
      await sharp(bytes).rotate().resize(240, 240, { fit: 'cover' })
        .png().toFile(path.join(staging, `${username}.png`));
      return;
    } catch (error) {
      if (attempt === 3) throw new Error(`${username}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
}

try {
  // Stage every download before replacing any existing images or data.
  for (let i = 0; i < usernames.length; i += 3) {
    const batch = usernames.slice(i, i + 3);
    const results = await Promise.allSettled(batch.map(download));
    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length) throw new AggregateError(errors.map(result => result.reason), 'Avatar refresh failed; existing files were preserved.');
    console.log(`Downloaded ${Math.min(i + 3, usernames.length)}/${usernames.length} avatars`);
  }
  await mkdir(destination, { recursive: true });
  for (const username of usernames) {
    await copyFile(path.join(staging, `${username}.png`), path.join(destination, `${username}.png`));
  }
  for (const { file, data } of entries) {
    data.avatar = `/avatars/${data.github}.png`;
    await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  // Remove only superseded JPEG copies for the users successfully refreshed.
  for (const username of usernames) {
    for (const extension of ['jpg', 'jpeg']) {
      await rm(path.join(destination, `${username}.${extension}`), { force: true });
    }
  }
  await writeFile(path.join(destination, 'manifest.json'), `${JSON.stringify({
    refreshedAt: new Date().toISOString(),
    source: 'https://github.com/<username>.png?size=240',
    size: 240,
    usernames,
  }, null, 2)}\n`);
  console.log(`Refreshed ${usernames.length} local PNGs and ${entries.length} yearly entries.`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
