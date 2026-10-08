import test from "node:test";
import assert from "node:assert/strict";
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
    entriesFor(pageFor("stars/2026")).find((p) => p.slug === "enisdenjo")!
      .active,
    true,
  );
  assert.equal(
    entriesFor(pageFor("")).find((p) => p.slug === "enisdenjo")!.active,
    true,
  );
});
test("class sizes, explicit rosters and attendance order are preserved", () => {
  for (const year of ["2024", "2025", "2026"])
    assert.equal(entriesFor(pageFor(`stars/${year}`)).length, 52);
  const tsc = entriesFor(pageFor("wg/tsc"));
  assert.equal(tsc.filter((p) => p.active).length, 11);
  assert.equal(tsc.filter((p) => !p.active).length, 11);
  assert.equal(tsc[0].slug, "leebyron");
  assert.equal(
    entriesFor(pageFor("ambassadors")).filter((p) => !p.active).length,
    6,
  );
  const wg = entriesFor(pageFor("wg/spec"));
  for (let i = 1; i < wg.length; i++) assert.ok(wg[i - 1].count >= wg[i].count);
});
