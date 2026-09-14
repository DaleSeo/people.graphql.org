# People of GraphQL

An Astro publication for personal interviews and an annual GraphQL Stars gallery.

## Run locally

Use Node.js 22.19 or newer (required by a transitive dependency). The initial build was also verified on Node.js 22.14, which reports an engine warning.

```sh
npm install
npm run dev
```

Open http://localhost:4321. Run `npm run check` for Astro/TypeScript validation and `npm run build` to generate the static site in `dist/`. `npm run preview` serves that build locally.

## Pages

- `/`: editorial homepage with a featured story and Stars introduction.
- `/stories/`: interview archive.
- `/stories/[id]/`: individual Markdown stories.
- `/stars/`: year selection, search, and expandable contributor profiles.
- `/about/`: project introduction.

## Content

The initial three stories and twelve Stars are **fictional samples**, not actual interviews or award recipients. Initial artwork uses abstract initials, not real portraits. Replace sample entries before publishing; the intended annual gallery contains 52 confirmed people. The gallery count and year options come from its data.

### Stories

Add Markdown files to `src/content/stories/`. The filename becomes the URL slug. Frontmatter fields:

```yaml
---
title: A personal story headline
name: Interview subject
description: A short introduction to the story.
category: Community & belonging
color: '#797d67'
initials: IS
order: 0
sample: false
---
```

Write the approved article beneath the frontmatter. The lowest `order` is featured on the homepage. The current visual templates use initials artwork; replace this with approved portrait photography when available. Remove preview wording and placeholder reading times in the homepage/archive/article templates when preparing actual publication.

### Stars

Add one JSON file per person and year in `src/content/stars/`. For example, `2026-person-name.json`:

```json
{
  "name": "Person Name",
  "initials": "PN",
  "year": 2026,
  "contribution": "A brief, verified description of their contribution.",
  "color": "#7e8868",
  "github": "github-username",
  "avatar": "https://example.org/approved-portrait.jpg",
  "sample": false
}
```

`github` and `avatar` are optional. With no avatar the profile displays initials. Each year needs its own entry for returning contributors. The year selector automatically expands when additional years are added. Remove the sample-gallery notice when replacing the samples with verified entries.

Schemas are in `src/content.config.ts`, shared styles in `src/styles/global.css`, and the shared shell in `src/layouts/Layout.astro`. Stories and Stars use separate Astro content collections: https://docs.astro.build/en/guides/content-collections/.

## Design and hosting

Warm paper colours and large serif headlines prioritise stories; the Stars gallery uses a separate dark green palette. Native disclosure elements keep profiles usable without JavaScript. Search and year switching use a small client-side script. Google Fonts provides DM Sans and Libre Caslon Display with system fallbacks; self-host fonts if preferred.

The site builds as static HTML and can be deployed to any static host. No hosting provider or domain is configured yet. The design takes its editorial direction from the brief; it does not reproduce or republish GitHub ReadME content.
