# People of GraphQL

An Astro publication for personal interviews and an annual GraphQL Stars gallery.

## Run locally

Use Node.js 22.19 or newer (required by a transitive dependency). The initial build was also verified on Node.js 22.14, which reports an engine warning.

```sh
npm install
npm run dev
```

Open http://localhost:4321.  
Run `npm run check` for Astro/TypeScript validation  
Run `npm run build` to generate the static site in `dist/`.  
`npm run preview` serves that build locally.

## Pages

- `/`: editorial homepage with a featured story and Stars introduction.
- `/stories/`: interview archive.
- `/stories/[id]/`: individual Markdown stories.
- `/stars/`: year selection, search, and expandable contributor profiles.
- `/about/`: project introduction.

## Content

The three interviews remain **fictional samples**.

Each Stars collection contains the 52 Star GitHub usernames, with public display names and bios retrieved from GitHub on 2026-09-14. Profile text is stored locally; builds do not call the GitHub API.

### Stories

Add Markdown files to `src/content/stories/`. The filename becomes the URL slug.

Frontmatter fields:

```yaml
---
title: A story headline
name: Interview subject
description: A short introduction to the story
category: Community & belonging
color: "#797d67"
initials: IS
order: 0
sample: false
---
```

Write the approved article beneath the frontmatter. The lowest `order` is featured on the homepage. The current visual templates use initials artwork; replace this with approved portrait photography when available. Remove preview wording and placeholder reading times in the homepage/archive/article templates when preparing actual publication.

### Stars

Add one JSON file per person inside `src/content/stars/<year>/`. For example, `2025/benjie.json` and `2026/benjie.json` are independent entries with their own bios, contribution text, and TSC flags.

```json
{
  "name": "Person Name",
  "initials": "PN",
  "year": 2026,
  "bio": "Their public GitHub bio.",
  "contribution": "An optional, verified description of their contribution.",
  "color": "#7e8868",
  "github": "github-username",
  "avatar": "https://github.com/github-username.png"
}
```

`github`, `avatar`, `bio`, and `contribution` are optional. GitHub avatars are hotlinked using `https://github.com/<username>.png`, lazy-loaded, and cropped into circles. They reflect the current GitHub avatar and depend on GitHub availability; missing or failed images display initials. Names, usernames, and bios appear inside expandable profiles. Search matches names, usernames, bios, and any contribution text. No contribution claims have been inferred from GitHub bios. Each year needs its own entry for returning contributors; the year selector automatically expands when additional years are added.

Schemas are in `src/content.config.ts`, shared styles in `src/styles/global.css`, and the shared shell in `src/layouts/Layout.astro`. Stories and Stars use separate Astro content collections: https://docs.astro.build/en/guides/content-collections/.

## Design and hosting

The theme follows the current GraphQL website: locally hosted Host Grotesk and Commit Mono, Rhodamine pink accents, white editorial pages, and a near-black Stars gallery. The header and footer use the unmodified official GraphQL wordmark; the favicon uses the official hexagraph. Asset provenance and font licences are documented in `public/brand/README.md`. Native disclosure elements keep profiles usable without JavaScript. Search and year switching use a small client-side script.

TSC members are marked with `"tsc": true` on their annual Stars entry and receive a gold `#FFD700` avatar border. Membership is based on any overlap between their term and September 1 of the preceding year through August 31 of the class year (inclusive). Lee Byron’s chair role has no fixed term and qualifies for all three cohorts. Terms were checked against https://handbooks.graphql.org/tsc/members and its canonical source https://github.com/graphql/graphql-wg/blob/main/GraphQL-TSC.md on 2026-09-14.

The Stars loader reads year folders recursively. A person’s entry in one year is independent of their entry in another year. The initial 2024 and 2025 bios are current public GitHub bios, not historical snapshots; replace them with year-specific content when ready.
