import { readFile, access, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const data = JSON.parse(
  await readFile(
    new URL("../src/data/directory.json", import.meta.url),
    "utf8",
  ),
);
const root = new URL("../dist/", import.meta.url);
async function checkExternalLinks(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) count += await checkExternalLinks(file);
    else if (entry.name.endsWith(".html")) {
      const source = await readFile(file, "utf8");
      for (const [tag] of source.matchAll(/<a\b[^>]*>/g)) {
        if (!/\bhref="(?:https?:)?\/\//i.test(tag)) continue;
        assert.match(
          tag,
          /\btarget="_blank"/,
          `External link target: ${file.pathname}: ${tag}`,
        );
        const rel = tag.match(/\brel="([^"]*)"/)?.[1].split(/\s+/) ?? [];
        assert.ok(
          rel.includes("noopener") && rel.includes("noreferrer"),
          `External link rel: ${file.pathname}: ${tag}`,
        );
        count++;
      }
    }
  }
  return count;
}
console.log(
  `Verified ${await checkExternalLinks(root)} external links open in new tabs across the built site.`,
);
const paths = [
  ...data.pages.map((p) => p.slug),
  ...Object.keys(data.people).map((s) => `profiles/${s}`),
];
const cache = new Map();
async function html(route) {
  if (!cache.has(route))
    cache.set(
      route,
      await readFile(
        new URL(`${route ? route + "/" : ""}index.html`, root),
        "utf8",
      ),
    );
  return cache.get(route);
}
for (const route of paths) {
  const source = await html(route);
  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate HTML id: ${route}`);
  for (const [, value] of source.matchAll(/\s(?:href|src)="(\/[^" ]*)"/g)) {
    if (value.startsWith("//")) continue;
    const target = new URL(value.replaceAll("&amp;", "&"), "http://localhost");
    const pathname = decodeURIComponent(target.pathname);
    const file = pathname.endsWith("/") ? pathname + "index.html" : pathname;
    await access(new URL(file.slice(1), root));
    if (target.hash && pathname.endsWith("/")) {
      const targetHTML = await html(pathname.replace(/^\/|\/$/g, ""));
      assert.ok(
        targetHTML.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`),
        `Broken anchor ${value} on ${route}`,
      );
    }
  }
}
console.log(
  `Verified ${paths.length} directory/profile pages: unique IDs, local assets, internal links and profile anchors.`,
);
