import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { matchesSearch } from "../src/lib/search.ts";
import {
  isActive,
  entriesFor,
  pageFor,
  people,
  memberships,
  pages,
} from "../src/lib/directory.ts";
const now = new Date("2026-10-08T12:00:00Z");
const base = { person: "example", page: "wg/spec", label: "Specification WG" };

test("search matches username substrings and word beginnings in other fields", () => {
  const jem = entriesFor(pageFor("")).find(
    (person) => person.slug === "jemgillam",
  )!;
  assert.equal(matchesSearch(jem, "phi"), false);
  assert.equal(matchesSearch(jem, "gill"), true);
  const example = {
    ...jem,
    name: "Élodie Smith-Jones",
    githubUsername: "example",
    location: "Philadelphia",
    organization: "Graphile",
    memberships: [
      { person: "example", page: "wg/spec", label: "Specification WG" },
    ],
    articles: [
      {
        title: "Building GraphQL Together",
        description: "",
        href: "/story/",
        publishedAt: "2026-01-01",
        recordedAt: "2025-12-01",
      },
    ],
  };
  assert.equal(matchesSearch(example, "smith phi"), true);
  assert.equal(matchesSearch(example, "ample\t spec\nÉlo"), true);
  assert.equal(matchesSearch(example, "together building"), true);
  assert.equal(matchesSearch(example, "smith phile"), false);
  assert.equal(matchesSearch(example, "smith missing"), false);
  for (const query of [
    "Élo",
    "smith-j",
    "jones",
    "phi",
    "graph",
    " spec",
    "together",
    "building graph",
    "ample",
    "",
  ])
    assert.equal(matchesSearch(example, query), true, query);
  for (const query of [
    "lodie",
    "mith",
    "adelphia",
    "phile",
    "ification",
    "ogether",
    "[",
  ])
    assert.equal(matchesSearch(example, query), false, query);
});

test("Stars cards match their person's GitHub username and class year", () => {
  for (const year of ["2024", "2025", "2026"]) {
    const entries = entriesFor(pageFor(`stars/${year}`));
    for (const entry of entries) {
      const expected = `/stars/${year}/${entry.githubUsername?.toLowerCase()}.png`;
      assert.equal(entry.memberships.length, 1);
      const exists = existsSync(
        new URL(`../public${expected}`, import.meta.url),
      );
      assert.equal(entry.memberships[0].image, exists ? expected : undefined);
    }
  }
});

test("the 2026 Stars roster exactly matches the definitive card list", () => {
  const cards = readdirSync(new URL("../public/stars/2026/", import.meta.url))
    .filter((file) => file.endsWith(".png"))
    .map((file) => `/stars/2026/${file}`)
    .sort();
  const entries = entriesFor(pageFor("stars/2026"));
  assert.equal(entries.length, 52);
  assert.deepEqual(
    entries.map((entry) => entry.memberships[0].image).sort(),
    cards,
  );
});

test("Yassin's Stars and talks share his canonical profile and correct GitHub username", () => {
  assert.equal(people["yassineeldeeb"], undefined);
  assert.equal(people["yassineldeeb"].githubUsername, "YassinEldeeb");
  const records = memberships.filter((m) => m.person === "yassineldeeb");
  for (const year of ["2024", "2025"])
    assert.equal(
      records.find((m) => m.page === `stars/${year}`)?.image,
      `/stars/${year}/yassineldeeb.png`,
    );
  assert.ok(records.some((m) => m.page.startsWith("speakers/")));
  assert.ok(!memberships.some((m) => m.person === "yassineeldeeb"));
});

test("explicit emeritus status overrides dates; missing dates do not imply inactivity", () => {
  assert.equal(
    isActive({ ...base, emeriti: true, lastActive: "2026-10-01" }, now),
    false,
  );
  assert.equal(
    isActive({ ...base, emeriti: false, lastActive: "2020-01-01" }, now),
    true,
  );
  assert.equal(isActive(base, now), true);
});
test("working group activity uses two calendar years, including the boundary day", () => {
  assert.equal(isActive({ ...base, lastActive: "2024-10-07" }, now), false);
  assert.equal(isActive({ ...base, lastActive: "2024-10-08" }, now), true);
  assert.equal(isActive({ ...base, lastActive: "2025-10-08" }, now), true);
});
test("memberships resolve to canonical people and pages; source identities are unique", () => {
  const ids = new Set<string>();
  for (const [slug, p] of Object.entries(people)) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const id of p.sourceIds) {
      assert.ok(!ids.has(id), `Duplicate identity ${id}`);
      ids.add(id);
    }
  }
  for (const m of memberships) {
    assert.ok(people[m.person]);
    assert.ok(pageFor(m.page));
  }
});
test("every directory deduplicates people and has unique anchors", () => {
  for (const page of pages) {
    const entries = entriesFor(page);
    assert.equal(
      entries.length,
      new Set(entries.map((e) => e.slug)).size,
      page.slug,
    );
    assert.equal(
      entries.length,
      new Set(entries.map((e) => e.anchor)).size,
      page.slug,
    );
  }
});
test("known identities connect across sources and membership status stays contextual", () => {
  const benjie = entriesFor(pageFor("")).find((p) => p.slug === "benjie")!;
  assert.ok(benjie.memberships.some((m) => m.page === "wg/tsc"));
  assert.ok(benjie.memberships.some((m) => m.page.startsWith("stars/")));
  assert.ok(benjie.memberships.some((m) => m.page.startsWith("speakers/")));
  assert.equal(
    entriesFor(pageFor("wg/tsc")).find((p) => p.slug === "enisdenjo")!.active,
    false,
  );
  assert.equal(
    entriesFor(pageFor("stars/2025")).find((p) => p.slug === "enisdenjo")!
      .active,
    true,
  );
  assert.equal(
    entriesFor(pageFor("")).find((p) => p.slug === "enisdenjo")!.active,
    true,
  );
});
test("class sizes and explicit rosters are preserved", () => {
  for (const year of ["2024", "2025", "2026"])
    assert.equal(entriesFor(pageFor(`stars/${year}`)).length, 52);
  const tsc = entriesFor(pageFor("wg/tsc"));
  assert.equal(tsc.filter((p) => p.active).length, 11);
  assert.equal(tsc.filter((p) => !p.active).length, 11);
  assert.equal(
    entriesFor(pageFor("ambassadors")).filter((p) => !p.active).length,
    6,
  );
});

test("current TSC borders are consistent across directories regardless of historical flags", () => {
  const current = new Set(
    memberships
      .filter((m) => m.page === "wg/tsc" && m.emeriti === false)
      .map((m) => m.person),
  );
  assert.equal(current.size, 11);
  for (const page of pages) {
    for (const entry of entriesFor(page))
      assert.equal(
        entry.currentTsc,
        current.has(entry.slug),
        `${page.slug}: ${entry.slug}`,
      );
  }
  const stars = entriesFor(pageFor("stars/2024"));
  assert.equal(stars.find((p) => p.slug === "enisdenjo")!.currentTsc, false);
  assert.equal(stars.find((p) => p.slug === "benjie")!.currentTsc, true);
});

test("current ambassador status is shared across pages and excludes emeriti", () => {
  const current = new Set(
    memberships
      .filter((m) => m.page === "ambassadors" && m.emeriti === false)
      .map((m) => m.person),
  );
  for (const page of pages) {
    for (const entry of entriesFor(page))
      assert.equal(
        entry.currentAmbassador,
        current.has(entry.slug),
        `${page.slug}: ${entry.slug}`,
      );
  }
  const all = entriesFor(pageFor(""));
  assert.equal(
    all.find((p) => p.slug === "jemgillam")!.currentAmbassador,
    true,
  );
  assert.equal(all.find((p) => p.slug === "dondonz")!.currentAmbassador, false);
});

test("Local organizers resolve to existing profiles and give Alf global active status", async () => {
  const { locals, localsForPerson } = await import("../src/lib/directory.ts");
  for (const local of locals) {
    for (const organizer of local.organizers) {
      if (organizer.person) assert.ok(people[organizer.person], organizer.name);
    }
  }
  assert.deepEqual(
    locals.flatMap((local) =>
      local.organizers.filter((o) => !o.person).map((o) => o.name),
    ),
    ["Graham Vasquez", "Sebastien Lavoie-Courchesne", "Alexandre Ravenelle"],
  );
  assert.equal(localsForPerson("alf")[0].name, "GraphQL Oslo");
  assert.equal(
    entriesFor(pageFor("")).find((p) => p.slug === "alf")?.active,
    true,
  );
  assert.equal(
    entriesFor(pageFor("wg")).find((p) => p.slug === "alf")?.active,
    false,
  );
});

test("every directory uses the shared shuffle without losing people", () => {
  const originalRandom = Math.random;
  try {
    for (const page of pages) {
      Math.random = () => 0.999999;
      const unchanged = entriesFor(page).map((p) => p.slug);
      Math.random = () => 0;
      const shuffled = entriesFor(page).map((p) => p.slug);
      assert.deepEqual([...shuffled].sort(), [...unchanged].sort());
      if (unchanged.length > 1)
        assert.notDeepEqual(shuffled, unchanged, page.slug);
    }
  } finally {
    Math.random = originalRandom;
  }
});
